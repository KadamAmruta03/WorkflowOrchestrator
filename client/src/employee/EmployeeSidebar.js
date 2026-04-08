import React from 'react';
import { Home as HomeIcon, ClipboardList, Plane, Users, Megaphone, MessagesSquare } from 'lucide-react';

export default function EmployeeSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'Home', label: 'Home', icon: <HomeIcon size={28} /> },
    { id: 'MyTasks', label: 'My Tasks', icon: <ClipboardList size={28} /> },
    { id: 'Announcements', label: 'Announcements', icon: <Megaphone size={28} /> },
    { id: 'Chat', label: 'Chat', icon: <MessagesSquare size={28} /> },
    { id: 'Leave', label: 'Leave', icon: <Plane size={28} /> },
    { id: 'Directory', label: 'Directory', icon: <Users size={28} /> }
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
            <div style={iconWrapper(activeTab === item.id)}>{item.icon}</div>
          </button>
        ))}
      </div>
    </nav>
  );
}

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
