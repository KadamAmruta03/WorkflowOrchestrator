import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle, ClipboardList, Clock, PauseCircle, Trophy, Medal, Star, BellRing } from 'lucide-react';
import { employeePageContainerStyle } from './pageStyles';

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

export default function EmployeeHome({ user }) {
  const [tasks, setTasks] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [seenIds, setSeenIds] = useState(() => getSeenAnnouncementIds());

  useEffect(() => {
    Promise.allSettled([
      axios.get(`/api/tasks`),
      axios.get('/api/announcements'),
      axios.get(`/api/tasks/leaderboard`)
    ]).then((results) => {
      if (results[0].status === 'fulfilled') setTasks(results[0].value.data || []);
      if (results[1].status === 'fulfilled') setAnnouncements(results[1].value.data || []);
      if (results[2].status === 'fulfilled') setRankings(results[2].value.data || []);
    });
  }, []);

  const myTasks = useMemo(() => {
    const myId = user?.id;
    if (!myId) return [];
    return (tasks || []).filter((t) => (t.userId?._id || t.userId) === myId);
  }, [tasks, user]);

  const counts = useMemo(() => {
    const assigned = myTasks.filter((t) => t.status === 'Assigned').length;
    const pending = myTasks.filter((t) => t.status === 'Pending').length;
    const hold = myTasks.filter((t) => t.status === 'Hold').length;
    const completed = myTasks.filter((t) => t.status === 'Completed').length;
    return { assigned, pending, hold, completed };
  }, [myTasks]);

  useEffect(() => {
    const syncSeen = () => setSeenIds(getSeenAnnouncementIds());
    window.addEventListener('focus', syncSeen);
    return () => window.removeEventListener('focus', syncSeen);
  }, []);

  const unseenAnnouncements = useMemo(() => {
    return (announcements || [])
      .filter((announcement) => announcement.audience === 'All' || announcement.audience === 'Employees')
      .filter((announcement) => !seenIds.includes(announcement._id))
      .slice(0, 5);
  }, [announcements, seenIds]);

  const myRank = useMemo(() => {
    const myId = user?.id;
    if (!myId) return null;
    const index = (rankings || []).findIndex((r) => String(r._id) === String(myId));
    if (index < 0) return null;
    return {
      position: index + 1,
      total: (rankings || []).length,
      completedTasks: rankings[index]?.completedTasks || 0
    };
  }, [rankings, user]);

  const topRankings = useMemo(() => {
    return (rankings || []).slice(0, 8);
  }, [rankings]);

  const getIcon = (index) => {
    if (index === 0) return <Trophy color="#FFD700" size={18} />;
    if (index === 1) return <Medal color="#C0C0C0" size={18} />;
    if (index === 2) return <Medal color="#CD7F32" size={18} />;
    return <Star color="#cbd5e1" size={16} />;
  };

  return (
    <div style={containerStyle}>
      <div style={hero}>
        <div>
          <div style={kicker}>Welcome back</div>
          <div style={headline}>{user?.name || 'Employee'}</div>
          <div style={subhead}>Track your tasks, announcements, and leave from one place.</div>
        </div>
      </div>

      <div style={grid}>
        <div style={{ ...statCard, borderColor: '#e2e8f0' }}>
          <div style={statTop}><ClipboardList size={18} /> Assigned</div>
          <div style={statValue}>{counts.assigned}</div>
        </div>
        <div style={{ ...statCard, borderColor: '#fde68a' }}>
          <div style={statTop}><Clock size={18} /> Pending</div>
          <div style={statValue}>{counts.pending}</div>
        </div>
        <div style={{ ...statCard, borderColor: '#fed7aa' }}>
          <div style={statTop}><PauseCircle size={18} /> Hold</div>
          <div style={statValue}>{counts.hold}</div>
        </div>
        <div style={{ ...statCard, borderColor: '#bbf7d0' }}>
          <div style={statTop}><CheckCircle size={18} /> Completed</div>
          <div style={statValue}>{counts.completed}</div>
        </div>
      </div>

      <div style={panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={panelTitle}>Unread Announcements</div>
          <div style={noticePill}>
            {unseenAnnouncements.length} New
          </div>
        </div>
        {unseenAnnouncements.length === 0 ? (
          <div style={empty}>No new announcements.</div>
        ) : (
          unseenAnnouncements.map((announcement) => (
            <div key={announcement._id} style={noticeRow}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                <div style={noticeIcon(announcement.priority)}>
                  <BellRing size={14} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={meetingTitle}>{announcement.title}</div>
                  <div style={noticeMeta}>
                    {announcement.priority} • {announcement.createdAt ? new Date(announcement.createdAt).toLocaleString() : ''}
                  </div>
                  <div style={noticeBody}>{announcement.body}</div>
                </div>
              </div>
              <div style={pillStyle(announcement.priority)}>{announcement.priority}</div>
            </div>
          ))
        )}
      </div>

      <div style={panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={panelTitle}>Leaderboard</div>
          {myRank ? (
            <div style={rankPill}>
              Your Rank: #{myRank.position} • {myRank.completedTasks} done
            </div>
          ) : (
            <div style={rankPillMuted}>Complete tasks to appear</div>
          )}
        </div>

        {topRankings.length === 0 ? (
          <div style={empty}>No completed tasks yet.</div>
        ) : (
          <div style={leaderList}>
            {topRankings.map((r, index) => {
              const name = r.employeeDetails?.name || 'Unknown';
              const isMe = String(r._id) === String(user?.id);
              return (
                <div key={String(r._id)} style={{ ...leaderRow, ...(isMe ? leaderRowMe : null) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={rankNum}>{index + 1}</div>
                    {getIcon(index)}
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{name}{isMe ? ' (You)' : ''}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#2563eb' }}>{r.completedTasks}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const containerStyle = employeePageContainerStyle;
const hero = { background: 'linear-gradient(135deg, #1a2a47, #0f766e)', color: 'white', borderRadius: 8, padding: '18px 18px', width: '100%', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,0.12)' };
const kicker = { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.4, opacity: 0.85, fontWeight: 700 };
const headline = { fontSize: 22, fontWeight: 900, marginTop: 4 };
const subhead = { fontSize: 12, opacity: 0.88, marginTop: 4 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, width: '100%' };
const statCard = { background: '#fff', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)' };
const statTop = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#334155' };
const statValue = { fontSize: 26, fontWeight: 900, color: '#0f172a', marginTop: 10 };
const panel = { background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', width: '100%', padding: 14, boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)', boxSizing: 'border-box' };
const panelTitle = { fontSize: 11, fontWeight: 900, letterSpacing: 1.1, textTransform: 'uppercase', color: '#334155', marginBottom: 10 };
const noticeRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 8px', borderTop: '1px solid #f1f5f9', gap: 12 };
const meetingTitle = { fontSize: 13, fontWeight: 700, color: '#0f172a' };
const noticeMeta = { fontSize: 11, color: '#64748b', marginTop: 3 };
const noticeBody = { fontSize: 12, color: '#475569', marginTop: 6, lineHeight: 1.35 };
const noticePill = { fontSize: 11, fontWeight: 900, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 8 };
const noticeIcon = (priority) => ({ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: priority === 'High' ? '#fff7ed' : '#eff6ff', color: priority === 'High' ? '#c2410c' : '#1d4ed8', border: priority === 'High' ? '1px solid #fed7aa' : '1px solid #bfdbfe', flexShrink: 0 });
const pillStyle = (priority) => ({ fontSize: 11, fontWeight: 900, color: priority === 'High' ? '#9a3412' : '#1d4ed8', background: priority === 'High' ? '#ffedd5' : '#eff6ff', border: priority === 'High' ? '1px solid #fed7aa' : '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap' });
const empty = { padding: 12, color: '#64748b', fontSize: 13 };

const rankPill = { fontSize: 11, fontWeight: 900, color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: 8 };
const rankPillMuted = { ...rankPill, color: '#64748b', fontWeight: 800 };
const leaderList = { display: 'flex', flexDirection: 'column', gap: 8 };
const leaderRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 10px', borderRadius: 8, border: '1px solid #f1f5f9', background: '#fff' };
const leaderRowMe = { border: '1px solid #93c5fd', background: '#eff6ff' };
const rankNum = { width: 20, textAlign: 'center', fontSize: 12, fontWeight: 900, color: '#64748b' };
