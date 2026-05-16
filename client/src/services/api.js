import { DEMO_MODE } from '../config';
import clients from '../data/mock/clients.json';
import formTemplate from '../data/mock/form_template.json';
import submissions from '../data/mock/submissions.json';

const BASE_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const getClients = async () => {
  if (DEMO_MODE) { await delay(400); return clients; }
  const res = await fetch(`${BASE_URL}/clients`);
  return res.json();
};

export const getFormTemplate = async () => {
  if (DEMO_MODE) { await delay(300); return formTemplate; }
  const res = await fetch(`${BASE_URL}/forms`);
  return res.json();
};

export const getSubmissionByClientId = async (clientId) => {
  if (DEMO_MODE) {
    await delay(300);
    return submissions.find((s) => s.clientId === clientId) || null;
  }
  const res = await fetch(`${BASE_URL}/submissions/${clientId}`);
  return res.json();
};

export const submitForm = async (data) => {
  if (DEMO_MODE) {
    await delay(800);
    return { success: true, id: 'demo-001' };
  }
  const res = await fetch(`${BASE_URL}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginProvider = async (email, password) => {
  if (DEMO_MODE) {
    await delay(600);
    if (email === 'demo@provider.com' && password === 'demo1234') {
      return { success: true, token: 'demo-token', name: 'Demo Provider' };
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