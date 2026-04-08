import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, CheckCircle, AlertTriangle, TrendingUp, 
  Calendar, Clock, User as UserIcon, 
  Trophy, Medal, ShieldAlert
} from 'lucide-react';
import { adminPageContainerStyle } from './pageStyles';

const Home = ({ employees = [], tasks = [], meetings = [] }) => {
  const [rankings, setRankings] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);

  useEffect(() => {
    axios.get('/api/tasks/leaderboard')
      .then(res => setRankings(res.data.slice(0, 10))) // Increased slice to show scrollability
      .catch(err => console.error(err));

    axios.get('/api/leaves')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeToday = data.filter(l => {
          if (l.status !== 'Approved') return false;
          const start = new Date(l.startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(start.getDate() + (Number(l.days) || 1));
          end.setHours(23, 59, 59, 999);
          return today >= start && today <= end;
        }).length;
        setLeaveCount(activeToday);
      }).catch(err => console.error(err));
  }, []);

  const totalStaff = employees.length;
  const employmentTypes = employees.reduce((acc, e) => {
    const type = e.employeeType; 
    if (type === 'Full-time') acc['Full-time'] += 1;
    else if (type === 'Contract') acc['Contract'] += 1;
    else if (type === 'Intern') acc['Intern'] += 1;
    return acc;
  }, { 'Full-time': 0, 'Contract': 0, 'Intern': 0 });

  const weeklyTaskStats = useMemo(() => {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 7);

    const relevant = (tasks || []).filter((t) => {
      const d = t?.createdAt ? new Date(t.createdAt) : (t?.updatedAt ? new Date(t.updatedAt) : null);
      return d && !Number.isNaN(d.getTime()) && d >= weekStart;
    });

    return relevant.reduce(
      (acc, t) => {
        const s = String(t?.status || '').trim().toLowerCase();
        if (s === 'on hold' || s === 'hold') acc.hold += 1;
        else if (s === 'pending') acc.pending += 1;
        else if (s === 'completed') acc.completed += 1;
        return acc;
      },
      { hold: 0, pending: 0, completed: 0, total: relevant.length }
    );
  }, [tasks]);

  const femaleCount = employees.filter(e => e.gender?.toLowerCase() === 'female').length;
  const maleCount = employees.filter(e => e.gender?.toLowerCase() === 'male').length;
  const femalePercent = totalStaff > 0 ? Math.round((femaleCount / totalStaff) * 100) : 0;
  const malePercent = totalStaff > 0 ? Math.round((maleCount / totalStaff) * 100) : 0;

  const overdueCount = tasks.filter(t => {
    if (t.status === 'Completed' || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date().setHours(0, 0, 0, 0);
  }).length;

  const getWorkload = (userId) => {
    return tasks
      .filter(task => (task.userId?._id || task.userId) === userId && task.status !== 'Completed')
      .reduce((sum, task) => sum + (Number(task.priority) || 0), 0);
  };

  const staffWithLoads = employees.map(emp => ({ ...emp, currentWorkload: getWorkload(emp._id) }));
  const atRisk = staffWithLoads.filter(e => e.currentWorkload > 8);

  const calculateSystemHealth = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const efficiencyScore = totalTasks > 0 ? (completedTasks / totalTasks) * 50 : 0;
    const healthyStaffCount = totalStaff - atRisk.length;
    const stabilityScore = totalStaff > 0 ? (healthyStaffCount / totalStaff) * 50 : 0;
    const health = Math.round(efficiencyScore + stabilityScore);
    let grade = 'F';
    let color = '#b21f1f'; 
    if (health >= 90) { grade = 'A+'; color = '#004d40'; }
    else if (health >= 80) { grade = 'B'; color = '#004d40'; }
    else if (health >= 50) { grade = 'C'; color = '#4a148c'; }
    return { health, color, grade };
  };
  const { health: healthValue, color: healthColor, grade: healthGrade } = calculateSystemHealth();

  const avgAge = totalStaff > 0 ? Math.round(employees.reduce((acc, e) => acc + (Number(e.calculatedAge) || 30), 0) / totalStaff) : 0;

  const deptData = employees.reduce((acc, e) => {
    if (e.department) acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: 'Total Staff', value: totalStaff, defaultColor: '#1a2a6c', icon: <Users /> },
    { label: 'Avg Age', value: `${avgAge} Yrs`, defaultColor: '#1e293b', icon: <Clock /> },
    { label: 'Tasks Done', value: tasks.filter(t => t.status === 'Completed').length, defaultColor: '#004d40', icon: <CheckCircle /> },
    { label: 'Overdue Task', value: overdueCount, defaultColor: overdueCount === 0 ? '#004d40' : '#b21f1f', icon: <AlertTriangle />, isOverdueTile: true },
    { label: `Health: ${healthGrade}`, value: `${healthValue}%`, defaultColor: healthColor, icon: <TrendingUp /> },
    { label: 'On Leave Today', value: leaveCount, defaultColor: leaveCount > 0 ? '#b21f1f' : '#004d40', icon: <ShieldAlert /> },
  ];

  return (
    <div style={containerStyle}>       
      <style>{globalScrollbarStyle}</style>
      

      {/* Top Stats Bar */}
      <div style={cardGrid}>
        {stats.map((stat, i) => {
          const isZero = stat.value === 0 || stat.value === "0%";
          const finalBgColor = stat.isOverdueTile ? stat.defaultColor : (isZero ? '#1e293b' : stat.defaultColor);
          return (
            <React.Fragment key={i}>
              <div style={{ ...statCard, backgroundColor: finalBgColor }}>
                <div style={iconStyle}>{stat.icon}</div>
                <div>
                  <div style={statLabel}>{stat.label}</div>
                  <div style={statValue}>{stat.value}</div>
                </div>
              </div>
              {stat.label === 'Total Staff' && (
                <div style={genderCardNavy}>
                  <div style={genderSection}><span style={{...genderLabelDark, color: '#60a5fa'}}>Male</span><div style={genderIconGroup}><UserIcon size={18} color="#60a5fa" fill="#60a5fa" /> <span style={genderValueDark}>{malePercent}%</span></div></div>
                  <div style={divider} />
                  <div style={genderSection}><span style={{...genderLabelDark, color: '#f472b6'}}>Female</span><div style={genderIconGroup}><UserIcon size={18} color="#f472b6" fill="#f472b6" /> <span style={genderValueDark}>{femalePercent}%</span></div></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Masonry-like columns (prevents empty vertical gaps) */}
      <div style={threeColGrid}>
        <div style={colStack}>
          <div style={sectionContainer}>
            <div style={tileHeader}>
              <h2 style={sectionTitle}>Weekly Task Status</h2>
              <div style={tileCornerMeta}>Last 7 days: {weeklyTaskStats.total} tasks</div>
            </div>
            <div style={weeklyScrollArea}>
              <div style={recruitRow}>
                <div style={recruitItem}><span>Hold</span><strong>{weeklyTaskStats.hold}</strong></div>
                <div style={recruitItem}><span>Pending</span><strong>{weeklyTaskStats.pending}</strong></div>
                <div style={recruitItem}><span>Completed</span><strong>{weeklyTaskStats.completed}</strong></div>
              </div>
            </div>
          </div>

          <div style={sectionContainer}>
            <h2 style={sectionTitle}>Dept Distribution</h2>
            <div style={deptScrollArea}>
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {Object.entries(deptData).map(([dept, count]) => (
                  <div key={dept}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', fontWeight:'700', marginBottom:'3px'}}><span>{dept}</span><span>{count}</span></div>
                    <div style={{width:'100%', height:'6px', background:'#e2e8f0', borderRadius:'8px'}}>
                      <div style={{width: `${(count/totalStaff)*100}%`, height:'100%', background:'#1a2a6c', borderRadius:'8px'}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={colStack}>
          <div style={sectionContainer}>
            <h2 style={sectionTitle}>Employment Type</h2>
            <div style={tileScrollArea}>
              <div style={listStack}>
                {Object.entries(employmentTypes).map(([type, count]) => (
                  <div key={type} style={miniLeaderboardItem}>
                    <span style={{fontSize:'12px', fontWeight:'600'}}>{type}</span>
                    <span style={badgeStyle}>{count} Staff</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={sectionContainer}>
            <h2 style={sectionTitle}>Upcoming Meetings</h2>
            <div style={tileScrollArea}>
              <div style={listStack}>
                {meetings.map((meet, i) => (
                  <div key={i} style={miniLeaderboardItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={14} color="#1a2a6c" /> <span style={{ fontSize: '12px', fontWeight: '600' }}>{meet.title}</span></div>
                    <div style={{fontSize:'10px', color:'#64748b'}}>{meet.date}</div>
                  </div>
                ))}
                {meetings.length === 0 && <div style={emptyCard}>No meetings scheduled.</div>}
              </div>
            </div>
          </div>
        </div>

        <div style={colStack}>
          <div style={sectionContainer}>
            <h2 style={sectionTitle}>Leaderboard (Top 10)</h2>
            <div style={tileScrollArea}>
              <div style={listStack}>
                {rankings.map((emp, i) => (
                  <div key={i} style={miniLeaderboardItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {i === 0 ? <Trophy color="#FFD700" size={18} /> : <Medal color="#cbd5e1" size={18} />} 
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>{emp.employeeDetails?.name}</span>
                    </div>
                    <div style={badgeStyle}>{emp.completedTasks} Tasks</div>
                  </div>
                ))}
                {rankings.length === 0 ? <div style={emptyCard}>No leaderboard data yet.</div> : null}
              </div>
            </div>
          </div>

          <div style={sectionContainer}>
            <h2 style={sectionTitle}>Burnout Guard</h2>
            <div style={tileScrollArea}>
              <div style={listStack}>
                {atRisk.length > 0 ? atRisk.map((e, i) => (
                  <div key={i} style={burnoutCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={avatarCircle}><UserIcon size={14} /></div> <div style={{ fontWeight: '600', fontSize: '13px' }}>{e.name}</div></div>
                    <div style={{ color: '#b21f1f', fontWeight: '800' }}>{e.currentWorkload} pts</div>
                  </div>
                )) : <div style={emptyCard}>All staff safe.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---

const scrollArea = {
  maxHeight: '140px',
  overflowY: 'auto',
  paddingRight: '5px',
  msOverflowStyle: 'none',
  scrollbarWidth: 'thin'
};

// Custom scrollbar for Webkit browsers (Chrome, Safari)
const globalScrollbarStyle = `
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const cardGrid = { display: 'grid', gap: '15px', width: '100%', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', alignItems: 'stretch' };
const threeColGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', width: '100%', boxSizing: 'border-box', alignItems: 'start' };
const containerStyle = adminPageContainerStyle;
const statCard = { padding: '12px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '72px', height: '100%', boxSizing: 'border-box' };
const genderCardNavy = { background: '#1a2a6c', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', minHeight: '72px', height: '100%', boxSizing: 'border-box' };
const genderSection = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const genderIconGroup = { display: 'flex', alignItems: 'center', gap: '5px' };
const genderLabelDark = { fontSize: '9px', textTransform: 'uppercase', fontWeight: '700' };
const genderValueDark = { fontSize: '16px', fontWeight: '800', color: 'white' };
const divider = { width: '1px', height: '25px', backgroundColor: 'rgba(255,255,255,0.2)' };
const sectionContainer = { background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' };
const sectionTitle = { fontSize: '11px', color: '#1e293b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' };
const statLabel = { fontSize: '10px', opacity: 0.9, fontWeight: '700', textTransform: 'uppercase' };
const statValue = { fontSize: '20px', fontWeight: '900' };
const iconStyle = { opacity: 0.8 };
const listStack = { display: 'flex', flexDirection: 'column', gap: '8px' };
const miniLeaderboardItem = { background: 'white', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' };
const badgeStyle = { background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '8px', fontSize: '9px', fontWeight: '800' };
const recruitRow = { display: 'flex', justifyContent: 'space-between', gap: '10px' };
const recruitItem = { flex: 1, background: 'white', padding: '12px 8px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #f1f5f9', fontSize: '11px' };
const burnoutCard = { background: '#fff5f5', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', border: '1px solid #fee2e2' };
const avatarCircle = { background: '#fecaca', padding: '5px', borderRadius: '8px', color: '#b21f1f' };
const emptyCard = { padding: '15px', background: '#f1f5f9', borderRadius: '8px', color: '#64748b', textAlign: 'center', fontSize: '12px' };

const tileHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 };
const tileCornerMeta = { fontSize: 11, color: '#64748b', fontWeight: 800, whiteSpace: 'nowrap' };
const weeklyScrollArea = { ...scrollArea, maxHeight: '90px' };
const tileScrollArea = { ...scrollArea, maxHeight: '140px' };
const deptScrollArea = { ...scrollArea, maxHeight: '220px' };
const colStack = { display: 'flex', flexDirection: 'column', gap: '15px', minWidth: 0 };

export default Home;
