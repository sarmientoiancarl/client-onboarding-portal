import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { registerProvider } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await registerProvider(form.name, form.email, form.password);
      if (res.success) {
        localStorage.setItem(
          'provider',
          JSON.stringify({ name: res.name, token: res.token, portalLink: res.portalLink })
        );
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed. Please try again.');
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
            Create account
          </h1>
          <p className="text-sm mb-8" style={{ color: '#FEFEFE66' }}>
            Set up your provider account and start onboarding clients today.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label: 'Full name', name: 'name', type: 'text', placeholder: 'Juan dela Cruz' },
              { label: 'Email address', name: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'At least 6 characters' },
              { label: 'Confirm password', name: 'confirm', type: 'password', placeholder: 'Repeat your password' },
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: '#FEFEFE99' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required
                  className="rounded-lg px-4 py-2.5 text-sm focus:outline-none transition"
                  style={{
                    backgroundColor: '#FEFEFE08',
                    border: '1px solid #FEFEFE22',
                    color: '#FEFEFE',
                  }}
                />
              </div>
            ))}

            {error && (
              <div
                className="rounded-lg px-4 py-3"
                style={{ backgroundColor: '#FF000011', border: '1px solid #FF000033' }}
              >
                <p className="text-xs" style={{ color: '#FF6B6B' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg text-sm font-medium transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: '#FEFEFE33' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#FEFEFE66' }}>
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}