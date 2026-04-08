import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSession } from './session';

export default function RequireAuth({ role, children }) {
  const location = useLocation();
  const session = getSession();

  if (!session?.user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (role && session.user.role !== role) {
    // If user is logged in but hits the wrong dashboard URL, send them to their own.
    const dest = session.user.role === 'Admin' ? '/admin' : '/employee';
    return <Navigate to={dest} replace />;
  }

  return children;
}

