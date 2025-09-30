import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import SavingsGoals from './pages/SavingsGoals';
import GoalDetail from './pages/GoalDetail';
import Transaction from './pages/Transaction';
import TransactionHistory from './pages/TransactionHistory';
import RecentTransactions from './pages/RecentTransactions';
import Users from './pages/Users';
import AdminTransactions from './pages/AdminTransactions';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Wallets from './pages/Wallets';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserDetails from './pages/UserDetails';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';

const InitialRedirector = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && role === 'user') {
    return <Navigate to="/user-dashboard" />;
  }
  if (token && role === 'admin') {
    return <Navigate to="/admin-dashboard" />;
  }

  return <Login />;
};

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" />;
  }
  return (
    <div className={`d-flex ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
      <Sidebar role={role} isOpen={isSidebarOpen} />
      <div className="dashboard-container w-100">
        <Header role={role} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" />;
  }

  if (userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitialRedirector />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {}
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/savings-goals"
          element={
            <ProtectedRoute requiredRole="user">
              <SavingsGoals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/savings-goals/:goalId"
          element={
            <ProtectedRoute requiredRole="user">
              <GoalDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/:walletId"
          element={
            <ProtectedRoute requiredRole="user">
              <Transaction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction-history/:walletId"
          element={
            <ProtectedRoute requiredRole="user">
              <TransactionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recent-transactions"
          element={
            <ProtectedRoute requiredRole="user">
              <RecentTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="user">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRole="user">
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallets"
          element={
            <ProtectedRoute requiredRole="user">
              <Wallets />
            </ProtectedRoute>
          }
        />
        
        {}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-transactions"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user-details/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserDetails />
            </ProtectedRoute>
          }
        />
        
        {}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;