import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getFormTemplates, createFormTemplate, deleteFormTemplate } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/theme';

export default function TemplateManager() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const c = t(theme);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('provider') || sessionStorage.getItem('provider');
    if (!stored) { navigate('/login'); return; }

    const fetchTemplates = async () => {
      try {
        const data = await getFormTemplates();
        setTemplates(data);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [navigate]);

  const handleCreate = async () => {
    if (!newTitle.trim()) { setError('Please enter a form title.'); return; }
    setCreating(true);
    setError('');
    try {
      const newTemplate = await createFormTemplate(newTitle.trim());
      setTemplates((prev) => [...prev, newTemplate]);
      setNewTitle('');
      setShowCreate(false);
      navigate(`/form-builder/${newTemplate._id}`);
    } catch (err) {
      setError('Failed to create template. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (templateId) => {
    setDeleting(true);
    try {
      await deleteFormTemplate(templateId);
      setTemplates((prev) => prev.filter((t) => t._id !== templateId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const inputStyle = {
    backgroundColor: c.bgInput,
    border: `1px solid ${c.borderMid}`,
    color: c.textPrimary,
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
        <Navbar isProvider />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm" style={{ color: c.textMuted }}>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
      <Navbar isProvider />

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
              Delete template?
            </h2>
            <p className="text-sm" style={{ color: c.textSecondary }}>
              Are you sure you want to delete{' '}
              <span style={{ color: c.textPrimary }}>{confirmDelete.title}</span>?
              This cannot be undone.
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
                onClick={() => handleDelete(confirmDelete._id)}
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

      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="text-sm transition mb-2 inline-block"
              style={{ color: c.textMuted }}
            >
              Back to dashboard
            </Link>
            <h1
              className="text-5xl"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
            >
              Form Templates
            </h1>
            <p className="text-sm mt-1" style={{ color: c.textSecondary }}>
              Create and manage intake forms for each of your services.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition self-start sm:self-auto"
            style={{ backgroundColor: c.accent, color: c.accentFg }}
          >
            New template
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div
            className="rounded-xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}` }}
          >
            <h2 className="text-base font-medium" style={{ color: c.textPrimary }}>
              New template
            </h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: c.textSecondary }}>
                Template name
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => { setNewTitle(e.target.value); setError(''); }}
                placeholder="e.g. Logo Design Intake, Web Development Brief"
                style={inputStyle}
                autoFocus
              />
            </div>
            {error && (
              <div
                className="rounded-lg px-4 py-3"
                style={{ backgroundColor: c.errorBg, border: `1px solid ${c.errorBorder}` }}
              >
                <p className="text-xs" style={{ color: c.errorText }}>{error}</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowCreate(false); setNewTitle(''); setError(''); }}
                className="px-4 py-2 rounded-lg text-sm transition"
                style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                style={{ backgroundColor: c.accent, color: c.accentFg }}
              >
                {creating ? 'Creating...' : 'Create and edit'}
              </button>
            </div>
          </div>
        )}

        {/* Templates list */}
        <div className="flex flex-col gap-3">
          {templates.length === 0 ? (
            <div
              className="rounded-xl px-6 py-16 text-center"
              style={{ border: `1px dashed ${c.borderMid}` }}
            >
              <p className="text-sm mb-4" style={{ color: c.textMuted }}>
                No templates yet. Create your first one.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{ backgroundColor: c.accent, color: c.accentFg }}
              >
                New template
              </button>
            </div>
          ) : (
            templates.map((tmpl, idx) => (
              <div
                key={tmpl._id}
                className="rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}` }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                      {tmpl.title}
                    </p>
                    {idx === 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: c.accentBg, color: c.accentText, border: `1px solid ${c.accentBorder}` }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: c.textMuted }}>
                    {tmpl.fields?.length || 0} fields
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/form-builder/${tmpl._id}`}
                    className="text-xs px-3 py-1.5 rounded-lg transition"
                    style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setConfirmDelete(tmpl)}
                    disabled={templates.length === 1}
                    className="text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ border: `1px solid ${c.deleteBorder}`, color: c.deleteText }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info card */}
        <div
          className="rounded-xl px-6 py-4"
          style={{ backgroundColor: c.accentBg, border: `1px solid ${c.accentBorder}` }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: c.accentText }}>
            How templates work
          </p>
          <p className="text-xs leading-relaxed" style={{ color: c.textSecondary }}>
            When a client visits your portal link, they see all your templates as
            service options and pick the one that matches their needs. The first
            template in the list is shown as the default.
          </p>
        </div>

      </div>
    </div>
  );
}