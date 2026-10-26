import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { LiveAppTourOverlay } from '../demo/LiveAppTourOverlay';

export const Layout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        Initializing FDR SmartTrack Secure Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            padding: '2rem',
          }}
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Live Guided Tour Overlay on Real Application */}
      <LiveAppTourOverlay />
    </div>
  );
};
