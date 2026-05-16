import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getFormTemplate, saveFormTemplate } from '../services/api';

const FIELD_TYPES = [
  { value: 'text', label: 'Short text' },
  { value: 'email', label: 'Email' },
  { value: 'textarea', label: 'Long text' },
  { value: 'select', label: 'Dropdown' },
];

const generateId = () => `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const emptyField = () => ({
  id: generateId(),
  type: 'text',
  label: '',
  placeholder: '',
  required: false,
  options: [],
});

export default function FormBuilder() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('Client Intake Form');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [expandedField, setExpandedField] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('provider');
    if (!stored) { navigate('/login'); return; }

    const fetchForm = async () => {
      try {
        const data = await getFormTemplate();
        setTitle(data.title || 'Client Intake Form');
        setFields(data.fields || []);
      } catch (err) {
        console.error('Failed to load form:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [navigate]);

  const addField = () => {
    const newField = emptyField();
    setFields((prev) => [...prev, newField]);
    setExpandedField(newField.id);
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (expandedField === id) setExpandedField(null);
  };

  const updateField = (id, key, value) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    const target = index + direction;
    if (target < 0 || target >= newFields.length) return;
    [newFields[index], newFields[target]] = [newFields[target], newFields[index]];
    setFields(newFields);
  };

  const updateOption = (fieldId, optIndex, value) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        const newOptions = [...f.options];
        newOptions[optIndex] = value;
        return { ...f, options: newOptions };
      })
    );
  };

  const addOption = (fieldId) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? { ...f, options: [...f.options, ''] } : f
      )
    );
  };

  const removeOption = (fieldId, optIndex) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        const newOptions = f.options.filter((_, i) => i !== optIndex);
        return { ...f, options: newOptions };
      })
    );
  };

  const handleSave = async () => {
    // Validate
    for (const field of fields) {
      if (!field.label.trim()) {
        setError('All fields must have a label.');
        return;
      }
      if (field.type === 'select' && field.options.length === 0) {
        setError(`Dropdown field "${field.label}" must have at least one option.`);
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      await saveFormTemplate(title, fields);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#FEFEFE08',
    border: '1px solid #FEFEFE22',
    color: '#FEFEFE',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
        <Navbar isProvider />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm" style={{ color: '#FEFEFE33' }}>Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F0F0F' }}>
      <Navbar isProvider />

      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="text-sm transition mb-2 inline-block"
              style={{ color: '#FEFEFE44' }}
            >
              ← Back to dashboard
            </Link>
            <h1
              className="text-5xl"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
            >
              Form Builder
            </h1>
            <p className="text-sm mt-1" style={{ color: '#FEFEFE66' }}>
              Customize the intake form your clients will fill out.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 self-start sm:self-auto"
            style={{ backgroundColor: saved ? '#1D9E75' : '#6CE9FE', color: '#0F0F0F' }}
          >
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save form'}
          </button>
        </div>

        {/* Form title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: '#FEFEFE99' }}>
            Form title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="e.g. Client Intake Form"
          />
        </div>

        {/* Fields list */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: '#FEFEFE99' }}>
              Fields{' '}
              <span
                className="text-xs font-normal ml-1"
                style={{ color: '#FEFEFE33' }}
              >
                {fields.length} total
              </span>
            </p>
          </div>

          {fields.length === 0 && (
            <div
              className="rounded-xl px-6 py-12 text-center"
              style={{ border: '1px dashed #FEFEFE22' }}
            >
              <p className="text-sm" style={{ color: '#FEFEFE33' }}>
                No fields yet. Add your first field below.
              </p>
            </div>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid #FEFEFE11', backgroundColor: '#FEFEFE05' }}
            >
              {/* Field header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() =>
                  setExpandedField(expandedField === field.id ? null : field.id)
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#6CE9FE22', color: '#6CE9FE', border: '1px solid #6CE9FE33' }}
                  >
                    {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                  </span>
                  <span className="text-sm" style={{ color: field.label ? '#FEFEFE' : '#FEFEFE33' }}>
                    {field.label || 'Untitled field'}
                  </span>
                  {field.required && (
                    <span className="text-xs" style={{ color: '#6CE9FE' }}>*</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveField(index, -1); }}
                    className="text-xs px-2 py-1 rounded transition"
                    style={{ color: '#FEFEFE33' }}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveField(index, 1); }}
                    className="text-xs px-2 py-1 rounded transition"
                    style={{ color: '#FEFEFE33' }}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                    className="text-xs px-2 py-1 rounded transition"
                    style={{ color: '#FF6B6B66' }}
                    title="Remove field"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Field editor */}
              {expandedField === field.id && (
                <div
                  className="px-5 pb-5 flex flex-col gap-4"
                  style={{ borderTop: '1px solid #FEFEFE08' }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">

                    {/* Label */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium" style={{ color: '#FEFEFE66' }}>
                        Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, 'label', e.target.value)}
                        placeholder="e.g. Full Name"
                        style={inputStyle}
                      />
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium" style={{ color: '#FEFEFE66' }}>
                        Field type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, 'type', e.target.value)}
                        style={{ ...inputStyle, backgroundColor: '#0F0F0F' }}
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value} style={{ backgroundColor: '#0F0F0F' }}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Placeholder */}
                    {field.type !== 'select' && (
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-medium" style={{ color: '#FEFEFE66' }}>
                          Placeholder text
                        </label>
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => updateField(field.id, 'placeholder', e.target.value)}
                          placeholder="e.g. Enter your full name"
                          style={inputStyle}
                        />
                      </div>
                    )}

                    {/* Required toggle */}
                    <div className="flex items-center gap-3 sm:col-span-2">
                      <button
                        onClick={() => updateField(field.id, 'required', !field.required)}
                        className="w-10 h-5 rounded-full transition-all relative"
                        style={{
                          backgroundColor: field.required ? '#6CE9FE' : '#FEFEFE22',
                        }}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                          style={{
                            backgroundColor: '#0F0F0F',
                            left: field.required ? '22px' : '2px',
                          }}
                        />
                      </button>
                      <span className="text-xs" style={{ color: '#FEFEFE66' }}>
                        Required field
                      </span>
                    </div>
                  </div>

                  {/* Dropdown options */}
                  {field.type === 'select' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium" style={{ color: '#FEFEFE66' }}>
                        Options
                      </label>
                      {field.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(field.id, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <button
                            onClick={() => removeOption(field.id, optIndex)}
                            className="text-xs px-2 py-1 rounded"
                            style={{ color: '#FF6B6B66' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(field.id)}
                        className="text-xs px-3 py-1.5 rounded-lg self-start transition"
                        style={{ border: '1px solid #FEFEFE22', color: '#FEFEFE66' }}
                      >
                        + Add option
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add field button */}
          <button
            onClick={addField}
            className="rounded-xl px-6 py-4 text-sm transition text-center"
            style={{ border: '1px dashed #FEFEFE22', color: '#FEFEFE44' }}
          >
            + Add field
          </button>
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

        {/* Preview note */}
        <div
          className="rounded-xl px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#6CE9FE11', border: '1px solid #6CE9FE22' }}
        >
          <p className="text-xs" style={{ color: '#6CE9FE99' }}>
            Want to see how your form looks to clients?
          </p>
          <Link
            to="/portal/demo-001"
            className="text-xs font-medium transition"
            style={{ color: '#6CE9FE' }}
          >
            Preview form →
          </Link>
        </div>

      </div>
    </div>
  );
}