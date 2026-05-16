import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { getClients } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const stored = localStorage.getItem('provider');
    if (!stored) {
      navigate('/login');
      return;
    }
    setProvider(JSON.parse(stored));

    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [navigate]);

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.business.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const total = clients.length;
  const completed = clients.filter((c) => c.status === 'completed').length;
  const pending = clients.filter((c) => c.status === 'pending').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar isProvider />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar isProvider />

      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {provider?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/client-onboarding-portal/portal/demo-001`
                );
                alert('Portal link copied to clipboard!');
              }}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Copy portal link
            </button>
            <Link
              to="/form-builder"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
            >
              Edit form
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total clients', value: total },
            { label: 'Completed', value: completed },
            { label: 'Pending', value: pending },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-50 rounded-xl px-6 py-5 flex flex-col gap-1"
            >
              <span className="text-xs text-gray-500">{stat.label}</span>
              <span className="text-2xl font-bold text-gray-900">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name, business, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Client list */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-400">No clients found.</p>
            </div>
          ) : (
            filtered.map((client) => (
              <Link
                to={`/client/${client.id}`}
                key={client.id}
                className="border border-gray-200 rounded-xl px-6 py-5 hover:border-gray-300 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {client.name}
                    </span>
                    <StatusBadge status={client.status} />
                  </div>
                  <span className="text-sm text-gray-500">{client.business}</span>
                  <span className="text-xs text-gray-400">{client.email}</span>
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-xs text-gray-400">
                    {client.status === 'completed' ? 'Submitted' : 'Not yet submitted'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(client.submittedAt)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>
    </div>
  );
}