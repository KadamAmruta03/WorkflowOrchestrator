import React, { useState } from 'react';
import Header from '../components/Header';
import TaskList from '../components/TaskList';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeHome from './EmployeeHome';
import EmployeeLeave from './EmployeeLeave';
import EmployeeDirectory from './EmployeeDirectory';
import EmployeeAnnouncements from './EmployeeAnnouncements';
import EmployeeChat from './EmployeeChat';
import { employeePageContainerStyle, employeePageTitleStyle, employeePageSubtitleStyle } from './pageStyles';

export default function EmployeeApp({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <EmployeeHome user={user} />;
      case 'MyTasks':
        return (
          <div style={employeePageContainerStyle}>
            <div>
              <h2 style={employeePageTitleStyle}>My Tasks</h2>
              <p style={{ ...employeePageSubtitleStyle, marginBottom: '14px' }}>When you open this page, Assigned tasks move to Pending. Then you can put tasks on Hold or mark them Completed.</p>
            </div>
            <TaskList
              refreshTrigger={refreshTrigger}
              onRefresh={() => setRefreshTrigger((x) => x + 1)}
              filterUserId={user?.id}
              allowDelete={false}
              showAssignee={false}
              allowStatusUpdate
              autoMarkAssignedAsPending
            />
          </div>
        );
      case 'Announcements':
        return <EmployeeAnnouncements />;
      case 'Chat':
        return <EmployeeChat user={user} />;
      case 'Leave':
        return <EmployeeLeave user={user} />;
      case 'Directory':
        return <EmployeeDirectory />;
      default:
        return <EmployeeHome user={user} />;
    }
  };

  return (
    <div>
      <EmployeeSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          user={user}
          onLogout={onLogout}
          onRefresh={() => setRefreshTrigger((x) => x + 1)}
        />
        <main
          style={{
            marginLeft: '60px',
            marginTop: '50px',
            padding: '24px',
            width: 'calc(100vw - 60px)',
            maxWidth: 'calc(100vw - 60px)',
            boxSizing: 'border-box'
          }}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
