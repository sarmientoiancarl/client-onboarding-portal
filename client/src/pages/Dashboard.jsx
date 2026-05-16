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
    if (!stored) { navigate('/login'); return; }
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
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
        <Navbar isProvider />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm" style={{ color: '#FEFEFE33' }}>Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
      <Navbar isProvider />

      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-5xl"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
            >
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: '#FEFEFE66' }}>
              Welcome back, {provider?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const stored = localStorage.getItem('provider');
                const portalLink = stored ? JSON.parse(stored).portalLink : null;
                if (!portalLink) {
                  alert('No portal link found. Please log in again.');
                  return;
                }
                navigator.clipboard.writeText(
                  `${window.location.origin}/client-onboarding-portal/portal/${portalLink}`
                );
                alert('Portal link copied!');
              }}
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{ border: '1px solid #FEFEFE22', color: '#FEFEFE66' }}
            >
              Copy portal link
            </button>
            <Link
              to="/form-builder"
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
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
              className="rounded-xl px-6 py-5 flex flex-col gap-1"
              style={{ backgroundColor: '#FEFEFE08', border: '1px solid #FEFEFE11' }}
            >
              <span className="text-xs" style={{ color: '#FEFEFE44' }}>{stat.label}</span>
              <span
                className="text-3xl"
                style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#6CE9FE' }}
              >
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
            className="flex-1 rounded-lg px-4 py-2.5 text-sm focus:outline-none transition"
            style={{
              backgroundColor: '#FEFEFE08',
              border: '1px solid #FEFEFE22',
              color: '#FEFEFE',
            }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg px-4 py-2.5 text-sm focus:outline-none transition"
            style={{
              backgroundColor: '#FEFEFE08',
              border: '1px solid #FEFEFE22',
              color: '#FEFEFE',
            }}
          >
            <option value="all" style={{ backgroundColor: '#0F0F0F' }}>All statuses</option>
            <option value="completed" style={{ backgroundColor: '#0F0F0F' }}>Completed</option>
            <option value="pending" style={{ backgroundColor: '#0F0F0F' }}>Pending</option>
          </select>
        </div>

        {/* Client list */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: '#FEFEFE33' }}>No clients found.</p>
            </div>
          ) : (
            filtered.map((client) => (
              <Link
                to={`/client/${client.id}`}
                key={client.id}
                className="rounded-xl px-6 py-5 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{ border: '1px solid #FEFEFE11', backgroundColor: '#FEFEFE05' }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: '#FEFEFE' }}>
                      {client.name}
                    </span>
                    <StatusBadge status={client.status} />
                  </div>
                  <span className="text-sm" style={{ color: '#FEFEFE66' }}>{client.business}</span>
                  <span className="text-xs" style={{ color: '#FEFEFE44' }}>{client.email}</span>
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-xs" style={{ color: '#FEFEFE44' }}>
                    {client.status === 'completed' ? 'Submitted' : 'Not yet submitted'}
                  </span>
                  <span className="text-xs" style={{ color: '#FEFEFE66' }}>
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