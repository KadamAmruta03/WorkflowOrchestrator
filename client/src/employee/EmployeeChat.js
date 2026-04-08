import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { MessagesSquare, Users, Send, Lock, User } from 'lucide-react';
import { employeePageContainerStyle, employeePageHeaderStyle, employeePageTitleStyle, employeePageSubtitleStyle } from './pageStyles';

export default function EmployeeChat({ user }) {
  const [mode, setMode] = useState('group'); // group | direct
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [groupMessages, setGroupMessages] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);

  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const bottomRef = useRef(null);

  const meId = user?.id;

  const fetchEmployees = useCallback(async () => {
    const res = await axios.get('/api/users/chat-directory');
    const list = Array.isArray(res.data) ? res.data : [];
    setEmployees(list.filter((u) => String(u._id) !== String(meId)));
  }, [meId]);

  const fetchGroup = useCallback(async () => {
    const res = await axios.get('/api/chat/group?limit=120');
    setGroupMessages(Array.isArray(res.data) ? res.data : []);
  }, []);

  const fetchDirect = useCallback(async (otherId) => {
    if (!meId || !otherId) return;
    const res = await axios.get(`/api/chat/direct/${otherId}?userId=${meId}&limit=120`);
    setDirectMessages(Array.isArray(res.data) ? res.data : []);
  }, [meId]);

  useEffect(() => {
    fetchEmployees().catch(() => {});
    fetchGroup().catch(() => {});
  }, [fetchEmployees, fetchGroup]);

  useEffect(() => {
    const id = setInterval(() => {
      if (mode === 'group') fetchGroup().catch(() => {});
      if (mode === 'direct' && selectedUserId) fetchDirect(selectedUserId).catch(() => {});
    }, 3000);
    return () => clearInterval(id);
  }, [mode, selectedUserId, fetchDirect, fetchGroup]);

  useEffect(() => {
    if (mode === 'direct' && selectedUserId) fetchDirect(selectedUserId).catch(() => {});
  }, [mode, selectedUserId, fetchDirect]);

  const visibleMessages = mode === 'group' ? groupMessages : directMessages;

  const selectedName = useMemo(() => {
    const u = employees.find((e) => String(e._id) === String(selectedUserId));
    return u?.name || '';
  }, [employees, selectedUserId]);

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length, mode, selectedUserId]);

  const send = async (e) => {
    e.preventDefault();
    setError('');
    if (!meId) return;
    const t = text.trim();
    if (!t) return;

    try {
      if (mode === 'group') {
        const res = await axios.post('/api/chat/group', { fromUserId: meId, text: t });
        setGroupMessages((prev) => [...prev, res.data]);
      } else {
        if (!selectedUserId) return setError('Select an employee to message.');
        const res = await axios.post('/api/chat/direct', { fromUserId: meId, toUserId: selectedUserId, text: t });
        setDirectMessages((prev) => [...prev, res.data]);
      }
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={header}>
        <div>
          <h2 style={employeePageTitleStyle}>Chat</h2>
          <p style={employeePageSubtitleStyle}>Company group chat + direct messages.</p>
        </div>
      </div>

      <div style={grid}>
        <div style={left}>
          <div style={cardTitle}>Mode</div>
          <div style={tabs}>
            <button onClick={() => setMode('group')} style={tabBtn(mode === 'group')}>
              <Users size={16} style={tabIcon} /> Group
            </button>
            <button onClick={() => setMode('direct')} style={tabBtn(mode === 'direct')}>
              <User size={16} style={tabIcon} /> Direct
            </button>
          </div>

          {mode === 'direct' ? (
            <div style={{ marginTop: 12 }}>
              <div style={cardTitle}>Select Employee</div>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} style={select}>
                <option value="">Choose...</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} {e.role === 'Admin' ? '(HR/Admin)' : ''}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={14} /> Direct messages are private between you and the selected person.
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
              Talk with everyone here (avoid sharing sensitive info).
            </div>
          )}
        </div>

        <div style={right}>
          <div style={topBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={bubble}><MessagesSquare size={18} /></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 14 }}>
                  {mode === 'group' ? 'Company Group Chat' : selectedUserId ? `Direct: ${selectedName}` : 'Direct Messages'}
                </div>
                <div style={{ color: '#64748b', fontSize: 12 }}>
                  {mode === 'group' ? 'Everyone can read' : 'Only you and the selected person can read'}
                </div>
              </div>
            </div>
          </div>

          <div style={msgList}>
            {visibleMessages.map((m) => {
              const fromId = m.fromUserId?._id || m.fromUserId;
              const isMe = String(fromId) === String(meId);
              const fromName = m.fromUserId?.name || 'Unknown';
              return (
                <div key={m._id} style={{ ...msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ ...msgBubble, ...(isMe ? msgMe : msgOther) }}>
                    <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.9 }}>
                      {isMe ? 'You' : fromName}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.35 }}>{m.text}</div>
                    <div style={{ marginTop: 6, fontSize: 10, opacity: 0.75 }}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
              );
            })}
            {visibleMessages.length === 0 ? <div style={empty}>No messages yet.</div> : null}
            <div ref={bottomRef} />
          </div>

          {error ? <div style={errorBox}>{error}</div> : null}

          <form onSubmit={send} style={composer}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={input}
              placeholder={mode === 'group' ? 'Write a message to everyone…' : 'Write a direct message…'}
            />
            <button type="submit" style={sendBtn} disabled={!text.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const containerStyle = employeePageContainerStyle;
const header = employeePageHeaderStyle;
const grid = { display: 'grid', gridTemplateColumns: 'minmax(240px, 0.45fr) minmax(0, 1.55fr)', gap: 14, width: '100%', boxSizing: 'border-box' };
const left = { background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 14, boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)' };
const right = { background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 14, boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)', display: 'flex', flexDirection: 'column', minHeight: 560 };
const tabs = { display: 'flex', gap: 10, marginTop: 8 };
const tabBtn = (active) => ({
  flex: 1,
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${active ? '#93c5fd' : '#e2e8f0'}`,
  background: active ? '#eff6ff' : '#fff',
  color: active ? '#1d4ed8' : '#0f172a',
  cursor: 'pointer',
  fontWeight: 900,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8
});
const tabIcon = { verticalAlign: 'middle' };
const cardTitle = { fontSize: 11, fontWeight: 900, letterSpacing: 1.1, textTransform: 'uppercase', color: '#334155' };
const select = { marginTop: 8, padding: 10, width: '100%', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: 13, boxSizing: 'border-box' };
const topBar = { borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 12 };
const bubble = { width: 34, height: 34, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' };
const msgList = { flex: 1, overflowY: 'auto', padding: '4px 2px', display: 'flex', flexDirection: 'column', gap: 10 };
const msgRow = { display: 'flex' };
const msgBubble = { maxWidth: '78%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff' };
const msgMe = { background: '#1a2a47', color: '#fff', border: '1px solid #1a2a47' };
const msgOther = { background: '#f8fafc', color: '#0f172a' };
const composer = { display: 'flex', gap: 10, marginTop: 12 };
const input = { flex: 1, padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', fontSize: 13 };
const sendBtn = { width: 46, borderRadius: 8, border: 'none', background: '#1a2a47', color: '#fff', cursor: 'pointer' };
const empty = { padding: 12, color: '#64748b', fontSize: 13, textAlign: 'center' };
const errorBox = { marginTop: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 10, borderRadius: 8, fontSize: 13 };
