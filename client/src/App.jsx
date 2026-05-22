import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ProviderLogin from './pages/ProviderLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TemplateManager from './pages/TemplateManager';
import FormBuilder from './pages/FormBuilder';
import ClientPortal from './pages/ClientPortal';
import ClientDetail from './pages/ClientDetail';

export default function App() {
  return (
    <BrowserRouter basename="/client-onboarding-portal">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<ProviderLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/templates" element={<TemplateManager />} />
        <Route path="/form-builder/:templateId" element={<FormBuilder />} />
        <Route path="/portal/:portalLink" element={<ClientPortal />} />
        <Route path="/client/:clientId" element={<ClientDetail />} />
      </Routes>
    </BrowserRouter>
  );
}