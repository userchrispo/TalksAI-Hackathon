import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Assistant } from './pages/Assistant';
import { Problems } from './pages/Problems';
import { Simulator } from './pages/Simulator';
import { Settings } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';
import { AppLayout } from './components/layout/AppLayout';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Onboarding />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="problems" element={<Problems />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
