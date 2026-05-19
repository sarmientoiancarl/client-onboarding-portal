import { useState, useEffect } from 'react';

export default function ClientModal({ mode, client, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    business: '',
    email: '',
    status: 'pending',
  });
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
    backgroundColor: '#FEFEFE08',
    border: '1px solid #FEFEFE22',
    color: '#FEFEFE',
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
        style={{ backgroundColor: '#161616', border: '1px solid #FEFEFE11' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl"
            style={{ fontFamily: 'Cormorant, serif', fontWeight: 300, color: '#FEFEFE' }}
          >
            {mode === 'create' ? 'Add new client' : 'Edit client'}
          </h2>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded transition"
            style={{ color: '#FEFEFE44' }}
          >
            ✕
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: '#FEFEFE66' }}>
              Full name <span style={{ color: '#6CE9FE' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Maria Santos"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: '#FEFEFE66' }}>
              Business name
            </label>
            <input
              type="text"
              name="business"
              value={form.business}
              onChange={handleChange}
              placeholder="e.g. Santos Design Studio"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: '#FEFEFE66' }}>
              Email address <span style={{ color: '#6CE9FE' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. maria@example.com"
              style={inputStyle}
            />
          </div>

          {mode === 'edit' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#FEFEFE66' }}>
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: '#0F0F0F' }}
              >
                <option value="pending" style={{ backgroundColor: '#0F0F0F' }}>Pending</option>
                <option value="completed" style={{ backgroundColor: '#0F0F0F' }}>Completed</option>
              </select>
            </div>
          )}
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

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition"
            style={{ border: '1px solid #FEFEFE22', color: '#FEFEFE66' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            style={{ backgroundColor: '#6CE9FE', color: '#0F0F0F' }}
          >
            {loading
              ? 'Saving...'
              : mode === 'create'
              ? 'Add client'
              : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}