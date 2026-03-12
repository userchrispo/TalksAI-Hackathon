import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { RouteSkeleton } from './components/ui/RouteSkeleton';

const Landing = lazy(() => import('./pages/Landing').then((module) => ({ default: module.Landing })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Assistant = lazy(() => import('./pages/Assistant').then((module) => ({ default: module.Assistant })));
const Problems = lazy(() => import('./pages/Problems').then((module) => ({ default: module.Problems })));
const Simulator = lazy(() => import('./pages/Simulator').then((module) => ({ default: module.Simulator })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((module) => ({ default: module.Onboarding })));
const AppLayout = lazy(() => import('./components/layout/AppLayout').then((module) => ({ default: module.AppLayout })));

function renderRoute(Component, embedded = false) {
  return (
    <Suspense fallback={<RouteSkeleton embedded={embedded} />}>
      <Component />
    </Suspense>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={renderRoute(Landing)} />
          <Route path="/auth" element={renderRoute(Onboarding)} />
          <Route path="/app" element={renderRoute(AppLayout, true)}>
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
