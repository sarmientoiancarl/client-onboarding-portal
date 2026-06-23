import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter basename="/client-onboarding-portal">
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}