import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { getClients, getSubmissionByClientId, getFormTemplate } from '../services/api';

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
        <Navbar isProvider />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm" style={{ color: '#FEFEFE33' }}>Loading client details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
      <Navbar isProvider />

      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        <Link
          to="/dashboard"
          className="text-sm transition"
          style={{ color: '#FEFEFE44' }}
        >
          ← Back to dashboard
        </Link>

        {/* Client header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1
                className="text-4xl"
                style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
              >
                {client.name}
              </h1>
              <StatusBadge status={client.status} />
            </div>
            <p className="text-sm" style={{ color: '#FEFEFE66' }}>{client.business}</p>
            <p className="text-xs" style={{ color: '#FEFEFE44' }}>{client.email}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg text-sm transition self-start"
            style={{ border: '1px solid #FEFEFE22', color: '#FEFEFE66' }}
          >
            Export PDF
          </button>
        </div>

        {/* Submission info */}
        <div
          className="rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{ backgroundColor: '#FEFEFE08', border: '1px solid #FEFEFE11' }}
        >
          <div>
            <p className="text-xs mb-1" style={{ color: '#FEFEFE44' }}>Submitted on</p>
            <p className="text-sm font-medium" style={{ color: '#FEFEFE' }}>
              {formatDate(client.submittedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: '#FEFEFE44' }}>Portal link</p>
            <p className="text-sm font-mono" style={{ color: '#6CE9FE' }}>{client.portalLink}</p>
          </div>
        </div>

        {/* Brief answers */}
        {submission && template ? (
          <div>
            <h2
              className="text-base font-medium mb-4"
              style={{ color: '#FEFEFE' }}
            >
              Project brief
            </h2>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid #FEFEFE11' }}
            >
              {template.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row px-6 py-4 gap-1 sm:gap-8"
                  style={{
                    borderTop: idx === 0 ? 'none' : '1px solid #FEFEFE08',
                    backgroundColor: idx % 2 === 0 ? '#FEFEFE05' : 'transparent',
                  }}
                >
                  <p className="text-xs font-medium sm:w-40 shrink-0 pt-0.5" style={{ color: '#FEFEFE44' }}>
                    {field.label}
                  </p>
                  <p className="text-sm flex-1" style={{ color: '#FEFEFE' }}>
                    {submission.answers[field.id] || (
                      <span style={{ color: '#FEFEFE33', fontStyle: 'italic' }}>No answer provided</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl px-6 py-12 text-center"
            style={{ border: '1px solid #FEFEFE11' }}
          >
            <p className="text-sm mb-4" style={{ color: '#FEFEFE44' }}>
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
              style={{ border: '1px solid #FEFEFE22', color: '#FEFEFE66' }}
            >
              Copy portal link
            </button>
          </div>
        )}

      </div>
    </div>
  );
}