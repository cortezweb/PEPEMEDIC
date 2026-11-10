import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { SaasLanding } from './pages/SaasLanding';
import { PublicBooking } from './pages/PublicBooking';
import { ClinicAdmin } from './pages/ClinicAdmin';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PwaInstallBanner />
      <Routes>
        <Route path="/" element={<SaasLanding />} />
        <Route path="/c/:slug" element={<PublicBooking />} />
        <Route path="/admin" element={<ClinicAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
