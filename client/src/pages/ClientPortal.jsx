import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getFormTemplate, submitForm } from '../services/api';

export default function ClientPortal() {
  const { portalLink } = useParams();
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [stage, setStage] = useState('intro');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const STEPS_PER_PAGE = 3;

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await getFormTemplate(portalLink);
        setTemplate(data);
      } catch (err) {
        console.error('Failed to load form:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [portalLink]);

  const handleChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setError('');
  };

  const handleFileChange = (fieldId, file) => {
    setFiles((prev) => ({ ...prev, [fieldId]: file }));
    setError('');
  };

  const totalSteps = template ? Math.ceil(template.fields.length / STEPS_PER_PAGE) : 0;
  const currentFields = template
    ? template.fields.slice(step * STEPS_PER_PAGE, (step + 1) * STEPS_PER_PAGE)
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
      await submitForm({ portalLink, answers }, files);
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#FEFEFE08',
    border: '1px solid #FEFEFE22',
    color: '#FEFEFE',
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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm" style={{ color: '#FEFEFE33' }}>Loading your form...</p>
        </div>
      </div>
    );
  }

  // ── Intro screen ──────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-lg flex flex-col gap-8">

            {/* Provider badge */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl self-start"
              style={{ backgroundColor: '#6CE9FE11', border: '1px solid #6CE9FE22' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#6CE9FE22' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="#6CE9FE" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#6CE9FE' }}>
                  You have been invited by a provider
                </p>
                <p className="text-xs" style={{ color: '#FEFEFE44' }}>
                  Portal: {portalLink}
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1
                className="text-5xl mb-3"
                style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
              >
                {template.title}
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: '#FEFEFE66' }}>
                Before we get started, here is a quick overview of what to expect.
                This form helps your provider understand your project better so they
                can deliver exactly what you need.
              </p>
            </div>

            {/* What to expect */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid #FEFEFE11' }}
            >
              <div className="px-5 py-3" style={{ backgroundColor: '#161616', borderBottom: '1px solid #FEFEFE08' }}>
                <p className="text-xs font-medium" style={{ color: '#FEFEFE44' }}>
                  WHAT TO EXPECT
                </p>
              </div>
              {[
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="#6CE9FE" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  ),
                  title: `${template.fields.length} questions total`,
                  description: 'Broken into short steps so it never feels overwhelming.',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="#6CE9FE" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'Takes about 3 to 5 minutes',
                  description: 'Most clients finish in under 5 minutes.',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="#6CE9FE" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                  title: 'Your answers are private',
                  description: 'Only your provider can see your submitted brief.',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="#6CE9FE" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  ),
                  title: 'File uploads supported',
                  description: 'You can attach logos, reference images, or documents.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 px-5 py-4"
                  style={{ borderTop: idx === 0 ? 'none' : '1px solid #FEFEFE08' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: '#6CE9FE11' }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#FEFEFE' }}>
                      {item.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#FEFEFE44' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Required fields note */}
            <p className="text-xs" style={{ color: '#FEFEFE33' }}>
              Fields marked with{' '}
              <span style={{ color: '#6CE9FE' }}>*</span>
              {' '}are required. All other fields are optional.
            </p>

            {/* CTA */}
            <button
              onClick={() => setStage('form')}
              className="w-full py-3 rounded-lg text-sm font-medium transition"
              style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
            >
              Start filling out the form
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ── Submitted screen ──────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#6CE9FE22' }}
            >
              <svg className="w-8 h-8" fill="none" stroke="#6CE9FE" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1
              className="text-4xl"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
            >
              Brief submitted!
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#FEFEFE66' }}>
              Thank you for completing the intake form. Your provider will review
              your brief and get back to you shortly.
            </p>
            <div
              className="rounded-xl px-6 py-4 w-full text-left mt-2"
              style={{ border: '1px solid #FEFEFE11', backgroundColor: '#FEFEFE05' }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: '#FEFEFE44' }}>
                Your answers
              </p>
              {template.fields.map((field) => (
                <div key={field.id} className="mb-3">
                  <p className="text-xs mb-0.5" style={{ color: '#FEFEFE44' }}>{field.label}</p>
                  {field.type === 'file' ? (
                    <p className="text-sm" style={{ color: '#6CE9FE' }}>
                      {files[field.id]?.name || '---'}
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: '#FEFEFE' }}>
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
      <Navbar />

      <div className="flex flex-1 items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg flex flex-col gap-8">

          <div>
            <h1
              className="text-4xl mb-1"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
            >
              {template.title}
            </h1>
            <p className="text-sm" style={{ color: '#FEFEFE66' }}>
              Please fill out the form below so your provider can prepare the best brief for your project.
            </p>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs" style={{ color: '#FEFEFE44' }}>
              <span>Step {step + 1} of {totalSteps}</span>
              <span>{Math.round(((step + 1) / totalSteps) * 100)}% complete</span>
            </div>
            <div className="w-full rounded-full h-1" style={{ backgroundColor: '#FEFEFE11' }}>
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / totalSteps) * 100}%`, backgroundColor: '#6CE9FE' }}
              />
            </div>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-5">
            {currentFields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: '#FEFEFE99' }}>
                  {field.label}
                  {field.required && (
                    <span style={{ color: '#6CE9FE' }} className="ml-1">*</span>
                  )}
                </label>

                {field.type === 'file' ? (
                  <div>
                    <label
                      htmlFor={field.id}
                      className="flex flex-col items-center justify-center gap-2 rounded-lg cursor-pointer transition"
                      style={{
                        border: '1px dashed #FEFEFE22',
                        backgroundColor: files[field.id] ? '#6CE9FE11' : '#FEFEFE05',
                        padding: '24px 16px',
                      }}
                    >
                      {files[field.id] ? (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="#6CE9FE" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium" style={{ color: '#6CE9FE' }}>
                            {files[field.id].name}
                          </p>
                          <p className="text-xs" style={{ color: '#FEFEFE44' }}>
                            {formatFileSize(files[field.id].size)} · Click to change
                          </p>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="#FEFEFE44" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <p className="text-sm" style={{ color: '#FEFEFE44' }}>
                            Click to upload a file
                          </p>
                          <p className="text-xs" style={{ color: '#FEFEFE33' }}>
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
                    style={{ ...inputStyle, backgroundColor: '#0F0F0F' }}
                  >
                    <option value="">Select an option</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt} style={{ backgroundColor: '#0F0F0F' }}>
                        {opt}
                      </option>
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

          {/* Error */}
          {error && (
            <div
              className="rounded-lg px-4 py-3"
              style={{ backgroundColor: '#FF000011', border: '1px solid #FF000033' }}
            >
              <p className="text-xs" style={{ color: '#FF6B6B' }}>{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-3">
            <button
              onClick={step === 0 ? () => setStage('intro') : handleBack}
              className="px-5 py-2.5 rounded-lg text-sm transition"
              style={{ border: '1px solid #FEFEFE22', color: '#FEFEFE66' }}
            >
              Back
            </button>

            {step < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition"
                style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
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