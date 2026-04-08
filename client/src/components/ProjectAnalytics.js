import React from 'react';
import { CheckCircle2, CircleDashed, Target, User, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { adminPageContainerStyle, adminPageHeaderStyle, adminPageTitleStyle, adminPageSubtitleStyle } from './pageStyles';

const ProjectAnalytics = ({ tasks = [] }) => {
  // Group tasks by project
  const projects = Array.isArray(tasks) ? tasks.reduce((acc, task) => {
    if (!task) return acc;

    const pName = task.projectName || "Unassigned Project";
    if (!acc[pName]) {
      acc[pName] = { total: 0, completed: 0, team: [] };
    }
    
    acc[pName].total += 1;
    const isDone = task.status === 'Completed' || task.status === 'completed';
    if (isDone) {
      acc[pName].completed += 1;
    }
    
    const displayName = task.userId?.name || "Unknown Member";

    acc[pName].team.push({
      memberName: displayName,
      taskTitle: task.title || "Untitled Task",
      isCompleted: isDone // Added status tracking for individual team items
    });

    return acc;
  }, {}) : {};

  return (
    <div style={containerStyle}>
      <div style={headerWrapper}>
        <div>
          <h2 style={adminPageTitleStyle}>Project Analytics</h2>
          <p style={adminPageSubtitleStyle}>Deliverables by project and resource.</p>
        </div>
      </div>

      <div style={projectGrid}>
        {Object.keys(projects).map((name) => {
          const { total, completed, team } = projects[name];
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          return (
            <div key={name} style={card}>
              <div style={cardTop}>
                <div style={nameBox}>
                  <Target size={16} color="#3498db" />
                  <span style={projectNameText}>{name}</span>
                </div>
                <div style={badge(percentage)}>{percentage}%</div>
              </div>

              <div style={barWrapper}>
                <div style={barContainer}>
                  <div style={barFill(percentage)} />
                </div>
              </div>

              <div style={statsRow}>
                <div style={statItem}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span style={statText}><b>{completed}</b> Done</span>
                </div>
                <div style={statItem}>
                  <CircleDashed size={14} color="#94a3b8" />
                  <span style={statText}><b>{total - completed}</b> Left</span>
                </div>
              </div>

              <h4 style={teamTitle}>Team Assignments</h4>
              
              <div className="visible-scrollbar" style={scrollContainer}>
                {team.map((item, idx) => (
                  <div key={idx} style={{...teamMemberRow, borderLeft: item.isCompleted ? '3px solid #10b981' : '3px solid #cbd5e1'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={memberNameWrap}>
                                <User size={12} color="#1a2a47" />
                                <span style={memberNameText}>{item.memberName}</span>
                            </div>
                            <div style={taskNameWrap}>
                                <Briefcase size={12} color="#64748b" />
                                <span style={taskNameText}>{item.taskTitle}</span>
                            </div>
                        </div>
                        {/* Status Icon for HR Visibility */}
                        <div style={{ marginTop: '2px' }}>
                            {item.isCompleted ? 
                                <CheckCircle size={14} color="#10b981" /> : 
                                <Clock size={14} color="#94a3b8" />
                            }
                        </div>
                    </div>
                  </div>
                ))}
              </div>

              <style>{`
                .visible-scrollbar::-webkit-scrollbar { width: 5px; }
                .visible-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .visible-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .visible-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
              `}</style>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const containerStyle = adminPageContainerStyle;

// --- STYLING (REMAINING UNCHANGED) ---
const headerWrapper = adminPageHeaderStyle;
const projectGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', width: '100%' };
const card = { background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', minHeight: '220px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 };
const cardTop = { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' };
const nameBox = { display: 'flex', alignItems: 'center', gap: '8px' };
const projectNameText = { fontWeight: '500', fontSize: '12px', color: '#1e293b' };
const badge = (pct) => ({ fontSize: '10px', fontWeight: '500', padding: '4px 8px', borderRadius: '8px', background: pct === 100 ? '#dcfce7' : '#e0f2fe', color: pct === 100 ? '#166534' : '#0369a1' });
const barWrapper = { marginBottom: '6px' };
const barContainer = { height: '4px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' };
const barFill = (pct) => ({ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#3498db', transition: 'width 0.5s' });
const statsRow = { display: 'flex', gap: '15px', marginBottom: '-5px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' };
const statItem = { display: 'flex', alignItems: 'center', gap: '-5px' };
const statText = { fontSize: '10px', color: '#64748b' };
const teamTitle = { fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', marginBottom: '5px', letterSpacing: '0.5px' };
const scrollContainer = { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' };
const teamMemberRow = { padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' };
const memberNameWrap = { display: 'flex', alignItems: 'center', gap: '6px' };
const memberNameText = { fontSize: '10px', fontWeight: '700', color: '#1a2a47' };
const taskNameWrap = { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' };
const taskNameText = { fontSize: '10px', color: '#64748b' };

export default ProjectAnalytics;
