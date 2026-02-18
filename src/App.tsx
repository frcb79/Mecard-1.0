import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { PlatformProvider } from './contexts/PlatformContext';
import { ToastProvider } from './components/ui/Toast';
import AppRoutes from './routes';

export default function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <PlatformProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </PlatformProvider>
      </ServiceProvider>
    </AuthProvider>
  );
}
