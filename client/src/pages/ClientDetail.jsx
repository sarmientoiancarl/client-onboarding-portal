import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import ClientModal from '../components/ClientModal';
import { exportClientPDF } from '../utils/exportPdf';
import { getClients, getSubmissionByClientId, getFormTemplate, updateClient, deleteClient } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/theme';

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const c = t(theme);
  const [client, setClient] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('provider');
    if (!stored) { navigate('/login'); return; }

    const fetchData = async () => {
      try {
        const [clients, sub, tmpl] = await Promise.all([
          getClients(),
          getSubmissionByClientId(clientId),
          getFormTemplate(),
        ]);
        const found = clients.find((c) => c.id === clientId);
        if (!found) { navigate('/dashboard'); return; }
        setClient(found);
        setSubmission(sub);
        setTemplate(tmpl);
      } catch (err) {
        console.error('Failed to load client detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId, navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleUpdate = async (form) => {
    const updated = await updateClient(clientId, form);
    setClient((prev) => ({ ...prev, ...updated }));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteClient(clientId);
      navigate('/dashboard');
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
          <p className="text-sm" style={{ color: c.textMuted }}>Loading client details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
      <Navbar isProvider />

      {/* Edit Modal */}
      {modal && (
        <ClientModal
          mode="edit"
          client={client}
          onClose={() => setModal(false)}
          onSave={handleUpdate}
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
              <span style={{ color: c.textPrimary }}>{client.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-lg text-sm transition"
                style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

        <Link to="/dashboard" className="text-sm transition" style={{ color: c.textMuted }}>
          Back to dashboard
        </Link>

        {/* Client header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1
                className="text-4xl"
                style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
              >
                {client.name}
              </h1>
              <StatusBadge status={client.status} />
            </div>
            <p className="text-sm" style={{ color: c.textSecondary }}>{client.business}</p>
            <p className="text-xs" style={{ color: c.textMuted }}>{client.email}</p>
          </div>
          <div className="flex gap-2 self-start">
            <button
              onClick={() => setModal(true)}
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{ border: `1px solid ${c.deleteBorder}`, color: c.deleteText }}
            >
              Delete
            </button>
            <button
              onClick={() => exportClientPDF(client, template, submission)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{ backgroundColor: c.accent, color: '#FEFEFE' }}
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Submission info */}
        <div
          className="rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}` }}
        >
          <div>
            <p className="text-xs mb-1" style={{ color: c.textMuted }}>Submitted on</p>
            <p className="text-sm font-medium" style={{ color: c.textPrimary }}>
              {formatDate(client.submittedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: c.textMuted }}>Portal link</p>
            <p className="text-sm font-mono" style={{ color: c.accentText }}>{client.portalLink}</p>
          </div>
        </div>

        {/* Brief or not submitted */}
        {submission && template ? (
          <div className="flex flex-col gap-8">

            <div>
              <h2 className="text-base font-medium mb-4" style={{ color: c.textPrimary }}>
                Project brief
              </h2>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
                {template.fields
                  .filter((field) => field.type !== 'file')
                  .map((field, idx) => (
                    <div
                      key={field.id}
                      className="flex flex-col sm:flex-row px-6 py-4 gap-1 sm:gap-8"
                      style={{
                        borderTop: idx === 0 ? 'none' : `1px solid ${c.border}`,
                        backgroundColor: idx % 2 === 0 ? c.bgCard : c.bgCardAlt,
                      }}
                    >
                      <p
                        className="text-xs font-medium sm:w-40 shrink-0 pt-0.5"
                        style={{ color: c.textMuted }}
                      >
                        {field.label}
                      </p>
                      <p className="text-sm flex-1" style={{ color: c.textPrimary }}>
                        {submission.answers?.get
                          ? submission.answers.get(field.id)
                          : submission.answers?.[field.id] || (
                              <span style={{ color: c.textFaint, fontStyle: 'italic' }}>
                                No answer provided
                              </span>
                            )}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {submission.files && submission.files.length > 0 && (
              <div>
                <h2 className="text-base font-medium mb-4" style={{ color: c.textPrimary }}>
                  Uploaded files
                </h2>
                <div className="flex flex-col gap-3">
                  {submission.files.map((file) => {
                    const isImage = file.mimetype?.startsWith('image/');
                    return (
                      <div
                        key={file.filename}
                        className="flex items-center justify-between rounded-xl px-5 py-4"
                        style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}` }}
                      >
                        <div className="flex items-center gap-4">
                          {isImage ? (
                            <img
                              src={file.url}
                              alt={file.originalName}
                              className="w-12 h-12 rounded-lg object-cover"
                              style={{ border: `1px solid ${c.border}` }}
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: c.accentBg, border: `1px solid ${c.accentBorder}` }}
                            >
                              <svg className="w-5 h-5" fill="none" stroke={c.accentText} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium" style={{ color: c.textPrimary }}>
                              {file.originalName}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                              {file.mimetype} · {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.originalName} className="text-xs px-3 py-1.5 rounded-lg transition" style={{ backgroundColor: c.accentBg, color: c.accentText, border: `1px solid ${c.accentBorder}` }}>
                          Download
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div
            className="rounded-xl px-6 py-12 text-center"
            style={{ border: `1px solid ${c.border}` }}
          >
            <p className="text-sm mb-4" style={{ color: c.textMuted }}>
              This client has not submitted their brief yet.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/client-onboarding-portal/portal/${client.portalLink}`
                );
                alert('Portal link copied! Send this to your client.');
              }}
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
            >
              Copy portal link
            </button>
          </div>
        )}

      </div>
    </div>
  );
}