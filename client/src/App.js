import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';

import AuthPage from './auth/AuthPage';
import RequireAuth from './auth/RequireAuth';
import { clearSession, getSession } from './auth/session';

import AdminApp from './admin/AdminApp';
import EmployeeApp from './employee/EmployeeApp';

function HomeRedirect() {
  const session = getSession();
  if (!session?.user) return <Navigate to="/auth" replace />;
  return <Navigate to={session.user.role === 'Admin' ? '/admin' : '/employee'} replace />;
}

function AdminShell() {
  const navigate = useNavigate();
  const session = getSession();
  const onLogout = () => {
    clearSession();
    navigate('/auth', { replace: true });
  };
  return <AdminApp user={session?.user} onLogout={onLogout} />;
}

function EmployeeShell() {
  const navigate = useNavigate();
  const session = getSession();
  const onLogout = () => {
    clearSession();
    navigate('/auth', { replace: true });
  };
  return <EmployeeApp user={session?.user} onLogout={onLogout} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/admin"
          element={
            <RequireAuth role="Admin">
              <AdminShell />
            </RequireAuth>
          }
        />
        <Route
          path="/employee"
          element={
            <RequireAuth role="Employee">
              <EmployeeShell />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

