import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import ClientModal from '../components/ClientModal';
import { getClients, createClient, updateClient, deleteClient } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/theme';

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const c = t(theme);
  const [provider] = useState(() => {
    const stored = localStorage.getItem('provider') || sessionStorage.getItem('provider');
    return stored ? JSON.parse(stored) : null;
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!provider) { navigate('/login'); return; }

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
  }, [navigate, provider]);

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
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const handleCreate = async (form) => {
    const newClient = await createClient(form);
    setClients((prev) => [newClient, ...prev]);
  };

  const handleUpdate = async (form) => {
    const updated = await updateClient(modal.client.id, form);
    setClients((prev) =>
      prev.map((cl) => (cl.id === modal.client.id ? { ...cl, ...updated } : cl))
    );
  };

  const handleDelete = async (clientId) => {
    setDeleting(true);
    try {
      await deleteClient(clientId);
      setClients((prev) => prev.filter((cl) => cl.id !== clientId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
        <Navbar isProvider />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm" style={{ color: c.textMuted }}>Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
      <Navbar isProvider />

      {/* Create/Edit Modal */}
      {modal && (
        <ClientModal
          mode={modal.mode}
          client={modal.client}
          onClose={() => setModal(null)}
          onSave={modal.mode === 'create' ? handleCreate : handleUpdate}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: '#0F0F0Fee' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}` }}
          >
            <h2
              className="text-2xl"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
            >
              Delete client?
            </h2>
            <p className="text-sm" style={{ color: c.textSecondary }}>
              Are you sure you want to delete{' '}
              <span style={{ color: c.textPrimary }}>{confirmDelete.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm transition"
                style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                style={{ backgroundColor: c.deleteBg, color: c.deleteText, border: `1px solid ${c.deleteBorder}` }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-5xl"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
            >
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: c.textSecondary }}>
              Welcome back, {provider?.name}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                const stored = localStorage.getItem('provider') || sessionStorage.getItem('provider');
                const portalLink = stored ? JSON.parse(stored).portalLink : null;
                if (!portalLink) { alert('No portal link found. Please log in again.'); return; }
                navigator.clipboard.writeText(
                  `${window.location.origin}/client-onboarding-portal/portal/${portalLink}`
                );
                alert('Portal link copied!');
              }}
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
            >
              Copy portal link
            </button>
            <Link
              to="/templates"
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
            >
              Manage forms
            </Link>
            <button
              onClick={() => setModal({ mode: 'create', client: null })}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{ backgroundColor: c.accent, color: c.accentFg }}
            >
              Add client
            </button>
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
              style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}` }}
            >
              <span className="text-xs" style={{ color: c.textMuted }}>{stat.label}</span>
              <span
                className="text-3xl"
                style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.accentText }}
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
              backgroundColor: c.bgInput,
              border: `1px solid ${c.borderMid}`,
              color: c.textPrimary,
            }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg px-4 py-2.5 text-sm focus:outline-none transition"
            style={{
              backgroundColor: c.bgCard,
              border: `1px solid ${c.borderMid}`,
              color: c.textPrimary,
            }}
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
              <p className="text-sm" style={{ color: c.textMuted }}>No clients found.</p>
            </div>
          ) : (
            filtered.map((client) => (
              <div
                key={client.id}
                className="rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{ border: `1px solid ${c.border}`, backgroundColor: c.bgCard }}
              >
                <Link to={`/client/${client.id}`} className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                      {client.name}
                    </span>
                    <StatusBadge status={client.status} />
                  </div>
                  <span className="text-sm" style={{ color: c.textSecondary }}>{client.business}</span>
                  {client.formTitle && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full self-start"
                      style={{ backgroundColor: c.accentBg, color: c.accentText, border: `1px solid ${c.accentBorder}` }}
                    >
                      {client.formTitle}
                    </span>
                  )}
                </Link>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs" style={{ color: c.textMuted }}>
                      {client.status === 'completed' ? 'Submitted' : 'Not yet submitted'}
                    </span>
                    <span className="text-xs" style={{ color: c.textSecondary }}>
                      {formatDate(client.submittedAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModal({ mode: 'edit', client })}
                      className="text-xs px-3 py-1.5 rounded-lg transition"
                      style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(client)}
                      className="text-xs px-3 py-1.5 rounded-lg transition"
                      style={{ border: `1px solid ${c.deleteBorder}`, color: c.deleteText }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}