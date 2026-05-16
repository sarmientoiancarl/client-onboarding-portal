import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getFormTemplate, submitForm } from '../services/api';

export default function ClientPortal() {
  const { portalLink } = useParams();
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const STEPS_PER_PAGE = 3;

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await getFormTemplate();
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

  const totalSteps = template ? Math.ceil(template.fields.length / STEPS_PER_PAGE) : 0;
  const currentFields = template
    ? template.fields.slice(step * STEPS_PER_PAGE, (step + 1) * STEPS_PER_PAGE)
    : [];

  const validateStep = () => {
    for (const field of currentFields) {
      if (field.required && !answers[field.id]?.trim()) {
        setError(`"${field.label}" is required.`);
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
      await submitForm({ portalLink, answers });
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
                  <p className="text-sm" style={{ color: '#FEFEFE' }}>{answers[field.id] || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                style={{
                  width: `${((step + 1) / totalSteps) * 100}%`,
                  backgroundColor: '#6CE9FE',
                }}
              />
            </div>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-5">
            {currentFields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: '#FEFEFE99' }}>
                  {field.label}
                  {field.required && <span style={{ color: '#6CE9FE' }} className="ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
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
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="px-5 py-2.5 rounded-lg text-sm transition"
                style={{ border: '1px solid #FEFEFE22', color: '#FEFEFE66' }}
              >
                Back
              </button>
            ) : <div />}

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