import React from 'react';
import { TrendingUp, Star, Award, BookOpen } from 'lucide-react';

const Performance = ({ employees = [], tasks = [] }) => {
  
  const calculateScore = (userId) => {
    const userTasks = tasks.filter(t => (t.userId?._id || t.userId) === userId);
    if (userTasks.length === 0) return 0;
    const completed = userTasks.filter(t => t.status === 'Completed').length;
    return Math.round((completed / userTasks.length) * 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div style={headerStyle}>
        <TrendingUp size={28} color="#8e44ad" />
        <h2 style={{ margin: 0 }}>Performance & Skill Matrix</h2>
      </div>

      <div style={gridStyle}>
        {employees.map(emp => {
          const score = calculateScore(emp._id);
          return (
            <div key={emp._id} style={perfCard}>
              <div style={topRow}>
                <h3 style={{ margin: 0 }}>{emp.name}</h3>
                <div style={scoreBadge(score)}>{score}% Efficiency</div>
              </div>

              <div style={skillSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748b' }}>
                  <BookOpen size={14} /> Skills:
                </div>
                <div style={tagContainer}>
                  {emp.skills && emp.skills.length > 0 ? emp.skills.map((s, i) => (
                    <span key={i} style={skillTag}>{s}</span>
                  )) : <span style={{ color: '#94a3b8', fontSize: '12px' }}>No skills listed</span>}
                </div>
              </div>

              <div style={footerRow}>
                <div style={iconText}><Star size={14} color="#f59e0b" /> Top Performer Candidate</div>
                <Award size={20} color={score > 80 ? "#f59e0b" : "#cbd5e1"} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Styles
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' };
const headerStyle = { display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const perfCard = { background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const topRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const scoreBadge = (s) => ({ padding: '4px 12px', borderRadius: '8px', background: s > 70 ? '#f0fdf4' : '#fef2f2', color: s > 70 ? '#16a34a' : '#dc2626', fontWeight: 'bold', fontSize: '12px' });
const skillSection = { marginTop: '10px', padding: '10px 0', borderTop: '1px solid #f1f5f9' };
const tagContainer = { display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' };
const skillTag = { background: '#eff6ff', color: '#2563eb', padding: '2px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' };
const footerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' };
const iconText = { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' };

export default Performance;
