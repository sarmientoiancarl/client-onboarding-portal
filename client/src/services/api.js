import { DEMO_MODE } from '../config';
import mockClients from '../data/mock/clients.json';
import mockFormTemplate from '../data/mock/form_template.json';
import mockSubmissions from '../data/mock/submissions.json';

const BASE_URL = 'http://localhost:5000/api';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const getToken = () => {
  const stored = localStorage.getItem('provider');
  if (!stored) return null;
  return JSON.parse(stored).token;
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// AUTH
export const loginProvider = async (email, password) => {
  if (DEMO_MODE) {
    await delay(600);
    if (email === 'demo@provider.com' && password === 'demo1234') {
      return { success: true, token: 'demo-token', name: 'Demo Provider', portalLink: 'demo-001' };
    }
    return { success: false, message: 'Invalid credentials' };
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const registerProvider = async (name, email, password) => {
  if (DEMO_MODE) {
    await delay(600);
    return { success: true, token: 'demo-token', name, portalLink: 'demo-001' };
  }
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

// CLIENTS
export const getClients = async () => {
  if (DEMO_MODE) { await delay(400); return mockClients; }
  const res = await fetch(`${BASE_URL}/clients`, { headers: authHeaders() });
  return res.json();
};

// FORMS
export const getFormTemplate = async (portalLink = null) => {
  if (DEMO_MODE) { await delay(300); return mockFormTemplate; }
  const url = portalLink
    ? `${BASE_URL}/forms/portal/${portalLink}`
    : `${BASE_URL}/forms`;
  const headers = portalLink
    ? { 'Content-Type': 'application/json' }
    : authHeaders();
  const res = await fetch(url, { headers });
  return res.json();
};

export const saveFormTemplate = async (title, fields) => {
  if (DEMO_MODE) {
    await delay(500);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/forms`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, fields }),
  });
  return res.json();
};

// SUBMISSIONS
export const getSubmissionByClientId = async (clientId) => {
  if (DEMO_MODE) {
    await delay(300);
    return mockSubmissions.find((s) => s.clientId === clientId) || null;
  }
  const res = await fetch(`${BASE_URL}/submissions/${clientId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
};

export const submitForm = async (data, files = {}) => {
  if (DEMO_MODE) {
    await delay(800);
    return { success: true, id: 'demo-001' };
  }

  const formData = new FormData();
  formData.append('portalLink', data.portalLink);
  formData.append('answers', JSON.stringify(data.answers));

  // Attach each file using its field ID as the key
  Object.entries(files).forEach(([fieldId, file]) => {
    if (file) formData.append(fieldId, file);
  });

  const res = await fetch(`${BASE_URL}/submissions`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type header — browser sets it automatically with boundary
  });
  return res.json();
};

export const createClient = async (data) => {
  if (DEMO_MODE) {
    await delay(500);
    return {
      id: `demo-${Date.now()}`,
      name: data.name,
      business: data.business,
      email: data.email,
      status: 'pending',
      submittedAt: null,
      portalLink: 'demo-001',
    };
  }
  const res = await fetch(`${BASE_URL}/clients`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateClient = async (clientId, data) => {
  if (DEMO_MODE) {
    await delay(400);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/clients/${clientId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteClient = async (clientId) => {
  if (DEMO_MODE) {
    await delay(400);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/clients/${clientId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
};