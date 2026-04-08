import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Video, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useAppRefresh } from '../utils/appRefresh';
import { adminPageContainerStyle, adminPageHeaderStyle, adminPageTitleStyle, adminPageSubtitleStyle } from './pageStyles';

const MeetingSch = ({ readOnly = false }) => {
  const [meetings, setMeetings] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', time: '', link: '' });

  const fetchMeetings = async () => {
    try {
      const res = await axios.get('/api/meetings');
      setMeetings(res.data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchMeetings(); }, []);

  useAppRefresh(() => {
    fetchMeetings();
  });

  const formatLink = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalizedData = { ...formData, link: formatLink(formData.link) };
    await axios.post('/api/meetings', finalizedData);
    setFormData({ title: '', date: '', time: '', link: '' });
    fetchMeetings();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Cancel this meeting?")) {
      await axios.delete(`/api/meetings/${id}`);
      fetchMeetings();
    }
  };

  return (
    <div style={containerStyle}>
      {/* ADDED HEADER SECTION */}
      <div style={headerWrapper}>
        <div>
          <h2 style={adminPageTitleStyle}>
            {readOnly ? 'Meetings' : 'Meeting Scheduler'}
          </h2>
          <p style={adminPageSubtitleStyle}>
            {readOnly ? 'View upcoming meetings' : 'Coordinate team sync-ups & video calls'}
          </p>
        </div>
      </div>

      <div style={contentLayout}>
        {/* FORM SECTION - Preserved exactly as provided */}
        {!readOnly && (
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1a2a47' }}>
              <Plus size={18} style={{ verticalAlign: 'middle' }} /> Schedule New Meeting
            </h3>
            <form onSubmit={handleSubmit} style={formStyle}>
              <input type="text" placeholder="Meeting Title" required value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
              <input type="date" required value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} style={inputStyle} />
              <input type="time" required value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})} style={inputStyle} />
              <input type="text" placeholder="https://zoom.us/xxxxx" value={formData.link} 
                onChange={e => setFormData({...formData, link: e.target.value})} style={inputStyle} />
              <button type="submit" style={btnStyle}>Schedule</button>
            </form>
          </div>
        )}

        {/* LIST SECTION - Preserved exactly as provided */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1a2a47' }}>Upcoming Meetings</h3>
          {meetings.length === 0 ? <p style={{ color: '#64748b' }}>No meetings scheduled.</p> : (
            meetings.map(m => (
              <div key={m._id} style={meetingItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={dateBadge}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{new Date(m.date).getDate()}</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#1e293b' }}>{m.title}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {m.time}</span>
                      {m.link && <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}><ExternalLink size={12} /> External Link</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {m.link && (
                    <a href={m.link} target="_blank" rel="noreferrer" style={linkBtn}>
                      <Video size={14} /> Join
                    </a>
                  )}
                  {!readOnly && (
                    <button onClick={() => handleDelete(m._id)} style={deleteBtn}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- UPDATED STYLES ---
const containerStyle = adminPageContainerStyle;

const headerWrapper = adminPageHeaderStyle;

const contentLayout = {
  display: 'flex', 
  gap: '20px', 
  flexDirection: 'column'
};

const cardStyle = { 
  background: '#f8fafc', 
  padding: '24px', 
  borderRadius: '8px', 
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)' 
};

const formStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: '1', minWidth: '180px', fontSize: '14px' };
const btnStyle = { padding: '10px 24px', backgroundColor: '#1a2a47', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const meetingItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f1f5f9' };
const dateBadge = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', minWidth: '50px', border: '1px solid #e2e8f0', color: '#475569' };
const linkBtn = { display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', backgroundColor: '#3498db', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', transition: '0.2s' };
const deleteBtn = { padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' };

export default MeetingSch;
