import React from 'react';
import { 
  Home as HomeIcon, 
  UserPlus, 
  ClipboardList, 
  Users, 
  CalendarCheck, 
  BarChart3, 
  Plane,         
  Puzzle,
  Megaphone,
  MessagesSquare,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, alertCount }) => {
  const ICON_SIZE = 22;
  const menuItems = [
    { id: 'Home', label: 'Home', icon: <HomeIcon size={ICON_SIZE} /> },
    { id: 'Onboarding', label: 'Onboarding', icon: <UserPlus size={ICON_SIZE} /> },
    { id: 'Contacts', label: 'Contacts', icon: <Users size={ICON_SIZE} /> },
    { id: 'TaskManager', label: 'Task Manager', icon: <ClipboardList size={ICON_SIZE} /> },
    { id: 'ProjectAnalytics', label: 'Project Progress', icon: <BarChart3 size={ICON_SIZE} /> },
    
    // Updated Project Matcher Icon to Puzzle
    { id: 'ProjectMatcher', label: 'Smart Match', icon: <Puzzle size={ICON_SIZE} /> },
    
    { id: 'LeaveMgmt', label: 'Leave Management', icon: <Plane size={ICON_SIZE} /> },
    { id: 'Announcements', label: 'Announcements', icon: <Megaphone size={ICON_SIZE} /> },
    { id: 'Chat', label: 'Chat', icon: <MessagesSquare size={ICON_SIZE} /> },
    { id: 'MeetingSch', label: 'Meeting Schedule', icon: <CalendarCheck size={ICON_SIZE} /> },
  ];

  return (
    <nav style={sidebarStyle}>
      <div style={menuList}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={navBtn(activeTab === item.id)}
            title={item.label} 
          >
            <div style={iconWrapper(activeTab === item.id)}>
              {item.icon}
              {item.id === 'Home' && alertCount > 0 && (
                <span style={badgeStyle}>{alertCount}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

// --- STYLES ---
const sidebarStyle = { 
  width: '60px', 
  backgroundColor: '#1a2a47', 
  display: 'flex', 
  flexDirection: 'column', 
  position: 'fixed', 
  height: '100vh', 
  left: 0, 
  top: '50px', 
  color: '#ffffff', 
  boxShadow: '2px 0 5px rgba(0,0,0,0.2)', 
  zIndex: 100 
};

const menuList = { 
  display: 'flex', 
  flexDirection: 'column', 
  padding: '10px 0',
  alignItems: 'center' 
};

const navBtn = (isActive) => ({ 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  padding: '15px 0', 
  backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent', 
  color: isActive ? '#ffffff' : '#94a3b8', 
  border: 'none', 
  cursor: 'pointer', 
  transition: '0.2s all ease', 
  width: '100%', 
  borderLeft: isActive ? '4px solid #3498db' : '4px solid transparent',
  position: 'relative'
});

const iconWrapper = (isActive) => ({ 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  opacity: isActive ? 1 : 0.7,
  position: 'relative'
});

const badgeStyle = { 
  backgroundColor: '#ef4444', 
  color: 'white', 
  borderRadius: '8px', 
  width: '12px',
  height: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '9px', 
  position: 'absolute',
  top: '-5px',
  right: '-8px',
  fontWeight: 'bold', 
  border: '2px solid #1a2a47' 
};

export default Sidebar;
