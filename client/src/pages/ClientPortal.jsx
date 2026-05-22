import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getFormTemplatesByPortalLink, submitForm } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/theme';

export default function ClientPortal() {
  const { portalLink } = useParams();
  const { theme } = useTheme();
  const c = t(theme);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [stage, setStage] = useState('pick');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const STEPS_PER_PAGE = 3;

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getFormTemplatesByPortalLink(portalLink);
        const list = Array.isArray(data) ? data : [data];
        setTemplates(list);
        if (list.length === 1) {
          setSelectedTemplate(list[0]);
          setStage('intro');
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [portalLink]);

  const handleSelectTemplate = (tmpl) => {
    setSelectedTemplate(tmpl);
    setAnswers({});
    setFiles({});
    setStep(0);
    setStage('intro');
  };

  const handleChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setError('');
  };

  const handleFileChange = (fieldId, file) => {
    setFiles((prev) => ({ ...prev, [fieldId]: file }));
    setError('');
  };

  const totalSteps = selectedTemplate
    ? Math.ceil(selectedTemplate.fields.length / STEPS_PER_PAGE)
    : 0;

  const currentFields = selectedTemplate
    ? selectedTemplate.fields.slice(step * STEPS_PER_PAGE, (step + 1) * STEPS_PER_PAGE)
    : [];

  const validateStep = () => {
    for (const field of currentFields) {
      if (field.required && field.type !== 'file' && !answers[field.id]?.trim()) {
        setError(`"${field.label}" is required.`);
        return false;
      }
      if (field.required && field.type === 'file' && !files[field.id]) {
        setError(`Please upload a file for "${field.label}".`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => { if (!validateStep()) return; setStep((p) => p + 1); setError(''); };
  const handleBack = () => { setStep((p) => p - 1); setError(''); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await submitForm({ portalLink, templateId: selectedTemplate._id, answers }, files);
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: c.bgInput,
    border: `1px solid ${c.borderMid}`,
    color: c.textPrimary,
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm" style={{ color: c.textMuted }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Service picker ────────────────────────────────────────
  if (stage === 'pick') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-lg flex flex-col gap-8">

            <div>
              <h1
                className="text-5xl mb-3"
                style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
              >
                What can we help you with?
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
                Select the service you need and we'll guide you through a quick intake form.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {templates.map((tmpl) => (
                <button
                  key={tmpl._id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="w-full text-left rounded-xl px-6 py-5 transition"
                  style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}` }}
                >
                  <p className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                    {tmpl.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: c.textMuted }}>
                    {tmpl.fields?.length || 0} questions · takes about 3-5 minutes
                  </p>
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Intro screen ──────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-lg flex flex-col gap-8">

            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl self-start"
              style={{ backgroundColor: c.accentBg, border: `1px solid ${c.accentBorder}` }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: c.accentBg }}
              >
                <svg className="w-4 h-4" fill="none" stroke={c.accentText} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: c.accentText }}>
                  You have been invited by a provider
                </p>
                <p className="text-xs" style={{ color: c.textMuted }}>
                  Portal: {portalLink}
                </p>
              </div>
            </div>

            <div>
              <h1
                className="text-5xl mb-3"
                style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
              >
                {selectedTemplate.title}
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
                Before we get started, here is a quick overview of what to expect.
              </p>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${c.border}` }}
            >
              <div
                className="px-5 py-3"
                style={{ backgroundColor: c.bgCard, borderBottom: `1px solid ${c.border}` }}
              >
                <p className="text-xs font-medium" style={{ color: c.textMuted }}>
                  WHAT TO EXPECT
                </p>
              </div>
              {[
                {
                  title: `${selectedTemplate.fields.length} questions total`,
                  description: 'Broken into short steps so it never feels overwhelming.',
                },
                {
                  title: 'Takes about 3 to 5 minutes',
                  description: 'Most clients finish in under 5 minutes.',
                },
                {
                  title: 'Your answers are private',
                  description: 'Only your provider can see your submitted brief.',
                },
                {
                  title: 'File uploads supported',
                  description: 'You can attach logos, reference images, or documents.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 px-5 py-4"
                  style={{
                    borderTop: idx === 0 ? 'none' : `1px solid ${c.border}`,
                    backgroundColor: idx % 2 === 0 ? c.bgCard : c.bgCardAlt,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: c.accentBg }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke={c.accentText} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: c.textPrimary }}>
                      {item.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs" style={{ color: c.textMuted }}>
              Fields marked with{' '}
              <span style={{ color: c.accentText }}>*</span>
              {' '}are required.
            </p>

            <div className="flex gap-3">
              {templates.length > 1 && (
                <button
                  onClick={() => setStage('pick')}
                  className="px-5 py-3 rounded-lg text-sm transition"
                  style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
                >
                  Back
                </button>
              )}
              <button
                onClick={() => setStage('form')}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition"
                style={{ backgroundColor: c.accent, color: c.accentFg }}
              >
                Start filling out the form
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Submitted screen ──────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: c.accentBg }}
            >
              <svg className="w-8 h-8" fill="none" stroke={c.accentText} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1
              className="text-4xl"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
            >
              Brief submitted!
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: c.textSecondary }}>
              Thank you for completing the intake form. Your provider will review
              your brief and get back to you shortly.
            </p>
            <div
              className="rounded-xl px-6 py-4 w-full text-left mt-2"
              style={{ border: `1px solid ${c.border}`, backgroundColor: c.bgCard }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: c.textMuted }}>
                Service selected
              </p>
              <p className="text-sm font-medium mb-4" style={{ color: c.accentText }}>
                {selectedTemplate.title}
              </p>
              <p className="text-xs font-medium mb-3" style={{ color: c.textMuted }}>
                Your answers
              </p>
              {selectedTemplate.fields.map((field) => (
                <div key={field.id} className="mb-3">
                  <p className="text-xs mb-0.5" style={{ color: c.textMuted }}>{field.label}</p>
                  {field.type === 'file' ? (
                    <p className="text-sm" style={{ color: c.accentText }}>
                      {files[field.id]?.name || '---'}
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: c.textPrimary }}>
                      {answers[field.id] || '---'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form screen ───────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
      <Navbar />

      <div className="flex flex-1 items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg flex flex-col gap-8">

          <div>
            <p className="text-xs mb-1" style={{ color: c.accentText }}>
              {selectedTemplate.title}
            </p>
            <h1
              className="text-4xl mb-1"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
            >
              Client Intake Form
            </h1>
            <p className="text-sm" style={{ color: c.textSecondary }}>
              Please fill out the form below so your provider can prepare the best brief for your project.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs" style={{ color: c.textMuted }}>
              <span>Step {step + 1} of {totalSteps}</span>
              <span>{Math.round(((step + 1) / totalSteps) * 100)}% complete</span>
            </div>
            <div className="w-full rounded-full h-1" style={{ backgroundColor: c.bgCardAlt }}>
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / totalSteps) * 100}%`, backgroundColor: c.accent }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {currentFields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: c.textSecondary }}>
                  {field.label}
                  {field.required && (
                    <span style={{ color: c.accentText }} className="ml-1">*</span>
                  )}
                </label>

                {field.type === 'file' ? (
                  <div>
                    <label
                      htmlFor={field.id}
                      className="flex flex-col items-center justify-center gap-2 rounded-lg cursor-pointer transition"
                      style={{
                        border: `1px dashed ${c.borderMid}`,
                        backgroundColor: files[field.id] ? c.accentBg : c.bgCard,
                        padding: '24px 16px',
                      }}
                    >
                      {files[field.id] ? (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke={c.accentText} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium" style={{ color: c.accentText }}>
                            {files[field.id].name}
                          </p>
                          <p className="text-xs" style={{ color: c.textMuted }}>
                            {formatFileSize(files[field.id].size)} · Click to change
                          </p>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke={c.textMuted} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <p className="text-sm" style={{ color: c.textMuted }}>Click to upload a file</p>
                          <p className="text-xs" style={{ color: c.textFaint }}>
                            JPG, PNG, WebP, PDF, DOCX · Max 5MB
                          </p>
                        </>
                      )}
                    </label>
                    <input
                      id={field.id}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.docx"
                      onChange={(e) => handleFileChange(field.id, e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    placeholder={field.placeholder}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={answers[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    style={{ ...inputStyle, backgroundColor: c.bgCard }}
                  >
                    <option value="">Select an option</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div
              className="rounded-lg px-4 py-3"
              style={{ backgroundColor: c.errorBg, border: `1px solid ${c.errorBorder}` }}
            >
              <p className="text-xs" style={{ color: c.errorText }}>{error}</p>
            </div>
          )}

          <div className="flex justify-between gap-3">
            <button
              onClick={step === 0 ? () => setStage('intro') : handleBack}
              className="px-5 py-2.5 rounded-lg text-sm transition"
              style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
            >
              Back
            </button>
            {step < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition"
                style={{ backgroundColor: c.accent, color: c.accentFg }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                style={{ backgroundColor: c.accent, color: c.accentFg }}
              >
                {submitting ? 'Submitting...' : 'Submit brief'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}