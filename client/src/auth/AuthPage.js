import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearSession, setSession } from './session';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('Employee'); // Admin | Employee
  const [mode, setMode] = useState('signin'); // signin | set_password (Employee only)

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const modeParam = params.get('mode');
    const employeeIdParam = params.get('employeeId');

    if (modeParam === 'set_password') {
      setRole('Employee');
      setMode('set_password');
      if (employeeIdParam) setEmployeeId(employeeIdParam);
    }
  }, [location.search]);

  const title = useMemo(() => {
    if (role === 'Admin') return 'Admin Access';
    return mode === 'set_password' ? 'Set Password (One Time)' : 'Employee Sign In';
  }, [mode, role]);

  const goToDashboard = (userRole) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/auth') return navigate(from, { replace: true });
    return navigate(userRole === 'Admin' ? '/admin' : '/employee', { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      clearSession();
      if (role === 'Admin') {
        const res = await axios.post(`/api/auth/admin/login`, { password });
        setSession({ user: res.data.user });
        goToDashboard(res.data.user.role);
        return;
      }

      if (mode === 'set_password') {
        const res = await axios.post(`/api/auth/employee/set-password`, {
          employeeId,
          password
        });
        setSession({ user: res.data.user });
        goToDashboard(res.data.user.role);
        return;
      }

      const res = await axios.post(`/api/auth/employee/login`, {
        employeeId,
        password
      });
      setSession({ user: res.data.user });
      goToDashboard(res.data.user.role);
    } catch (err) {
      // If err.response is undefined, it's usually a network/proxy issue.
      setError(err.response?.data?.message || 'Something went wrong (cannot reach server).');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true" />

      <div className="auth-card">
        <div className="auth-top">
          <div className="auth-brand">Workflow Orchestrator</div>
          <div className="auth-sub">Sign in or create an account to continue</div>
        </div>

        <div className="auth-seg-row">
          <div className="auth-seg" role="tablist" aria-label="Role selection">
            <button
              type="button"
              className={role === 'Employee' ? 'is-active' : ''}
              onClick={() => { setRole('Employee'); setMode('signin'); setError(''); }}
            >
              Employee
            </button>
            <button
              type="button"
              className={role === 'Admin' ? 'is-active' : ''}
              onClick={() => { setRole('Admin'); setMode('signin'); setError(''); }}
            >
              Admin
            </button>
          </div>

          {role === 'Employee' && (
            <div className="auth-seg" role="tablist" aria-label="Mode selection">
              <button
                type="button"
                className={mode === 'signin' ? 'is-active' : ''}
                onClick={() => { setMode('signin'); setError(''); }}
              >
                Sign in
              </button>
              <button
                type="button"
                className={mode === 'set_password' ? 'is-active' : ''}
                onClick={() => { setMode('set_password'); setError(''); }}
              >
                Set password
              </button>
            </div>
          )}
        </div>

        <h1 className="auth-title">{title}</h1>

        <form onSubmit={submit} className="auth-form">
          {role === 'Employee' && (
            <label className="auth-field">
              <span>Employee ID</span>
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP-10001"
                required
                autoComplete="username"
              />
            </label>
          )}

          <label className="auth-field">
            <span>Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={role === 'Admin' ? 'Admin password (admin123)' : 'clerk'}
              type="password"
              required
              autoComplete={mode === 'set_password' ? 'new-password' : 'current-password'}
            />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button className="auth-primary" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : role === 'Admin' ? 'Enter Admin Panel' : (mode === 'set_password' ? 'Set Password' : 'Sign in')}
          </button>

          <div className="auth-hint">
  {role === 'Admin' ? (
    'Admin access uses a fixed password (admin123). No admin account is created.'
  ) : (
    <>
      <p>Employees sign in using Employee ID. You can set the password only once.</p>
      <p style={{ marginTop: '4px', fontWeight: '500' }}>
        Note: You can use the ID and password mentioned above to view the project.
      </p>
    </>
  )}
</div>
        </form>
      </div>
    </div>
  );
}
