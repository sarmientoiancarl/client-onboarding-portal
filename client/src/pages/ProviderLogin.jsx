import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { loginProvider } from '../services/api';

export default function ProviderLogin() {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          <h1
            className="text-5xl mb-2"
            style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
          >
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: '#FEFEFE66' }}>
            Sign in to access your dashboard and manage your clients.
          </p>

          {/* Demo hint */}
          <div
            className="rounded-lg px-4 py-3 mb-6"
            style={{ backgroundColor: '#6CE9FE11', border: '1px solid #6CE9FE33' }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: '#6CE9FE' }}>
              Demo credentials
            </p>
            <p className="text-xs" style={{ color: '#FEFEFE66' }}>
              Email:{' '}
              <span className="font-mono" style={{ color: '#FEFEFE' }}>
                demo@provider.com
              </span>
            </p>
            <p className="text-xs" style={{ color: '#FEFEFE66' }}>
              Password:{' '}
              <span className="font-mono" style={{ color: '#FEFEFE' }}>
                demo1234
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: '#FEFEFE99' }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="rounded-lg px-4 py-2.5 text-sm focus:outline-none transition"
                style={{
                  backgroundColor: '#FEFEFE08',
                  border: '1px solid #FEFEFE22',
                  color: '#FEFEFE',
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: '#FEFEFE99' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="rounded-lg px-4 py-2.5 text-sm focus:outline-none transition"
                style={{
                  backgroundColor: '#FEFEFE08',
                  border: '1px solid #FEFEFE22',
                  color: '#FEFEFE',
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-lg px-4 py-3"
                style={{ backgroundColor: '#FF000011', border: '1px solid #FF000033' }}
              >
                <p className="text-xs" style={{ color: '#FF6B6B' }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg text-sm font-medium transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: '#FEFEFE33' }}>
            Not a provider?{' '}
            <Link to="/" style={{ color: '#FEFEFE66' }}>
              Go back home
            </Link>
            {' · '}
            <Link to="/register" style={{ color: '#FEFEFE66' }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}