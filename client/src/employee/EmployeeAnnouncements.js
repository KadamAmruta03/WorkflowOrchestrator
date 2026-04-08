import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Bell, Megaphone, AlertTriangle } from 'lucide-react';
import { useAppRefresh } from '../utils/appRefresh';
import { employeePageContainerStyle, employeePageHeaderStyle, employeePageTitleStyle, employeePageSubtitleStyle } from './pageStyles';

const HIGH_SEEN_KEY = 'seenHighAnnouncementId';
const SEEN_ANNOUNCEMENT_IDS_KEY = 'seenAnnouncementIds';

const getSeenAnnouncementIds = () => {
  try {
    const raw = localStorage.getItem(SEEN_ANNOUNCEMENT_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveSeenAnnouncementIds = (ids) => {
  localStorage.setItem(SEEN_ANNOUNCEMENT_IDS_KEY, JSON.stringify(ids));
};

export default function EmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [seenIds, setSeenIds] = useState(() => getSeenAnnouncementIds());

  const fetchAnnouncements = async () => {
    const res = await axios.get('/api/announcements');
    setAnnouncements(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    fetchAnnouncements().catch(() => setError('Failed to load announcements.'));
    const id = setInterval(() => fetchAnnouncements().catch(() => {}), 15000);
    return () => clearInterval(id);
  }, []);

  useAppRefresh(() => {
    fetchAnnouncements().catch(() => setError('Failed to load announcements.'));
  });

  const visible = useMemo(() => {
    // Employee audience filtering
    return (announcements || []).filter((a) => a.audience === 'All' || a.audience === 'Employees');
  }, [announcements]);

  const latestHigh = useMemo(() => {
    return visible.find((a) => a.priority === 'High') || null;
  }, [visible]);

  const [bannerId, setBannerId] = useState('');

  useEffect(() => {
    const latestId = latestHigh?._id;
    if (!latestId) return;
    const seen = localStorage.getItem(HIGH_SEEN_KEY);
    if (seen === latestId) return;

    setBannerId(latestId);

    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      new Notification(`High Priority: ${latestHigh.title}`, {
        body: latestHigh.body?.slice(0, 120) || ''
      });
    } catch {
      // ignore
    }
  }, [latestHigh?._id, latestHigh?.title, latestHigh?.body]);

  const enableNotifications = async () => {
    if (!('Notification' in window)) return;
    try {
      await Notification.requestPermission();
    } catch {
      // ignore
    }
  };

  const markHighSeen = () => {
    if (!bannerId) return;
    localStorage.setItem(HIGH_SEEN_KEY, bannerId);
    if (!seenIds.includes(bannerId)) {
      const nextIds = [...seenIds, bannerId];
      setSeenIds(nextIds);
      saveSeenAnnouncementIds(nextIds);
    }
    setBannerId('');
  };

  const markAnnouncementSeen = (announcementId) => {
    if (seenIds.includes(announcementId)) return;
    const nextIds = [...seenIds, announcementId];
    setSeenIds(nextIds);
    saveSeenAnnouncementIds(nextIds);
  };

  return (
    <div style={containerStyle}>
      <div style={header}>
        <div>
          <h2 style={employeePageTitleStyle}>Announcements</h2>
          <p style={employeePageSubtitleStyle}>Central updates. High priority can trigger notifications.</p>
        </div>
        <button onClick={enableNotifications} style={notifyBtn} title="Enable browser notifications">
          <Bell size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Enable Notifications
        </button>
      </div>

      {bannerId && latestHigh ? (
        <div style={banner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color="#b45309" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 13 }}>High Priority: {latestHigh.title}</div>
              <div style={{ color: '#475569', fontSize: 12, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {latestHigh.body}
              </div>
            </div>
          </div>
          <button onClick={markHighSeen} style={bannerBtn}>Mark as Seen</button>
        </div>
      ) : null}

      {error ? <div style={errorBox}>{error}</div> : null}

      <div style={list}>
        {visible.map((a) => (
          <div key={a._id} style={{ ...card, ...(a.priority === 'High' ? cardHigh : null) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
                <div style={iconBubble(a.priority)}>
                  <Megaphone size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.title}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                    {a.priority} • {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              </div>
              <div style={cardActions}>
                <div style={pill(a.priority)}>{a.priority}</div>
                {!seenIds.includes(a._id) ? (
                  <button type="button" onClick={() => markAnnouncementSeen(a._id)} style={seenBtn}>
                    Mark Seen
                  </button>
                ) : (
                  <div style={seenTag}>Seen</div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 10, color: '#334155', fontSize: 13, lineHeight: 1.35 }}>{a.body}</div>
          </div>
        ))}

        {visible.length === 0 ? (
          <div style={empty}>No announcements yet.</div>
        ) : null}
      </div>
    </div>
  );
}

const containerStyle = employeePageContainerStyle;
const header = { ...employeePageHeaderStyle, alignItems: 'center', flexWrap: 'wrap' };
const notifyBtn = { padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 900, color: '#0f172a' };
const list = { display: 'flex', flexDirection: 'column', gap: 12, width: '100%' };
const card = { background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 14, boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)' };
const cardHigh = { border: '1px solid #fed7aa', boxShadow: '0 2px 12px rgba(234, 88, 12, 0.12)' };
const cardActions = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 };
const iconBubble = (priority) => ({
  width: 34,
  height: 34,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: priority === 'High' ? '#fff7ed' : '#eff6ff',
  border: priority === 'High' ? '1px solid #fed7aa' : '1px solid #bfdbfe',
  color: priority === 'High' ? '#c2410c' : '#1d4ed8'
});
const pill = (priority) => ({
  fontSize: 11,
  fontWeight: 900,
  color: priority === 'High' ? '#9a3412' : '#1d4ed8',
  background: priority === 'High' ? '#ffedd5' : '#eff6ff',
  border: priority === 'High' ? '1px solid #fed7aa' : '1px solid #bfdbfe',
  padding: '4px 10px',
  borderRadius: 8,
  height: 'fit-content'
});
const seenBtn = { border: 'none', background: '#1a2a47', color: '#fff', padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' };
const seenTag = { fontSize: 11, fontWeight: 900, color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap' };
const empty = { padding: 14, color: '#64748b', fontSize: 13, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, width: '100%', boxSizing: 'border-box' };
const errorBox = { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 10, borderRadius: 8, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const banner = { width: '100%', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxSizing: 'border-box' };
const bannerBtn = { border: 'none', background: '#1a2a47', color: '#fff', padding: '10px 12px', borderRadius: 8, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' };
