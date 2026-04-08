import React, { useState, useEffect } from 'react';
import { Search, UserCheck, AlertCircle, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { adminPageContainerStyle, adminPageHeaderStyle, adminPageTitleStyle, adminPageSubtitleStyle } from './pageStyles';

const ProjectMatcher = ({ employees = [], tasks = [], onAssign }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [matches, setMatches] = useState([]);

  const departments = ['All', ...new Set(employees.map(emp => emp.department).filter(Boolean))];

  useEffect(() => {
    let filtered = [...employees];
    if (selectedDept !== 'All') {
      filtered = filtered.filter(emp => emp.department === selectedDept);
    }
    if (searchQuery.trim()) {
      const requiredSkills = searchQuery.toLowerCase().split(',').map(s => s.trim()).filter(s => s !== "");
      filtered = filtered.filter(emp => {
        if (!emp.skills) return false;
        const empSkills = emp.skills.map(s => s.toLowerCase());
        return requiredSkills.some(skill => empSkills.includes(skill));
      });
    }
    setMatches(filtered);
  }, [searchQuery, selectedDept, employees]);

  const getWorkloadStatus = (userId) => {
    const activeTasks = tasks.filter(t => 
      (t.userId?._id === userId || t.userId === userId) && t.status === 'Pending'
    ).length;
    if (activeTasks === 0) return { label: 'Available', color: '#16a34a', icon: <CheckCircle2 size={12} /> };
    if (activeTasks <= 2) return { label: 'Busy', color: '#ca8a04', icon: <Clock size={12} /> };
    return { label: 'Overloaded', color: '#dc2626', icon: <AlertCircle size={12} /> };
  };

  return (
    <div style={containerStyle}>
      <div style={headerWrapper}>
        <div>
          <h2 style={adminPageTitleStyle}>Smart Project Matcher</h2>
          <p style={adminPageSubtitleStyle}>Resource allocation and skill matching.</p>
        </div>
      </div>

      <div style={searchContainer}>
        <Search size={20} style={searchIcon} />
        <input
          type="text"
          placeholder="Search by skills (e.g. React, Node.js)..."
          style={inputStyle}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={deptTabWrapper}>
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            style={deptTab(selectedDept === dept)}
          >
            {dept !== 'All' && <Building2 size={12} style={{marginRight: '4px'}} />}
            {dept}
          </button>
        ))}
      </div>

      <div style={gridStyle}>
        {matches.length > 0 ? (
          matches.map(emp => {
            const required = searchQuery.toLowerCase().split(',').map(s => s.trim()).filter(s => s !== "");
            const status = getWorkloadStatus(emp._id);

            return (
              <div key={emp._id} style={cardStyle}>
                <div style={cardTop}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: '#1a2a47', fontSize: '15px', fontWeight: 'bold' }}>{emp.name}</h4>
                    <span style={{fontSize: '11px', color: '#94a3b8'}}>{emp.department || 'General'}</span>
                    <div style={{ ...statusBadge, color: status.color, border: `1px solid ${status.color}`, marginTop: '4px' }}>
                      {status.icon} {status.label}
                    </div>
                  </div>
                  {/* REMOVED: The scoreCircle div that was showing 100% */}
                </div>

                <div style={skillBox}>
                  <div style={tagContainer}>
                    {emp.skills?.slice(0, 4).map((s, i) => (
                      <span key={i} style={skillTag(required.includes(s.toLowerCase()))}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  style={assignBtn} 
                  onClick={() => onAssign({ 
                    id: emp._id, 
                    name: emp.name, 
                    skillsSearched: searchQuery 
                  })}
                >
                  <UserCheck size={14} /> Assign
                </button>
              </div>
            );
          })
        ) : (
          <div style={emptyState}>No team members found.</div>
        )}
      </div>
    </div>
  );
};

// --- STYLES (KEPT EXACTLY AS PER YOUR 4-COLUMN VIEW) ---
const containerStyle = adminPageContainerStyle;
const headerWrapper = adminPageHeaderStyle;
const searchContainer = { position: 'relative', width: '80%' };
const searchIcon = { position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' };
const inputStyle = { width: '128%', padding: '10px 45px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' };
const deptTabWrapper = { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' };
const deptTab = (isActive) => ({ padding: '10px 20px', borderRadius: '8px', border: isActive ? '1px solid #1a2a47' : '1px solid #e2e8f0', background: isActive ? '#1a2a47' : '#fff', color: isActive ? '#fff' : '#64748b', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' });
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' };
const cardStyle = { background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const statusBadge = { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '8px', padding: '1px 3px', borderRadius: '8px', width: '50px' };
const skillBox = { margin: '10px 0', flex: 1 };
const tagContainer = { display: 'flex', flexWrap: 'wrap', gap: '4px' };
const skillTag = (match) => ({ fontSize: '9px', padding: '2px 8px', borderRadius: '8px', background: match ? '#dcfce7' : '#f8fafc', color: match ? '#166534' : '#64748b', border: '1px solid #e2e8f0' });
const assignBtn = { width: '100%', padding: '8px', borderRadius: '8px', background: '#1a2a47', color: '#fff', cursor: 'pointer', border: 'none', display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: '500' };
const emptyState = { gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' };

export default ProjectMatcher;
