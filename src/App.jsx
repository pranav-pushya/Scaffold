import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { TrackerProvider } from './context/TrackerContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Tracker from './pages/Tracker.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Resume from './pages/Resume.jsx';
import Assistant from './pages/Assistant.jsx';
import Boot from './pages/Boot.jsx';

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

                  {/* Protected Pages */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tracker"
                    element={
                      <ProtectedRoute>
                        <Tracker />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/portfolio"
                    element={
                      <ProtectedRoute>
                        <Portfolio />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/resume"
                    element={
                      <ProtectedRoute>
                        <Resume />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/assistant"
                    element={
                      <ProtectedRoute>
                        <Assistant />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </TrackerProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
