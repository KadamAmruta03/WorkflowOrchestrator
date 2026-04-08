import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, Plane, XCircle, AlertCircle } from 'lucide-react';
import { employeePageContainerStyle, employeePageHeaderStyle, employeePageTitleStyle, employeePageSubtitleStyle } from './pageStyles';

export default function EmployeeLeave({ user }) {
  const [leaveData, setLeaveData] = useState({
    type: 'Vacation',
    days: 1,
    startDate: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [leaves, setLeaves] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchLeaves = async () => {
    const res = await axios.get(`/api/leaves`);
    setLeaves(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    fetchLeaves().catch(() => {});
  }, []);

  const myLeaves = useMemo(() => {
    const myId = user?.id;
    if (!myId) return [];
    return leaves.filter((l) => (l.userId?._id || l.userId) === myId);
  }, [leaves, user]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!user?.id) return;
    setBusy(true);
    try {
      await axios.post(`/api/leaves`, {
        userId: user.id,
        type: leaveData.type,
        days: Number(leaveData.days) || 1,
        startDate: leaveData.startDate,
        reason: leaveData.reason
      });
      setLeaveData({
        type: 'Vacation',
        days: 1,
        startDate: new Date().toISOString().split('T')[0],
        reason: ''
      });
      await fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={header}>
        <div>
          <h2 style={employeePageTitleStyle}>My Leave</h2>
          <p style={employeePageSubtitleStyle}>Request leave and view your logs</p>
        </div>
      </div>

      <div style={grid}>
        <div style={card}>
          <div style={cardTop}>
            <h4 style={{ margin: 0, color: '#1a2a47', fontSize: '15px', fontWeight: 'bold' }}>Request Leave</h4>
            <Plane size={18} color="#94a3b8" />
          </div>
          <form onSubmit={submit} style={form}>
            <label style={field}>
              <span style={label}>Type</span>
              <select
                value={leaveData.type}
                onChange={(e) => setLeaveData((p) => ({ ...p, type: e.target.value }))}
                style={input}
              >
                <option>Vacation</option>
                <option>Sick Leave</option>
                <option>Remote</option>
                <option>Maternity</option>
                <option>Paternity</option>
                <option>Personal Leave</option>
              </select>
            </label>

            <label style={field}>
              <span style={label}>Start Date</span>
              <input
                type="date"
                value={leaveData.startDate}
                onChange={(e) => setLeaveData((p) => ({ ...p, startDate: e.target.value }))}
                style={input}
                required
              />
            </label>

            <label style={field}>
              <span style={label}>Days</span>
              <input
                type="number"
                min="1"
                value={leaveData.days}
                onChange={(e) => setLeaveData((p) => ({ ...p, days: e.target.value }))}
                style={input}
                required
              />
            </label>

            <label style={field}>
              <span style={label}>Reason (optional)</span>
              <input
                value={leaveData.reason}
                onChange={(e) => setLeaveData((p) => ({ ...p, reason: e.target.value }))}
                style={input}
                placeholder="Short reason"
              />
            </label>

            {error && <div style={errorBox}>{error}</div>}
            <button type="submit" style={btn} disabled={busy}>
              {busy ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>

        <div style={card}>
          <div style={cardTop}>
            <h4 style={{ margin: 0, color: '#1a2a47', fontSize: '15px', fontWeight: 'bold' }}>My Recent Leaves</h4>
            <Clock size={18} color="#94a3b8" />
          </div>

          {myLeaves.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 13, padding: 12 }}>No leave records yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Type</th>
                    <th style={th}>From</th>
                    <th style={th}>Days</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave) => (
                    <tr key={leave._id} style={row}>
                      <td style={td}>{leave.type}</td>
                      <td style={td}>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td style={td}>{leave.days}</td>
                      <td style={td}>
                        <span style={statusPill(leave.status)}>
                          {(leave.status || 'Approved') === 'Approved' && <CheckCircle2 size={14} style={pillIcon} />}
                          {(leave.status || 'Approved') === 'Rejected' && <XCircle size={14} style={pillIcon} />}
                          {(leave.status || 'Approved') === 'Pending' && <AlertCircle size={14} style={pillIcon} />}
                          {leave.status || 'Approved'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const containerStyle = employeePageContainerStyle;
const header = employeePageHeaderStyle;
const grid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px', width: '100%' };
const card = { background: 'white', padding: '18px', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' };
const cardTop = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' };
const form = { display: 'flex', flexDirection: 'column', gap: 12 };
const field = { display: 'flex', flexDirection: 'column', gap: 4 };
const label = { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' };
const input = { padding: '10px', width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '13px', boxSizing: 'border-box' };
const btn = { width: '100%', padding: '12px', borderRadius: '8px', background: '#1a2a47', color: '#fff', cursor: 'pointer', border: 'none', fontWeight: 'bold', marginTop: 6 };
const errorBox = { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 10, borderRadius: 8, fontSize: 13 };
const table = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const th = { padding: '12px 8px', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'left', borderBottom: '2px solid #f1f5f9' };
const td = { padding: '12px 8px', fontSize: '13px', color: '#1e293b' };
const row = { borderBottom: '1px solid #f1f5f9' };

const statusPill = (status) => {
  const s = status || 'Approved';
  if (s === 'Approved') return { display: 'inline-flex', alignItems: 'center', color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900 };
  if (s === 'Rejected') return { display: 'inline-flex', alignItems: 'center', color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900 };
  return { display: 'inline-flex', alignItems: 'center', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900 };
};
const pillIcon = { display: 'inline', marginRight: 5, verticalAlign: 'middle' };
