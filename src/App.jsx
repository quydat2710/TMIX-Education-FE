import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layouts/Layout';

// Import custom theme
import theme from './theme';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';

// Admin Pages
import AdvertisementManagement from './pages/admin/AdvertisementManagement';

import { USER_ROLES } from './utils/constants';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<Home />} />
                      <Route path="advertisements" element={<AdvertisementManagement />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.TEACHER}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<Home />} />
                      <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<Home />} />
                      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/parent/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PARENT}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<Home />} />
                      <Route path="*" element={<Navigate to="/parent/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
