import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { RouteSkeleton } from './components/ui/RouteSkeleton';
import { useAppContext } from './context/useAppContext';
import { APP_ROUTES } from './lib/appRoutes';

const Landing = lazy(() => import('./pages/Landing').then((module) => ({ default: module.Landing })));
const PrivacyNotice = lazy(() => import('./pages/PrivacyNotice').then((module) => ({ default: module.PrivacyNotice })));
const Auth = lazy(() => import('./pages/Auth').then((module) => ({ default: module.Auth })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Assistant = lazy(() => import('./pages/Assistant').then((module) => ({ default: module.Assistant })));
const AIFixes = lazy(() => import('./pages/AIFixes').then((module) => ({ default: module.AIFixes })));
const Problems = lazy(() => import('./pages/Problems').then((module) => ({ default: module.Problems })));
const Simulator = lazy(() => import('./pages/Simulator').then((module) => ({ default: module.Simulator })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((module) => ({ default: module.Onboarding })));
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })));
const AppLayout = lazy(() => import('./components/layout/AppLayout').then((module) => ({ default: module.AppLayout })));

function renderRoute(Component, embedded = false) {
  return (
    <Suspense fallback={<RouteSkeleton embedded={embedded} />}>
      <Component />
    </Suspense>
  );
}

function ProtectedAppRoute() {
  const { hasWorkspaceAccess } = useAppContext();

  if (!hasWorkspaceAccess) {
    return <Navigate to={APP_ROUTES.auth} replace />;
  }

  return renderRoute(AppLayout, true);
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path={APP_ROUTES.home} element={renderRoute(Landing)} />
          <Route path={APP_ROUTES.privacy} element={renderRoute(PrivacyNotice)} />
          <Route path={APP_ROUTES.auth} element={renderRoute(Auth)} />
          <Route path={APP_ROUTES.demo} element={renderRoute(Onboarding)} />
          <Route path={APP_ROUTES.setup} element={renderRoute(Onboarding)} />
          <Route path={APP_ROUTES.appRoot} element={<ProtectedAppRoute />}>
            <Route index element={<Navigate to={APP_ROUTES.dashboard} replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="fixes" element={<AIFixes />} />
            <Route path="problems" element={<Problems />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={renderRoute(NotFound)} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
