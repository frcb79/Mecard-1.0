import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { PlatformProvider } from './contexts/PlatformContext';
import AppRoutes from './routes';

export default function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <PlatformProvider>
          <AppRoutes />
        </PlatformProvider>
      </ServiceProvider>
    </AuthProvider>
  );
}
