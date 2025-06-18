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
            {/* Trang chủ chung - hiển thị khác nhau tùy trạng thái đăng nhập */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <Layout>
                    <Routes>
                      <Route path="advertisements" element={<AdvertisementManagement />} />
                      <Route path="*" element={<Navigate to="/admin/advertisements" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.TEACHER}>
                  <Layout>
                    <Routes>
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
                  <Layout>
                    <Routes>
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Parent Routes */}
            <Route
              path="/parent/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PARENT}>
                  <Layout>
                    <Routes>
                      <Route path="*" element={<Navigate to="/" replace />} />
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
