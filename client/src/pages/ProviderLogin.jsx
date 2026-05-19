import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { loginProvider } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/theme';

export default function ProviderLogin() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const c = t(theme);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginProvider(form.email, form.password);
      if (res.success) {
        localStorage.setItem('provider', JSON.stringify({ name: res.name, token: res.token, portalLink: res.portalLink }));
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: c.bgInput,
    border: `1px solid ${c.borderMid}`,
    color: c.textPrimary,
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
      <Navbar />
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1
            className="text-5xl mb-2"
            style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
          >
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: c.textSecondary }}>
            Sign in to access your dashboard and manage your clients.
          </p>

          <div
            className="rounded-lg px-4 py-3 mb-6"
            style={{ backgroundColor: c.accentBg, border: `1px solid ${c.accentBorder}` }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: c.accentText }}>Demo credentials</p>
            <p className="text-xs" style={{ color: c.textSecondary }}>
              Email: <span className="font-mono" style={{ color: c.textPrimary }}>demo@provider.com</span>
            </p>
            <p className="text-xs" style={{ color: c.textSecondary }}>
              Password: <span className="font-mono" style={{ color: c.textPrimary }}>demo1234</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label: 'Email address', name: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Enter your password' },
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: c.textSecondary }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required
                  style={inputStyle}
                />
              </div>
            ))}

            {error && (
              <div className="rounded-lg px-4 py-3" style={{ backgroundColor: c.errorBg, border: `1px solid ${c.errorBorder}` }}>
                <p className="text-xs" style={{ color: c.errorText }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg text-sm font-medium transition mt-2 disabled:opacity-50"
              style={{ backgroundColor: c.accent, color: '#FEFEFE' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: c.textFaint }}>
            Not a provider?{' '}
            <Link to="/" style={{ color: c.textSecondary }}>Go back home</Link>
            {' · '}
            <Link to="/register" style={{ color: c.textSecondary }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}