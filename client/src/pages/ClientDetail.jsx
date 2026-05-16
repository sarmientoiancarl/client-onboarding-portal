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
    if (!stored) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [clients, sub, tmpl] = await Promise.all([
          getClients(),
          getSubmissionByClientId(clientId),
          getFormTemplate(),
        ]);
        const found = clients.find((c) => c.id === clientId);
        if (!found) {
          navigate('/dashboard');
          return;
        }
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar isProvider />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">Loading client details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar isProvider />

      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Back */}
        <Link
          to="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-900 transition flex items-center gap-1"
        >
          ← Back to dashboard
        </Link>

        {/* Client header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <StatusBadge status={client.status} />
            </div>
            <p className="text-sm text-gray-500">{client.business}</p>
            <p className="text-sm text-gray-400">{client.email}</p>
          </div>
          <button
            onClick={handlePrint}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition self-start"
          >
            Export PDF
          </button>
        </div>

        {/* Submission info */}
        <div className="bg-gray-50 rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400">Submitted on</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(client.submittedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Portal link</p>
            <p className="text-sm font-mono text-gray-600">{client.portalLink}</p>
          </div>
        </div>

        {/* Brief answers */}
        {submission && template ? (
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Project brief
            </h2>
            <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {template.fields.map((field) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row px-6 py-4 gap-1 sm:gap-8"
                >
                  <p className="text-xs font-medium text-gray-400 sm:w-40 shrink-0 pt-0.5">
                    {field.label}
                  </p>
                  <p className="text-sm text-gray-800 flex-1">
                    {submission.answers[field.id] || (
                      <span className="text-gray-400 italic">No answer provided</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl px-6 py-12 text-center">
            <p className="text-sm text-gray-400">
              This client has not submitted their brief yet.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/client-onboarding-portal/portal/${client.portalLink}`
                );
                alert('Portal link copied! Send this to your client.');
              }}
              className="mt-4 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Copy portal link
            </button>
          </div>
        )}

      </div>
    </div>
  );
}