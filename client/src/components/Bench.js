import React from 'react';
import { Coffee, UserCheck, Send } from 'lucide-react';
import { adminPageContainerStyle } from './pageStyles';

// 1. Added onAssign to props
const Bench = ({ employees = [], tasks = [], onAssign }) => {
  
  const freeStaff = employees.filter(emp => {
    const activeTasks = tasks.filter(t => {
      const ownerId = t.userId?._id || t.userId;
      return ownerId === emp._id && t.status !== 'Completed';
    });
    return activeTasks.length === 0;
  });

  return (
    <div style={adminPageContainerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <Coffee color="#8d6e63" size={28} />
          <h2 style={{ margin: 0, color: '#1e293b' }}>The Bench (Free Staff)</h2>
        </div>

        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          These employees currently have 0 active tasks and are available for assignment.
        </p>

        <div style={listStyle}>
          {freeStaff.length > 0 ? freeStaff.map(emp => (
            <div key={emp._id} style={benchCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={avatarStyle}>
                  <UserCheck size={20} color="#059669" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{emp.name}</div>
                  <div style={{ fontSize: '12px', color: '#10b981' }}>Available Now</div>
                </div>
              </div>
              
              {/* 2. Added onClick to call onAssign */}
              <button 
                style={assignBtn}
                onClick={() => onAssign(emp)} 
              >
                <Send size={14} /> Assign Task
              </button>
            </div>
          )) : (
            <div style={emptyNote}>Everyone is currently busy!</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ... keep all your existing styles exactly the same ...
const cardStyle = { background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' };
const listStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const benchCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' };
const avatarStyle = { background: '#dcfce7', padding: '10px', borderRadius: '8px' };
const assignBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' };
const emptyNote = { padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '2px dashed #e2e8f0' };

export default Bench;
