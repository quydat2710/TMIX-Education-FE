import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';

import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

// Import custom theme
import theme from './theme';

// ── Lazy loading fallback ──
const LazyFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress sx={{ color: '#7c3aed' }} />
  </Box>
);

// ── Core Pages (static imports — needed on first load) ──
import Home from './pages/home/InteractiveHome'
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import UnauthorizedAccess from './pages/auth/UnauthorizedAccess';

// ── Admin Pages (lazy loaded — only downloaded when admin visits) ──
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdvertisementManagement = React.lazy(() => import('./pages/admin/AdvertisementManagement'));
const ClassManagement = React.lazy(() => import('./pages/admin/ClassManagement'));
const StudentManagement = React.lazy(() => import('./pages/admin/StudentManagement'));
const TeacherManagement = React.lazy(() => import('./pages/admin/TeacherManagement'));
const ParentManagement = React.lazy(() => import('./pages/admin/ParentManagement'));
const Statistics = React.lazy(() => import('./pages/admin/Statistics'));
const FinancialStatistics = React.lazy(() => import('./pages/admin/FinancialStatistics'));
const StudentStatistics = React.lazy(() => import('./pages/admin/StudentStatistics'));
const LearningStatistics = React.lazy(() => import('./pages/admin/LearningStatistics'));
const AdminNotificationCenter = React.lazy(() => import('./pages/admin/AdminNotificationCenter'));
const RoleManagement = React.lazy(() => import('./pages/admin/RoleManagement'));
const RegistrationManagement = React.lazy(() => import('./pages/admin/RegistrationManagement'));
const MenuManagement = React.lazy(() => import('./pages/admin/MenuManagement'));
const TestimonialsManagement = React.lazy(() => import('./pages/admin/TestimonialsManagement'));
const AdminProfile = React.lazy(() => import('./pages/profile/AdminProfile'));
const AuditLog = React.lazy(() => import('./pages/admin/AuditLog'));
const LayoutBuilder = React.lazy(() => import('./pages/admin/LayoutBuilder'));
const AttendanceManagement = React.lazy(() => import('./pages/admin/AttendanceManagement'));

// ── Teacher Pages (lazy loaded) ──
const TeacherDashboard = React.lazy(() => import('./pages/teacher/Dashboard'));
const TeacherMyClasses = React.lazy(() => import('./pages/teacher/MyClasses'));
const TeacherSchedule = React.lazy(() => import('./pages/teacher/Schedule'));
const TeacherProfile = React.lazy(() => import('./pages/profile/TeacherProfile'));
const TeacherDetail = React.lazy(() => import('./pages/teacher/TeacherDetail'));
const Salary = React.lazy(() => import('./pages/teacher/Salary'));
const TeacherTestManagement = React.lazy(() => import('./pages/teacher/TestManagement'));
const TeacherCreateEditTest = React.lazy(() => import('./pages/teacher/CreateEditTest'));
const TeacherTestStatistics = React.lazy(() => import('./pages/teacher/TestStatistics'));
const TeacherReviewAttempt = React.lazy(() => import('./pages/teacher/ReviewAttempt'));
const TeacherMaterialManagement = React.lazy(() => import('./pages/teacher/MaterialManagement'));

// ── Student Pages (lazy loaded) ──
const StudentDashboard = React.lazy(() => import('./pages/student/Dashboard'));
const StudentMyClasses = React.lazy(() => import('./pages/student/MyClasses'));
const StudentSchedule = React.lazy(() => import('./pages/student/Schedule'));
const StudentProfile = React.lazy(() => import('./pages/profile/StudentProfile'));
const StudentTestsList = React.lazy(() => import('./pages/student/TestsList'));
const TakeTest = React.lazy(() => import('./pages/student/TakeTest'));
const TestResults = React.lazy(() => import('./pages/student/TestResults'));
const StudentChatbot = React.lazy(() => import('./pages/student/Chatbot'));
const StudentMaterials = React.lazy(() => import('./pages/student/Materials'));
const PronunciationPractice = React.lazy(() => import('./pages/student/PronunciationPractice'));
const DictationPractice = React.lazy(() => import('./pages/student/DictationPractice'));

// ── Parent Pages (lazy loaded) ──
const ParentDashboard = React.lazy(() => import('./pages/parent/Dashboard'));
const ParentChildren = React.lazy(() => import('./pages/parent/Children'));
const ParentPayments = React.lazy(() => import('./pages/parent/Payments'));
const ParentProfile = React.lazy(() => import('./pages/profile/ParentProfile'));

import { USER_ROLES } from './constants';

// ── Public Pages (lazy loaded) ──
const DynamicMenuPage = React.lazy(() => import('./pages/DynamicMenuPage'));
const AllTeachersPage = React.lazy(() => import('./pages/AllTeachersPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const SchedulePage = React.lazy(() => import('./pages/SchedulePage'));
const TestimonialsPage = React.lazy(() => import('./pages/TestimonialsPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
import DashboardLayout from './components/layouts/DashboardLayout';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <Suspense fallback={<LazyFallback />}>
        <Routes>
          {/* Trang chủ chung - hiển thị khác nhau tùy trạng thái đăng nhập */}
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/staff/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/unauthorized" element={<UnauthorizedAccess />} />

          {/* ===== PUBLIC PAGES — tách biệt với admin/staff ===== */}
          {/* Về chúng tôi */}
          <Route path="/ve-chung-toi" element={<AboutPage />} />

          {/* Giáo viên */}
          <Route path="/giao-vien" element={<AllTeachersPage />} />
          <Route path="/gioi-thieu/doi-ngu-giang-vien" element={<AllTeachersPage />} />

          {/* Teacher Detail Route - Must be before dynamic menu routes */}
          <Route path="/gioi-thieu/doi-ngu-giang-vien/:slug" element={<TeacherDetail />} />

          {/* Các khóa học — parameterized route replaces 8 duplicate routes */}
          <Route path="/cac-khoa-hoc" element={<CoursesPage />} />
          <Route path="/khoa-hoc/:level" element={<CoursesPage />} />

          {/* Schedule Page - Upcoming classes */}
          <Route path="/lich-khai-giang" element={<SchedulePage />} />

          {/* Đánh giá */}
          <Route path="/danh-gia" element={<TestimonialsPage />} />
          <Route path="/cam-nhan-hoc-vien" element={<TestimonialsPage />} />

          {/* Dynamic Menu Routes - Support nested paths */}
          <Route path="/:slug" element={<DynamicMenuPage />} />
          <Route path="/:parentSlug/:childSlug" element={<DynamicMenuPage />} />

          <Route path="/profile" element={
            !user ? <Navigate to="/" replace /> : (
              <Navigate to={
                user.role === USER_ROLES.ADMIN ? "/admin/profile" :
                  user.role === USER_ROLES.TEACHER ? "/teacher/profile" :
                    user.role === USER_ROLES.STUDENT ? "/student/profile" :
                      user.role === USER_ROLES.PARENT ? "/parent/profile" : "/"
              } replace />
            )
          } />

          {/* Notifications route — accessible to all logged-in users */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT, USER_ROLES.PARENT]}>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="advertisements" element={<AdvertisementManagement />} />
                  <Route path="classes" element={<ClassManagement />} />
                  <Route path="attendance" element={<AttendanceManagement />} />

                  {/* New user management routes */}
                  <Route path="users" element={<Navigate to="/admin/users/students" replace />} />
                  <Route path="users/students" element={<StudentManagement />} />
                  <Route path="users/teachers" element={<TeacherManagement />} />
                  <Route path="users/parents" element={<ParentManagement />} />

                  {/* Legacy routes with redirects for backward compatibility */}
                  <Route path="students" element={<Navigate to="/admin/users/students" replace />} />
                  <Route path="teachers" element={<Navigate to="/admin/users/teachers" replace />} />
                  <Route path="parents" element={<Navigate to="/admin/users/parents" replace />} />

                  <Route path="statistics" element={<Statistics />} />
                  <Route path="statistics/financial" element={<FinancialStatistics />} />
                  <Route path="statistics/students" element={<StudentStatistics />} />
                  <Route path="statistics/learning" element={<LearningStatistics />} />
                  <Route path="roles-management" element={<RoleManagement />} />
                  <Route path="registrations" element={<RegistrationManagement />} />
                  <Route path="audit-log" element={<AuditLog />} />
                  <Route path="notifications/send" element={<AdminNotificationCenter />} />

                  {/* Testimonials Management Route */}
                  <Route path="testimonials" element={<TestimonialsManagement />} />

                  {/* Menu Management Routes */}
                  <Route path="menu" element={<MenuManagement />} />
                  <Route path="menu-management" element={<MenuManagement />} />
                  <Route path="layout-builder/:id" element={<LayoutBuilder />} />
                  <Route path="layout-builder/:slug" element={<LayoutBuilder />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]}>
                <Routes>
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="classes" element={<TeacherMyClasses />} />
                  <Route path="schedule" element={<TeacherSchedule />} />
                  <Route path="salary" element={<Salary />} />
                  <Route path="tests" element={<TeacherTestManagement />} />
                  <Route path="tests/create" element={<TeacherCreateEditTest />} />
                  <Route path="tests/:id/edit" element={<TeacherCreateEditTest />} />
                  <Route path="tests/:id/stats" element={<TeacherTestStatistics />} />
                  <Route path="tests/attempts/:attemptId/review" element={<TeacherReviewAttempt />} />
                  <Route path="materials" element={<TeacherMaterialManagement />} />
                  <Route path="profile" element={<TeacherProfile />} />
                  <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]}>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="classes" element={<StudentMyClasses />} />
                  <Route path="schedule" element={<StudentSchedule />} />
                  <Route path="profile" element={<StudentProfile />} />
                  {/* AI Test Routes */}
                  <Route path="tests" element={<StudentTestsList />} />
                  <Route path="tests/:testId/take" element={<TakeTest />} />
                  <Route path="tests/results/:attemptId" element={<TestResults />} />
                  <Route path="chatbot" element={<StudentChatbot />} />
                  <Route path="materials" element={<StudentMaterials />} />
                  <Route path="pronunciation" element={<PronunciationPractice />} />
                  <Route path="dictation" element={<DictationPractice />} />
                  <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Parent Routes */}
          <Route
            path="/parent/*"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.PARENT]}>
                <Routes>
                  <Route path="dashboard" element={<ParentDashboard />} />
                  <Route path="children" element={<ParentChildren />} />
                  <Route path="payments" element={<ParentPayments />} />
                  <Route path="profile" element={<ParentProfile />} />
                  <Route path="*" element={<Navigate to="/parent/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Router>
    </LocalizationProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
