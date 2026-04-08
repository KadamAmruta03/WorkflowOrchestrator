import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { emitAppRefresh } from '../utils/appRefresh';

const Header = ({ user, onLogout, onRefresh }) => {


  const [refreshHover, setRefreshHover] = useState(false);
  const [refreshSpin, setRefreshSpin] = useState(false);

  const handleRefresh = () => {
    setRefreshSpin(true);
    setTimeout(() => setRefreshSpin(false), 650);

    if (typeof onRefresh === 'function') onRefresh();
    emitAppRefresh();
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        
        {/* Left Side Group */}
        <div style={leftGroup}>
          <h1 style={systemNameStyle}>Workflow Orchestrator</h1>
          {user && (
            <>
              <div style={divider}></div>
              <span style={leftUserName} title={user.email || ''}>{user.name}</span>
            </>
          )}
        </div>

        {/* Right Side Status Indicator has been removed from here */}
        {user && (
          <div style={rightGroup}>
            {onLogout && (
              <button onClick={onLogout} style={logoutBtn} type="button">
                Logout
              </button>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh"
              aria-label="Refresh"
              style={refreshBtn(refreshHover)}
              onMouseEnter={() => setRefreshHover(true)}
              onMouseLeave={() => setRefreshHover(false)}
            >
              <RefreshCw
                size={16}
                style={{
                  transition: 'transform 650ms ease',
                  transform: refreshSpin ? 'rotate(240deg)' : 'rotate(0deg)',
                  opacity: 1
                }}
              />
            </button>
          </div>
        )}
        
      </div>
    </header>
  );
};

// --- STYLES ---
const headerStyle = {
  height: '50px',
  backgroundColor: '#FEFEFA',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  padding: '0 20px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
};

const leftGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const systemNameStyle = {
  margin: 0,
  color: '#1a2a47',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '-0.3px'
};

const divider = {
  width: '1px',
  height: '18px',
  backgroundColor: '#cbd5e1',
  margin: '0 4px'
};

const rightGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const userName = {
  fontSize: '12px',
  fontWeight: '700',
  color: '#334155',
  maxWidth: '220px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const leftUserName = {
  ...userName,
  color: '#64748b',
  maxWidth: '260px'
};

const logoutBtn = {
  border: '1px solid #e2e8f0',
  background: 'white',
  color: '#0f172a',
  fontSize: '12px',
  fontWeight: '700',
  padding: '6px 10px',
  borderRadius: '8px',
  cursor: 'pointer'
};

const refreshBtn = (hover) => ({
  width: 28,
  height: 28,
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  color: hover ? '#1d4ed8' : '#0f172a',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 120ms ease, transform 120ms ease',
  transform: hover ? 'translateY(-1px)' : 'translateY(0px)'
});

// statusWrapper, dot, and statusText styles can be deleted if not used elsewhere

export default Header;
