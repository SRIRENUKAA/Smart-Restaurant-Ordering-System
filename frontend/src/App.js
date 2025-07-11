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

function App() {
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('smartserve_settings')) || {};
    const theme = settings.theme || 'light';

    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
  }, []);

  return (
    <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/display" element={<DisplayMenu />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/staff" element={<ManageStaff />} />
          <Route path="/orders" element={<OrderDetailsPage />} />
          <Route path="/customerorders" element={<CustomerOrders />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/notifications" element={<NotificationPage />} /> {/* ✅ New Route */}
        </Routes>
    </Router>
  );
}

export default App;
