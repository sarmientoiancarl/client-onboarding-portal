import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getFormTemplateById, saveFormTemplate } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/theme';

const FIELD_TYPES = [
  { value: 'text', label: 'Short text' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'textarea', label: 'Long text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'file', label: 'File upload' },
];

const generateId = () => `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const emptyField = () => ({
  id: generateId(),
  type: 'text',
  label: '',
  placeholder: '',
  required: false,
  options: [],
  helperText: '',
  attachmentUrl: '',
  attachmentName: '',
});

export default function FormBuilder() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { theme } = useTheme();
  const c = t(theme);
  const [title, setTitle] = useState('');
  const [introNote, setIntroNote] = useState('');
  const [savedIntroImageUrl, setSavedIntroImageUrl] = useState('');
  const [fields, setFields] = useState([]);
  const [attachments, setAttachments] = useState({});
  const [introImage, setIntroImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [expandedField, setExpandedField] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('provider');
    if (!stored) { navigate('/login'); return; }
    if (!templateId) { navigate('/templates'); return; }

    const fetchForm = async () => {
      try {
        const data = await getFormTemplateById(templateId);
        setSavedIntroImageUrl(data.introImageUrl || '');
        setTitle(data.title || 'Client Intake Form');
        setIntroNote(data.introNote || '');
        setFields(data.fields || []);
      } catch (err) {
        console.error('Failed to load form:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [navigate, templateId]);

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
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
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
      prev.map((f) => f.id === fieldId ? { ...f, options: [...f.options, ''] } : f)
    );
  };

  const removeOption = (fieldId, optIndex) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId) return f;
        return { ...f, options: f.options.filter((_, i) => i !== optIndex) };
      })
    );
  };

  const handleAttachmentChange = (fieldId, file) => {
    setAttachments((prev) => ({ ...prev, [fieldId]: file }));
  };

  const removeAttachment = (fieldId) => {
    setAttachments((prev) => {
      const updated = { ...prev };
      delete updated[fieldId];
      return updated;
    });
    updateField(fieldId, 'attachmentUrl', '');
    updateField(fieldId, 'attachmentName', '');
  };

  const handleSave = async () => {
    for (const field of fields) {
      if (!field.label.trim()) { setError('All fields must have a label.'); return; }
      if (field.type === 'select' && field.options.length === 0) {
        setError(`Dropdown field "${field.label}" must have at least one option.`); return;
      }
    }
    setSaving(true);
    setError('');
    try {
    await saveFormTemplate(templateId, title, introNote, fields, attachments, introImage);
    setSaved(true);
    setAttachments({});
    setIntroImage(null);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: c.bgInput,
    border: `1px solid ${c.borderMid}`,
    color: c.textPrimary,
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
        <Navbar isProvider />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm" style={{ color: c.textMuted }}>Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.bg }}>
      <Navbar isProvider />

      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/templates"
              className="text-sm transition mb-2 inline-block"
              style={{ color: c.textMuted }}
            >
              Back to templates
            </Link>
            <h1
              className="text-5xl"
              style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
            >
              Form Builder
            </h1>
            <p className="text-sm mt-1" style={{ color: c.textSecondary }}>
              Customize this intake form for your clients.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 self-start sm:self-auto"
            style={{ backgroundColor: saved ? '#1D9E75' : c.accent, color: saved ? '#FEFEFE' : c.accentFg }}
          >
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save form'}
          </button>
        </div>

        {/* Form title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: c.textSecondary }}>
            Form title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="e.g. Logo Design Intake Form"
          />
        </div>

        {/* Intro image */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: c.textSecondary }}>
            Intro image{' '}
            <span className="text-xs font-normal ml-1" style={{ color: c.textFaint }}>
              optional — shown to client on the intro screen
            </span>
          </label>

          {savedIntroImageUrl && !introImage && (
            <div className="flex flex-col gap-2">
              <img
                src={savedIntroImageUrl}
                alt="Current intro"
                className="w-full rounded-xl object-cover max-h-48"
                style={{ border: `1px solid ${c.border}` }}
              />
              <p className="text-xs" style={{ color: c.textMuted }}>
                Current intro image. Upload a new one to replace it.
              </p>
            </div>
          )}

          {introImage ? (
            <div
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{ backgroundColor: c.accentBg, border: `1px solid ${c.accentBorder}` }}
            >
              <p className="text-xs" style={{ color: c.accentText }}>{introImage.name}</p>
              <button
                onClick={() => setIntroImage(null)}
                className="text-xs ml-2"
                style={{ color: c.deleteText }}
              >
                remove
              </button>
            </div>
          ) : (
            <label
              htmlFor="intro-image-upload"
              className="flex items-center gap-2 rounded-lg px-4 py-3 cursor-pointer transition"
              style={{ border: `1px dashed ${c.borderMid}`, color: c.textMuted }}
            >
              <svg className="w-4 h-4" fill="none" stroke={c.textMuted} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">
                Upload intro image (JPG, PNG, WebP)
              </span>
            </label>
          )}
          <input
            id="intro-image-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => setIntroImage(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium" style={{ color: c.textSecondary }}>
            Fields{' '}
            <span className="text-xs font-normal ml-1" style={{ color: c.textFaint }}>
              {fields.length} total
            </span>
          </p>

          {fields.length === 0 && (
            <div
              className="rounded-xl px-6 py-12 text-center"
              style={{ border: `1px dashed ${c.borderMid}` }}
            >
              <p className="text-sm" style={{ color: c.textMuted }}>
                No fields yet. Add your first field below.
              </p>
            </div>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${c.border}`, backgroundColor: c.bgCard }}
            >
              {/* Field header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: c.accentBg, color: c.accentText, border: `1px solid ${c.accentBorder}` }}
                  >
                    {FIELD_TYPES.find((ft) => ft.value === field.type)?.label || field.type}
                  </span>
                  <span className="text-sm" style={{ color: field.label ? c.textPrimary : c.textMuted }}>
                    {field.label || 'Untitled field'}
                  </span>
                  {field.required && (
                    <span className="text-xs" style={{ color: c.accentText }}>*</span>
                  )}
                  {field.helperText && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: c.bgCardAlt, color: c.textMuted }}>
                      note
                    </span>
                  )}
                  {(field.attachmentUrl || attachments[field.id]) && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: c.bgCardAlt, color: c.textMuted }}>
                      file
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveField(index, -1); }}
                    className="text-xs px-2 py-1 rounded transition"
                    style={{ color: c.textMuted }}
                  >
                    up
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveField(index, 1); }}
                    className="text-xs px-2 py-1 rounded transition"
                    style={{ color: c.textMuted }}
                  >
                    dn
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                    className="text-xs px-2 py-1 rounded transition"
                    style={{ color: c.deleteText }}
                  >
                    remove
                  </button>
                </div>
              </div>

              {/* Field editor */}
              {expandedField === field.id && (
                <div
                  className="px-5 pb-5 flex flex-col gap-4"
                  style={{ borderTop: `1px solid ${c.border}` }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">

                    {/* Label */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium" style={{ color: c.textSecondary }}>Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, 'label', e.target.value)}
                        placeholder="e.g. Full Name"
                        style={inputStyle}
                      />
                    </div>

                    {/* Field type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium" style={{ color: c.textSecondary }}>Field type</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, 'type', e.target.value)}
                        style={{ ...inputStyle, backgroundColor: c.bgCard }}
                      >
                        {FIELD_TYPES.map((ft) => (
                          <option key={ft.value} value={ft.value}>{ft.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Placeholder */}
                    {field.type !== 'select' && field.type !== 'file' && (
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-medium" style={{ color: c.textSecondary }}>Placeholder text</label>
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
                        style={{ backgroundColor: field.required ? c.accent : c.bgCardAlt }}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                          style={{
                            backgroundColor: theme === 'light' ? '#FEFEFE' : '#0F0F0F',
                            left: field.required ? '22px' : '2px',
                          }}
                        />
                      </button>
                      <span className="text-xs" style={{ color: c.textSecondary }}>Required field</span>
                    </div>
                  </div>

                  {/* Dropdown options */}
                  {field.type === 'select' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium" style={{ color: c.textSecondary }}>Options</label>
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
                            style={{ color: c.deleteText }}
                          >
                            remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(field.id)}
                        className="text-xs px-3 py-1.5 rounded-lg self-start transition"
                        style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
                      >
                        + Add option
                      </button>
                    </div>
                  )}

                  {/* Divider */}
                  <div style={{ borderTop: `1px solid ${c.border}` }} />

                  {/* Helper text */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: c.textSecondary }}>
                      Helper note{' '}
                      <span className="font-normal" style={{ color: c.textFaint }}>
                        — shown below the field label to guide the client
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      value={field.helperText || ''}
                      onChange={(e) => updateField(field.id, 'helperText', e.target.value)}
                      placeholder="e.g. Please use your legal name as it appears on your ID."
                      style={{ ...inputStyle, resize: 'none' }}
                    />
                  </div>

                  {/* Field attachment */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: c.textSecondary }}>
                      Field attachment{' '}
                      <span className="font-normal" style={{ color: c.textFaint }}>
                        — optional file the client can view or download
                      </span>
                    </label>

                    {/* Show existing attachment */}
                    {field.attachmentUrl && !attachments[field.id] && (
                      <div
                        className="flex items-center justify-between rounded-lg px-4 py-3"
                        style={{ backgroundColor: c.bgCardAlt, border: `1px solid ${c.border}` }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke={c.accentText} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <p className="text-xs truncate" style={{ color: c.textSecondary }}>
                            {field.attachmentName || 'Attached file'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeAttachment(field.id)}
                          className="text-xs ml-2 shrink-0"
                          style={{ color: c.deleteText }}
                        >
                          remove
                        </button>
                      </div>
                    )}

                    {/* New attachment upload */}
                    {attachments[field.id] ? (
                      <div
                        className="flex items-center justify-between rounded-lg px-4 py-3"
                        style={{ backgroundColor: c.accentBg, border: `1px solid ${c.accentBorder}` }}
                      >
                        <p className="text-xs" style={{ color: c.accentText }}>
                          {attachments[field.id].name}
                        </p>
                        <button
                          onClick={() => setAttachments((prev) => {
                            const updated = { ...prev };
                            delete updated[field.id];
                            return updated;
                          })}
                          className="text-xs ml-2"
                          style={{ color: c.deleteText }}
                        >
                          remove
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`attachment-${field.id}`}
                        className="flex items-center gap-2 rounded-lg px-4 py-3 cursor-pointer transition"
                        style={{ border: `1px dashed ${c.borderMid}`, color: c.textMuted }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke={c.textMuted} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-xs">
                          {field.attachmentUrl ? 'Replace attachment' : 'Upload attachment'}
                        </span>
                      </label>
                    )}
                    <input
                      id={`attachment-${field.id}`}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.docx"
                      onChange={(e) => handleAttachmentChange(field.id, e.target.files[0])}
                      className="hidden"
                    />
                  </div>

                </div>
              )}
            </div>
          ))}

          <button
            onClick={addField}
            className="rounded-xl px-6 py-4 text-sm transition text-center"
            style={{ border: `1px dashed ${c.borderMid}`, color: c.textMuted }}
          >
            + Add field
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-lg px-4 py-3"
            style={{ backgroundColor: c.errorBg, border: `1px solid ${c.errorBorder}` }}
          >
            <p className="text-xs" style={{ color: c.errorText }}>{error}</p>
          </div>
        )}

        {/* Preview note */}
        <div
          className="rounded-xl px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: c.accentBg, border: `1px solid ${c.accentBorder}` }}
        >
          <p className="text-xs" style={{ color: c.accentText }}>
            Want to see how your form looks to clients?
          </p>
          <Link
            to="/portal/demo-001"
            className="text-xs font-medium transition"
            style={{ color: c.accentText }}
          >
            Preview form
          </Link>
        </div>

      </div>
    </div>
  );
}