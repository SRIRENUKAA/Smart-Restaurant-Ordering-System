// src/App.js
import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import WelcomePage from './pages/WelcomePage';
import MenuPage from './pages/MenuPage';
import DisplayMenu from './pages/DisplayMenu';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';
import CartPage from './pages/CartPage';
import Logout from './pages/Logout';
import ManageStaff from './pages/ManageStaff';
import NotificationPage from './pages/NotificationPage'; // Make sure you created this
import OrderDetailsPage from './pages/OrderDetailsPage'; // Make sure you created this
import CustomerOrders from './pages/CustomerOrders';
import ProtectedRoute from './pages/ProtectedRoute';

function App() {
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('smartserve_settings')) || {};
    const theme = settings.theme || 'light';

    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
  }, []);

  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* 🚪 Public Routes */}
        <Route path="/" element={token ? <Dashboard /> : <WelcomePage />} />
        <Route path="/login" element={token ? <Dashboard /> : <Login />} />
        <Route path="/signup" element={token ? <Dashboard /> : <Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 🔒 Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
        <Route path="/display" element={<ProtectedRoute><DisplayMenu /></ProtectedRoute>} />
        <Route path="/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><ManageStaff /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
        <Route path="/customerorders" element={<ProtectedRoute><CustomerOrders /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
