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
        localStorage.setItem('provider', JSON.stringify({ name: res.name, token: res.token }));
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Provider login
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to access your dashboard and manage your clients.
            </p>
          </div>

          {/* Demo hint */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-xs text-gray-500 font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-gray-600">
              Email: <span className="font-mono text-gray-800">demo@provider.com</span>
            </p>
            <p className="text-xs text-gray-600">
              Password: <span className="font-mono text-gray-800">demo1234</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Back to home */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Not a provider?{' '}
            <Link to="/" className="text-gray-600 hover:text-gray-900 underline">
              Go back home
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}