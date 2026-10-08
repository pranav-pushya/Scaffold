import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { TrackerProvider } from './context/TrackerContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Boot from './pages/Boot/Boot.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';

// Code-split heavy protected pages to optimize initial bundle size
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.jsx'));
const Profile = lazy(() => import('./pages/Profile/Profile.jsx'));
const Tracker = lazy(() => import('./pages/Tracker/Tracker.jsx'));
const Portfolio = lazy(() => import('./pages/Portfolio/Portfolio.jsx'));
const Resume = lazy(() => import('./pages/Resume/Resume.jsx'));
const Assistant = lazy(() => import('./pages/Assistant/Assistant.jsx'));

// Lightweight fallback for lazy-loaded route boundaries
const RouteFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: 'monospace', color: 'var(--muted)' }}>
    <span>Loading module...</span>
  </div>
);

function BootNavigator() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initialTarget = location.pathname + location.search + location.hash;
    if (location.pathname !== '/boot') {
      sessionStorage.setItem('scaffold_redirect_target', initialTarget);
      navigate('/boot', { replace: true });
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <TrackerProvider>
            <BrowserRouter useTransitions={false}>
              <BootNavigator />
              <Routes>
                {/* Full-screen Boot Diagnostic Route (outside shared layout) */}
                <Route path="/boot" element={<Boot />} />

                {/* Main Shared Layout Route (renders Navbar, Outlet, and Footer) */}
                <Route element={<Layout />}>
                  {/* Public Pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected Pages (Lazy loaded inside Suspense boundary) */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <Dashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <Profile />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tracker"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <Tracker />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/portfolio"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <Portfolio />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resume"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <Resume />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/assistant"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<RouteFallback />}>
                          <Assistant />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Public Catch-all 404 Route (inside shared Layout, not protected) */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TrackerProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
