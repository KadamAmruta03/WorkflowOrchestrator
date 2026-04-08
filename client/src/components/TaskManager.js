import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CheckCircle, X, AlertTriangle } from 'lucide-react';
import TaskList from './TaskList';
import { useAppRefresh } from '../utils/appRefresh';
import { adminPageContainerStyle, adminPageHeaderStyle, adminPageTitleStyle, adminPageSubtitleStyle } from './pageStyles';

const TaskManager = ({ employees: propEmployees, onTaskCreated, prefill }) => {
    const [employees, setEmployees] = useState([]);
    const [existingProjects, setExistingProjects] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // --- NEW STATES FOR NOTIFICATION & DELETE WINDOW ---
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [deleteModal, setDeleteModal] = useState({ show: false, taskId: null });

    // Search States
    const [empSearch, setEmpSearch] = useState('');
    const [showEmpDropdown, setShowEmpDropdown] = useState(false);
    const empRef = useRef(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [showProjDropdown, setShowProjDropdown] = useState(false);
    const projRef = useRef(null);

    const [taskData, setTaskData] = useState({
        title: '', priority: 1, userId: '', projectName: '', dueDate: ''
    });

    // --- TOAST NOTIFICATION HANDLER ---
    const triggerToast = (msg, type = 'success') => {
        setNotification({ show: true, message: msg, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
    };

    // --- DELETE LOGIC ---
    const handleDelete = async () => {
        try {
            // Replace with your actual delete API endpoint
            await axios.delete(`/api/tasks/${deleteModal.taskId}`);
            triggerToast("Task deleted successfully", "success");
            handleRefresh();
        } catch (err) {
            triggerToast("Failed to delete task", "error");
        } finally {
            setDeleteModal({ show: false, taskId: null });
        }
    };

    useEffect(() => {
        if (propEmployees && propEmployees.length > 0) {
            setEmployees(propEmployees);
        } else {
            axios.get('/api/users')
                .then(res => setEmployees(res.data))
                .catch(err => console.error("Error fetching users:", err));
        }

        axios.get('/api/tasks')
            .then(res => {
                const projects = [...new Set(res.data.map(t => t.projectName).filter(Boolean))];
                setExistingProjects(projects);
            })
            .catch(err => console.error("Error fetching projects:", err));
    }, [propEmployees, refreshTrigger]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (empRef.current && !empRef.current.contains(event.target)) setShowEmpDropdown(false);
            if (projRef.current && !projRef.current.contains(event.target)) setShowProjDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (prefill) {
            setTaskData(prev => ({ ...prev, userId: prefill.id }));
            setEmpSearch(prefill.name);
        }
    }, [prefill]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        if (onTaskCreated) onTaskCreated();
    };

    useAppRefresh(() => {
        handleRefresh();
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/tasks/assign-new', taskData);
            triggerToast("Task Assigned Successfully!"); // TRIGGER TOAST HERE
            setTaskData({ title: '', priority: 1, userId: '', projectName: '', dueDate: '' });
            setEmpSearch('');
            setProjectSearch('');
            handleRefresh();
        } catch (err) {
            triggerToast(err.response?.data?.message || "Error assigning task", "error");
        }
    };

    const filter = (list, query) => list.filter(i => (i.name || i).toLowerCase().includes(query.toLowerCase()));

    return (
        <div style={containerStyle}>
            <style>{taskCss}</style>
            {/* --- DELETE CONFIRMATION MODAL (CENTERED RECTANGLE) --- */}
            {deleteModal.show && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <AlertTriangle size={40} color="#dc2626" style={{ marginBottom: '15px' }} />
                        <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Confirm Deletion</h3>
                        <p style={{ margin: '0 0 20px 0', color: '#64748b', textAlign: 'center' }}>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                            <button onClick={() => setDeleteModal({ show: false, taskId: null })} style={cancelBtn}>Cancel</button>
                            <button onClick={handleDelete} style={deleteBtn}>Delete Task</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FLOATING TOAST (BOTTOM RIGHT) --- */}
            {notification.show && (
                <div style={{...toastStyle, borderLeft: notification.type === 'success' ? '5px solid #22c55e' : '5px solid #dc2626'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {notification.type === 'success' ? <CheckCircle size={20} color="#22c55e" /> : <AlertTriangle size={20} color="#dc2626" />}
                        <span style={{ fontWeight: '500', color: '#1e293b' }}>{notification.message}</span>
                    </div>
                    <X size={16} onClick={() => setNotification({ show: false })} style={{ cursor: 'pointer', color: '#94a3b8' }} />
                </div>
            )}

            <div style={headerWrapper}>
                <div>
                    <h2 style={adminPageTitleStyle}>Task Management</h2>
                    <p style={adminPageSubtitleStyle}>
                        {prefill ? `Assigning specialized task to ${prefill.name}` : 'Assign and track resource deliverables'}
                    </p>
                </div>
            </div>

            <div style={card}>
                <form onSubmit={handleSubmit} style={formGrid}>
                <div style={inputGroup}>
                    <label style={labelStyle}>Task Title</label>
                    <input className="wo-task-input" style={inputStyle} placeholder="Project Deliverable Name" required value={taskData.title} onChange={e => setTaskData({ ...taskData, title: e.target.value })} />
                </div>

                <div style={inputGroup} ref={projRef}>
                    <label style={labelStyle}>Project Name</label>
                    <div style={{ position: 'relative' }}>
                        <input className="wo-task-input" style={inputStyle} placeholder="Search or Type Project..." value={projectSearch} onFocus={() => setShowProjDropdown(true)}
                            onChange={(e) => {
                                setProjectSearch(e.target.value);
                                setTaskData({ ...taskData, projectName: e.target.value });
                                setShowProjDropdown(true);
                            }}
                        />
                        {showProjDropdown && (
                            <div style={dropdownListStyle}>
                                {filter(existingProjects, projectSearch).map((proj, idx) => (
                                    <div key={idx} style={dropdownItemStyle} onClick={() => {
                                        setProjectSearch(proj);
                                        setTaskData({ ...taskData, projectName: proj });
                                        setShowProjDropdown(false);
                                    }}>{proj}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={inputGroup}>
                    <label style={labelStyle}>Deadline</label>
                    <input className="wo-task-input" type="date" style={inputStyle} required value={taskData.dueDate} onChange={e => setTaskData({ ...taskData, dueDate: e.target.value })} />
                </div>

                <div style={inputGroup} ref={empRef}>
                    <label style={labelStyle}>Assign To</label>
                    <div style={{ position: 'relative' }}>
                        <input className="wo-task-input" style={inputStyle} placeholder="Search Employee..." value={empSearch} onFocus={() => setShowEmpDropdown(true)}
                            onChange={(e) => {
                                setEmpSearch(e.target.value);
                                setShowEmpDropdown(true);
                            }}
                        />
                        {showEmpDropdown && (
                            <div style={dropdownListStyle}>
                                {filter(employees, empSearch).map(emp => (
                                    <div key={emp._id} style={dropdownItemStyle} onClick={() => {
                                        setTaskData({ ...taskData, userId: emp._id });
                                        setEmpSearch(emp.name);
                                        setShowEmpDropdown(false);
                                    }}>{emp.name}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={inputGroup}>
                    <label style={labelStyle}>Priority Level</label>
                    <select className="wo-task-input" style={inputStyle} value={taskData.priority} onChange={e => setTaskData({ ...taskData, priority: Number(e.target.value) })}>
                        <option value="1">Priority 1 (Low)</option>
                        <option value="3">Priority 3 (Medium)</option>
                        <option value="5">Priority 5 (Urgent)</option>
                    </select>
                </div>

                <div style={{ gridColumn: 'span 1', display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" style={submitBtn}>Assign Task</button>
                </div>
                </form>
            </div>

            <div style={{ width: '100%', marginTop: '15px' }}>
                <h3 style={{ marginBottom: '5px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0 }}>
                    Active Task Overview
                </h3>
                <div style={{ padding: 0 }}>
                    {/* Assuming TaskList has an onDelete prop to trigger the modal */}
                    <TaskList
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                        allowStatusUpdate={false}
                        pollIntervalMs={5000}
                    />
                </div>
            </div>
        </div>
    );
};

// --- NEW STYLES FOR MODAL & TOAST ---
const modalOverlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
};
const modalContent = { padding: '30px', borderRadius: '8px', width: '400px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
};
const deleteBtn = { flex: 1, padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtn = { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const toastStyle = {
    position: 'fixed', bottom: '30px', right: '30px', background: '#fff', padding: '16px 20px',
    borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', 
    alignItems: 'center', justifyContent: 'space-between', minWidth: '300px', zIndex: 3000, gap: '20px'
};

// --- REST OF THE ORIGINAL STYLES ---
const containerStyle = adminPageContainerStyle;
const headerWrapper = adminPageHeaderStyle;
// Match the visible width of "Active Task Overview" content area (which uses `padding: 0 40px`).
const card = { background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', padding: '14px 16px 12px', width: '100%', marginLeft: 0, boxSizing: 'border-box' };
const formGrid = {
    display: 'grid',
    gridTemplateColumns: '1.25fr 1fr 0.85fr 1.05fr 0.9fr 0.7fr',
    gap: '10px',
    marginTop: 0,
    marginLeft: 0,
    padding: 0,
    width: '100%',
    boxSizing: 'border-box',
    alignItems: 'end'
};
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' };
const labelStyle = { fontSize: '12px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.75px' };
const inputStyle = { width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff', boxShadow: 'none' };
const dropdownListStyle = { position: 'absolute', top: '105%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 100, maxHeight: '180px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const dropdownItemStyle = { padding: '12px 16px', fontSize: '14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' };
const submitBtn = { width: '100%', padding: '10px', borderRadius: '8px', background: '#1a2a47', color: '#fff', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 14px 0 rgba(26, 42, 71, 0.35)' };

const taskCss = `
  .wo-task-input:focus {
    outline: none;
    box-shadow: none;
    border-color: #e2e8f0;
  }
`;

export default TaskManager;
