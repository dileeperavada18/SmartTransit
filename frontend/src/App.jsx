import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemoScenarioModal } from './components/DemoScenarioModal';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentTracking } from './pages/student/Tracking';
import { StudentRoutes } from './pages/student/Routes';
import { StudentReportIncident } from './pages/student/ReportIncident';
import { StudentMyIncidents } from './pages/student/MyIncidents';
import { StudentNotifications } from './pages/student/Notifications';

// Driver Pages
import { DriverDashboard } from './pages/driver/Dashboard';
import { DriverTripControl } from './pages/driver/TripControl';
import { DriverReportIncident } from './pages/driver/ReportIncident';
import { DriverAssignedTasks } from './pages/driver/AssignedTasks';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminBuses } from './pages/admin/Buses';
import { AdminRoutes } from './pages/admin/Routes';
import { AdminIncidents } from './pages/admin/Incidents';
import { AdminReplacementBuses } from './pages/admin/ReplacementBuses';
import { AdminStaff } from './pages/admin/Staff';
import { AdminDelayPredictor } from './pages/admin/DelayPredictor';
import { AdminAnalytics } from './pages/admin/Analytics';

// Main App Layout
const AppLayout = ({ onOpenDemoModal }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar onOpenDemoModal={onOpenDemoModal} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Route Guard
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective home
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'driver') return <Navigate to="/driver" replace />;
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
};

// Root Redirect Component
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'driver') return <Navigate to="/driver" replace />;
  return <Navigate to="/student" replace />;
};

export function App() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Workspace */}
          <Route element={<AppLayout onOpenDemoModal={() => setDemoModalOpen(true)} />}>
            <Route path="/" element={<RootRedirect />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/tracking" element={<StudentTracking />} />
              <Route path="/student/routes" element={<StudentRoutes />} />
              <Route path="/student/report-incident" element={<StudentReportIncident />} />
              <Route path="/student/my-incidents" element={<StudentMyIncidents />} />
              <Route path="/student/notifications" element={<StudentNotifications />} />
            </Route>

            {/* Driver Routes */}
            <Route element={<ProtectedRoute allowedRoles={['driver', 'admin']} />}>
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/driver/trip-control" element={<DriverTripControl />} />
              <Route path="/driver/report-incident" element={<DriverReportIncident />} />
              <Route path="/driver/tasks" element={<DriverAssignedTasks />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/buses" element={<AdminBuses />} />
              <Route path="/admin/routes" element={<AdminRoutes />} />
              <Route path="/admin/incidents" element={<AdminIncidents />} />
              <Route path="/admin/replacements" element={<AdminReplacementBuses />} />
              <Route path="/admin/staff" element={<AdminStaff />} />
              <Route path="/admin/delay-predict" element={<AdminDelayPredictor />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Interactive Demo Modal */}
        <DemoScenarioModal
          isOpen={demoModalOpen}
          onClose={() => setDemoModalOpen(false)}
          onRefreshData={() => window.location.reload()}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
