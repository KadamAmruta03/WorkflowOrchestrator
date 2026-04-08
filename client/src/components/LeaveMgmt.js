import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, UserCheck } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppRefresh } from '../utils/appRefresh';
import { adminPageContainerStyle, adminPageHeaderStyle, adminPageTitleStyle, adminPageSubtitleStyle } from './pageStyles';

const LeaveMgmt = ({ employees = [] }) => {
  const [leaves, setLeaves] = useState([]);
  const [busyIds, setBusyIds] = useState(() => new Set());

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/api/leaves');
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  useAppRefresh(() => {
    fetchLeaves();
  });

  const pendingLeaves = useMemo(() => {
    return (leaves || []).filter((l) => l.status === 'Pending');
  }, [leaves]);

  const handleDecision = async (leaveId, status) => {
    setBusyIds((prev) => new Set(prev).add(leaveId));
    try {
      await axios.patch(`/api/leaves/${leaveId}`, { status });
      toast.success(status === 'Approved' ? 'Leave approved.' : 'Leave rejected.');
      await fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave request.');
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(leaveId);
        return next;
      });
    }
  };

  const getEmployeeStatus = (empId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeLeave = (leaves || []).find((l) => {
      const lUserId = l.userId?._id || l.userId;
      if (String(lUserId) !== String(empId) || !l.startDate) return false;
      if (l.status && l.status !== 'Approved') return false;

      const start = new Date(l.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(l.startDate);
      end.setDate(end.getDate() + parseInt(l.days));
      end.setHours(0, 0, 0, 0);
      return today >= start && today < end;
    });

    return activeLeave ? activeLeave.type : 'In Office';
  };

  return (
    <div style={containerStyle}>
      <ToastContainer position="top-right" autoClose={3000} />

      <div style={headerWrapper}>
        <div>
          <h2 style={adminPageTitleStyle}>Availability & Leave</h2>
          <p style={adminPageSubtitleStyle}>Approve employee leave requests.</p>
        </div>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={cardTop}>
            <h4 style={{ margin: 0, color: '#1a2a47', fontSize: '15px', fontWeight: 'bold' }}>
              Leave Requests <span style={countBadge}>{pendingLeaves.length}</span>
            </h4>
            <Clock size={18} color="#94a3b8" />
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 13, padding: 12 }}>No pending leave requests.</div>
          ) : (
            <div style={scrollContainer}>
              {pendingLeaves.map((l) => {
                const id = l._id;
                const busy = busyIds.has(id);
                return (
                  <div key={id} style={requestCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={requestTitle}>
                          {l.userId?.name || 'Unknown'} • {l.type}
                        </div>
                        <div style={requestMeta}>
                          {l.startDate ? new Date(l.startDate).toLocaleDateString() : 'N/A'} • {l.days} day(s)
                        </div>
                        {l.reason ? <div style={requestReason}>{l.reason}</div> : null}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button disabled={busy} onClick={() => handleDecision(id, 'Rejected')} style={{ ...decisionBtn, ...rejectBtn }}>
                          <XCircle size={14} style={btnIcon} />
                          Reject
                        </button>
                        <button disabled={busy} onClick={() => handleDecision(id, 'Approved')} style={{ ...decisionBtn, ...approveBtn }}>
                          <CheckCircle2 size={14} style={btnIcon} />
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={cardTop}>
            <h4 style={{ margin: 0, color: '#1a2a47', fontSize: '15px', fontWeight: 'bold' }}>Today&apos;s Status</h4>
            <UserCheck size={18} color="#94a3b8" />
          </div>
          <div style={scrollContainer}>
            {employees
              .slice()
              .sort((a, b) => {
                const statusA = getEmployeeStatus(a._id);
                const statusB = getEmployeeStatus(b._id);
                if (statusA === 'In Office' && statusB !== 'In Office') return 1;
                if (statusA !== 'In Office' && statusB === 'In Office') return -1;
                return 0;
              })
              .map((emp) => {
                const status = getEmployeeStatus(emp._id);
                const isOnLeave = status !== 'In Office';
                return (
                  <div key={emp._id} style={{ ...statusRow, borderLeft: `4px solid ${isOnLeave ? '#ca8a04' : '#16a34a'}` }}>
                    <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{emp.name}</span>
                    <span
                      style={{
                        fontSize: '9px',
                        color: isOnLeave ? '#ca8a04' : '#16a34a',
                        border: `1px solid ${isOnLeave ? '#ca8a04' : '#16a34a'}`,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        background: isOnLeave ? '#fffbeb' : '#f0fdf4',
                        width: 'fit-content'
                      }}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: '20px' }}>
        <div style={cardTop}>
          <h4 style={{ margin: 0, color: '#1a2a47', fontSize: '15px', fontWeight: 'bold' }}>Leave Logs</h4>
          <Calendar size={18} color="#94a3b8" />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>From Date</th>
                <th style={thStyle}>Duration</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(leaves || []).map((leave) => (
                <tr key={leave._id} style={tableRow}>
                  <td style={tdStyle}>{leave.userId?.name || 'Unknown'}</td>
                  <td style={tdStyle}>{leave.type}</td>
                  <td style={tdStyle}>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</td>
                  <td style={tdStyle}>{leave.days} Day(s)</td>
                  <td style={tdStyle}>
                    <span style={statusPill(leave.status)}>
                      {(leave.status || 'Pending') === 'Approved' && <CheckCircle2 size={14} style={pillIcon} />}
                      {(leave.status || 'Pending') === 'Rejected' && <XCircle size={14} style={pillIcon} />}
                      {(leave.status || 'Pending') === 'Pending' && <AlertCircle size={14} style={pillIcon} />}
                      {leave.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
              {(leaves || []).length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ ...tdStyle, color: '#64748b', padding: 16 }}>
                    No leave records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const containerStyle = adminPageContainerStyle;
const headerWrapper = { ...adminPageHeaderStyle, width: '100%', minWidth: 0, marginTop: '-10px' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' };
const cardStyle = { background: 'white', padding: '18px', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' };
const cardTop = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' };
const scrollContainer = { maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' };
const statusRow = { display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #f1f5f9', alignItems: 'center' };
const countBadge = { fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' };

const requestCard = { background: '#fff', border: '1px solid #f1f5f9', borderRadius: 8, padding: 12 };
const requestTitle = { fontWeight: 900, color: '#0f172a', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const requestMeta = { fontSize: 11, color: '#64748b', marginTop: 3 };
const requestReason = { fontSize: 11, color: '#475569', marginTop: 6, lineHeight: 1.25 };
const decisionBtn = { border: 'none', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 900, fontSize: 11, whiteSpace: 'nowrap' };
const approveBtn = { background: '#dcfce7', color: '#166534' };
const rejectBtn = { background: '#fee2e2', color: '#991b1b' };
const btnIcon = { verticalAlign: 'middle', marginRight: 6 };

const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thStyle = { padding: '12px 8px', color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'left', borderBottom: '2px solid #f1f5f9' };
const tdStyle = { padding: '12px 8px', fontSize: '13px', color: '#1e293b' };
const tableRow = { borderBottom: '1px solid #f1f5f9' };

const statusPill = (status) => {
  const s = status || 'Approved';
  if (s === 'Approved') return { display: 'inline-flex', alignItems: 'center', color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900 };
  if (s === 'Rejected') return { display: 'inline-flex', alignItems: 'center', color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900 };
  return { display: 'inline-flex', alignItems: 'center', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900 };
};
const pillIcon = { display: 'inline', marginRight: 5, verticalAlign: 'middle' };

export default LeaveMgmt;
