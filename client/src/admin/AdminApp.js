import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Home from '../components/Home';
import Onboarding from '../components/Onboarding';
import TaskManager from '../components/TaskManager';
import Bench from '../components/Bench';
import ProjectAnalytics from '../components/ProjectAnalytics';
import Contacts from '../components/Contacts';
import MeetingSch from '../components/MeetingSch';
import ProjectMatcher from '../components/ProjectMatcher.js';
import LeaveMgmt from '../components/LeaveMgmt';
import Performance from '../components/Performance';
import AnnouncementAdmin from '../components/AnnouncementAdmin';
import AdminChat from '../components/AdminChat';

export default function AdminApp({ onLogout, user }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [prefilledTask, setPrefilledTask] = useState(null);

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get('/api/users'),
        axios.get('/api/tasks'),
        axios.get('/api/meetings')
      ]);

      if (results[0].status === 'fulfilled') setEmployees(results[0].value.data);
      if (results[1].status === 'fulfilled') setTasks(results[1].value.data);
      if (results[2].status === 'fulfilled') setMeetings(results[2].value.data);
    } catch (err) {
      console.error('General Fetching Error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const burnoutCount = employees.filter((emp) => {
    const workload = tasks
      .filter((t) => (t.userId?._id === emp._id || t.userId === emp._id) && t.status === 'Pending')
      .reduce((sum, t) => sum + (Number(t.priority) || 0), 0);
    return workload > 8;
  }).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <Home employees={employees} tasks={tasks} meetings={meetings} />;
      case 'ProjectMatcher':
        return (
          <ProjectMatcher
            employees={employees}
            tasks={tasks}
            onAssign={(emp) => {
              setPrefilledTask(emp);
              setActiveTab('TaskManager');
            }}
          />
        );
      case 'TaskManager':
        return (
          <TaskManager
            employees={employees}
            onTaskCreated={() => {
              fetchData();
              setPrefilledTask(null);
            }}
            prefill={prefilledTask}
          />
        );
      case 'Onboarding':
        return <Onboarding refresh={fetchData} />;
      case 'LeaveMgmt':
        return <LeaveMgmt employees={employees} />;
      case 'ProjectAnalytics':
        return <ProjectAnalytics tasks={tasks} />;
      case 'Bench':
        return (
          <Bench
            employees={employees}
            tasks={tasks}
            onAssign={(emp) => {
              setPrefilledTask({ id: emp._id, name: emp.name, skillsSearched: 'Bench Staff' });
              setActiveTab('TaskManager');
            }}
          />
        );
      case 'Performance':
        return <Performance employees={employees} />;
      case 'Contacts':
        return <Contacts employees={employees} onEdit={(emp) => console.log('Edit:', emp)} />;
      case 'MeetingSch':
        return <MeetingSch onUpdate={fetchData} />;
      case 'Announcements':
        return <AnnouncementAdmin />;
      case 'Chat':
        return <AdminChat user={user} />;
      default:
        return <Home employees={employees} tasks={tasks} meetings={meetings} />;
    }
  };

  return (
    <div>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} alertCount={burnoutCount} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          activeTab={activeTab}
          user={user}
          onLogout={onLogout}
          onRefresh={() => {
            fetchData();
          }}
        />
        <main style={{ padding: '30px', marginLeft: '60px', marginTop: '50px', boxSizing: 'border-box' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
