import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/theme';

export default function ClientModal({ mode, client, onClose, onSave }) {
  const { theme } = useTheme();
  const c = t(theme);
  const [form, setForm] = useState({ name: '', business: '', email: '', status: 'pending' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && client) {
      setForm({
        name: client.name || '',
        business: client.business || '',
        email: client.email || '',
        status: client.status || 'pending',
      });
    }
  }, [mode, client]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: c.bgInput,
    border: `1px solid ${c.borderMid}`,
    color: c.textPrimary,
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: '#0F0F0Fee' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl flex flex-col gap-6 p-6"
        style={{ backgroundColor: c.bgCard, border: `1px solid ${c.border}` }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl"
            style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: c.textPrimary }}
          >
            {mode === 'create' ? 'Add new client' : 'Edit client'}
          </h2>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded transition"
            style={{ color: c.textMuted }}
          >
            close
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {[
            { label: 'Full name', name: 'name', type: 'text', placeholder: 'e.g. Maria Santos', required: true },
            { label: 'Business name', name: 'business', type: 'text', placeholder: 'e.g. Santos Design Studio', required: false },
            { label: 'Email address', name: 'email', type: 'email', placeholder: 'e.g. maria@example.com', required: true },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: c.textSecondary }}>
                {field.label}{' '}
                {field.required && <span style={{ color: c.accentText }}>*</span>}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                style={inputStyle}
              />
            </div>
          ))}

          {mode === 'edit' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: c.textSecondary }}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: c.bgCard }}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
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
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition"
            style={{ border: `1px solid ${c.borderMid}`, color: c.textSecondary }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            style={{ backgroundColor: c.accent, color: '#FEFEFE' }}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Add client' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}