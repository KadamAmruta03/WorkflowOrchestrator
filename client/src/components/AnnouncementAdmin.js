import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Megaphone, PlusCircle } from 'lucide-react';
import { useAppRefresh } from '../utils/appRefresh';
import { adminPageContainerStyle, adminPageHeaderStyle, adminPageTitleStyle, adminPageSubtitleStyle } from './pageStyles';

export default function AnnouncementAdmin() {
  const [form, setForm] = useState({ title: '', body: '', priority: 'Normal', audience: 'All' });
  const [announcements, setAnnouncements] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    const res = await axios.get('/api/announcements');
    setAnnouncements(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    fetchAll().catch(() => {});
  }, []);

  useAppRefresh(() => {
    fetchAll().catch(() => {});
  });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.body.trim()) return;
    setBusy(true);
    try {
      await axios.post('/api/announcements', {
        title: form.title.trim(),
        body: form.body.trim(),
        priority: form.priority,
        audience: form.audience
      });
      setForm({ title: '', body: '', priority: 'Normal', audience: 'All' });
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create announcement.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={header}>
        <div>
          <h2 style={adminPageTitleStyle}>Announcements</h2>
          <p style={adminPageSubtitleStyle}>Central announcement hub. High priority items still notify employees.</p>
        </div>
      </div>

      <div style={cardWide}>
        <div style={cardTop}>
          <h4 style={cardTitle}>
            <PlusCircle size={18} /> Create Announcement
          </h4>
        </div>

        <form onSubmit={submit} style={formStyle}>
          <div style={topRowScroll}>
            <div style={topRow}>
            <label style={field}>
              <span style={label}>Title</span>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} style={input} />
            </label>

            <label style={field}>
              <span style={label}>Priority</span>
              <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} style={input}>
                <option>Normal</option>
                <option>High</option>
              </select>
            </label>

            <label style={field}>
              <span style={label}>Audience</span>
              <select value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))} style={input}>
                <option>All</option>
                <option>Employees</option>
              </select>
            </label>
            </div>
          </div>

          <label style={field}>
            <span style={label}>Body</span>
            <textarea
              rows={6}
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              style={{ ...input, resize: 'vertical' }}
            />
          </label>

          {error ? <div style={errorBox}>{error}</div> : null}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={btn} disabled={busy || !form.title.trim() || !form.body.trim()}>
              <Megaphone size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {busy ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      <div style={card}>
        <div style={cardTop}>
          <h4 style={cardTitle}>Recent Announcements</h4>
        </div>
        <div style={recentScroll}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {announcements.slice(0, 30).map((a) => (
            <div key={a._id} style={{ ...row, ...(a.priority === 'High' ? rowHigh : null) }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.title}
                </div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                  {a.priority} • {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                </div>
                <div style={{ marginTop: 8, color: '#334155', fontSize: 13, lineHeight: 1.35, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                  {a.body}
                </div>
              </div>
              <div style={pill(a.priority)}>{a.priority}</div>
            </div>
          ))}
          {announcements.length === 0 ? <div style={{ color: '#64748b', fontSize: 13 }}>No announcements yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const containerStyle = adminPageContainerStyle;
const header = { ...adminPageHeaderStyle, width: '100%', minWidth: 0 };
const cardWide = { background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 14, width: '100%', boxSizing: 'border-box', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)' };
const card = { background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 14, boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)' };
const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 };
const cardTitle = { margin: 0, color: '#0f172a', fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 };
const formStyle = { display: 'flex', flexDirection: 'column', gap: 12 };
const topRowScroll = { overflowX: 'auto', paddingBottom: 2 };
const topRow = { display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.7fr', gap: 10, minWidth: 640 };
const field = { display: 'flex', flexDirection: 'column', gap: 6 };
const label = { fontSize: 10, color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.8 };
const input = { padding: '10px', width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: 13, boxSizing: 'border-box' };
const btn = { width: '100%', padding: '12px', borderRadius: '8px', background: '#1a2a47', color: '#fff', cursor: 'pointer', border: 'none', fontWeight: 900, fontSize: 13 };
const errorBox = { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 10, borderRadius: 8, fontSize: 13 };
const row = { border: '1px solid #f1f5f9', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', gap: 12 };
const rowHigh = { border: '1px solid #fed7aa', background: '#fff7ed' };
const recentScroll = { maxHeight: 560, overflowY: 'auto', paddingRight: 6 };
const pill = (priority) => ({
  fontSize: 11,
  fontWeight: 900,
  color: priority === 'High' ? '#9a3412' : '#1d4ed8',
  background: priority === 'High' ? '#ffedd5' : '#eff6ff',
  border: priority === 'High' ? '1px solid #fed7aa' : '1px solid #bfdbfe',
  padding: '4px 10px',
  borderRadius: 8,
  height: 'fit-content',
  whiteSpace: 'nowrap'
});
