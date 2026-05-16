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

  const totalSteps = template
    ? Math.ceil(template.fields.length / STEPS_PER_PAGE)
    : 0;

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

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    setError('');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">Loading your form...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Brief submitted!
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Thank you for completing the intake form. Your provider will
              review your brief and get back to you shortly.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 w-full text-left mt-2">
              <p className="text-xs font-medium text-gray-500 mb-3">
                Your answers
              </p>
              {template.fields.map((field) => (
                <div key={field.id} className="mb-3">
                  <p className="text-xs text-gray-400">{field.label}</p>
                  <p className="text-sm text-gray-800">
                    {answers[field.id] || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg flex flex-col gap-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {template.title}
            </h1>
            <p className="text-sm text-gray-500">
              Please fill out the form below so your provider can prepare the
              best brief for your project.
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Step {step + 1} of {totalSteps}</span>
              <span>{Math.round(((step + 1) / totalSteps) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-5">
            {currentFields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    placeholder={field.placeholder}
                    value={answers[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={answers[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  >
                    <option value="">Select an option</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
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
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-3">
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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