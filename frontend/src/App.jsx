// React library import kar rahe hain
import React from 'react';
// React Router v6 ke routing components import kar rahe hain
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Global authentication context provider aur hook
import { AuthProvider, useAuth } from './context/AuthContext';
// Global notifications context provider
import { NotificationProvider } from './context/NotificationContext';
// Dashboard navigation sidebar aur header layout
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages: Landing page, Login page, 404, Unauthorized
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage';

// Student Portal Pages: Dashboard, Attendance, Assignments, Study Notes, Results, Notices, Events, Profile
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AttendancePage } from './pages/student/AttendancePage';
import { AssignmentsPage } from './pages/student/AssignmentsPage';
import { StudyMaterialsPage } from './pages/student/StudyMaterialsPage';
import { ResultsPage } from './pages/student/ResultsPage';
import { NoticesPage } from './pages/student/NoticesPage';
import { EventsPage } from './pages/student/EventsPage';
import { ProfilePage as StudentProfilePage } from './pages/student/ProfilePage';

// Teacher / Faculty Portal Pages: Attendance Marker, Assignment Creator/Grader, Materials Upload, Marks Entry
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { AttendanceManager } from './pages/teacher/AttendanceManager';
import { AssignmentsManager } from './pages/teacher/AssignmentsManager';
import { StudyMaterialsManager } from './pages/teacher/StudyMaterialsManager';
import { ResultsManager } from './pages/teacher/ResultsManager';
import { MySubjects } from './pages/teacher/MySubjects';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage';

// Admin Portal Pages: Full ERP Overview, User Management, Academics (Depts/Courses/Subjects), Notices, Events, Audit Trail
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AcademicManagement } from './pages/admin/AcademicManagement';
import { NoticeManager } from './pages/admin/NoticeManager';
import { EventManager } from './pages/admin/EventManager';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SystemSettings } from './pages/admin/SystemSettings';

// Role-Based Access Control (RBAC) Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Auth state se user profile, authentication status aur session loading flag le rahe hain
  const { user, isAuthenticated, loading } = useAuth();

  // Jab tak backend session verify ho raha hai, tab tak loading spinner dikhate hain
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Authenticating Session...</p>
        </div>
      </div>
    );
  }

  // Agar user login nahi hai toh login page par bhej dete hain
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Agar user ka role allowed roles me nahi hai toh 403 Unauthorized page par bhejte hain
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Agar user authorized hai toh protected page render karte hain
  return children;
};

// Main Application Component
export function App() {
  return (
    // Global Authentication context wrap kar rahe hain
    <AuthProvider>
      {/* Global Notifications context wrap kar rahe hain */}
      <NotificationProvider>
        {/* Browser Router router tree start kar rahe hain */}
        <Router>
          <Routes>
            {/* Public Accessible Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Student Protected Portal Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="materials" element={<StudyMaterialsPage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
            </Route>

            {/* Teacher Protected Portal Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="attendance" element={<AttendanceManager />} />
              <Route path="assignments" element={<AssignmentsManager />} />
              <Route path="materials" element={<StudyMaterialsManager />} />
              <Route path="results" element={<ResultsManager />} />
              <Route path="subjects" element={<MySubjects />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="profile" element={<TeacherProfilePage />} />
            </Route>

            {/* Admin Protected ERP Portal Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="academics" element={<AcademicManagement />} />
              <Route path="notices" element={<NoticeManager />} />
              <Route path="events" element={<EventManager />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            {/* 404 Fallback Route for undefined URLs */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

// App component export kar rahe hain
export default App;

