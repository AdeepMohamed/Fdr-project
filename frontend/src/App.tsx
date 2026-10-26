import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FDRList } from './pages/FDRList';
import { FDRDetail } from './pages/FDRDetail';
import { FDRCreate } from './pages/FDRCreate';
import { VerificationQueue } from './pages/VerificationQueue';
import { MaturityTracker } from './pages/MaturityTracker';
import { Renewals } from './pages/Renewals';
import { Releases } from './pages/Releases';
import { AuditTrail } from './pages/AuditTrail';
import { Reports } from './pages/Reports';
import { LiveDemo } from './pages/LiveDemo';
import { TourProvider } from './context/TourContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TourProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/presentation" element={<LiveDemo />} />

            {/* Protected Application Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="live-demo" element={<LiveDemo />} />
              <Route path="fdrs" element={<FDRList />} />
              <Route path="fdrs/new" element={<FDRCreate />} />
              <Route path="fdrs/:id" element={<FDRDetail />} />
              <Route path="verifications" element={<VerificationQueue />} />
              <Route path="maturities" element={<MaturityTracker />} />
              <Route path="renewals" element={<Renewals />} />
              <Route path="releases" element={<Releases />} />
              <Route path="audit" element={<AuditTrail />} />
              <Route path="reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </TourProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
