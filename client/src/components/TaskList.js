import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, CheckCircle, Clock, Calendar, Sparkles, UserCheck, PauseCircle, PlayCircle } from 'lucide-react';

const TaskList = ({
    refreshTrigger,
    onRefresh,
    filterUserId,
    allowDelete = true,
    showAssignee = true,
    allowStatusUpdate = true,
    autoMarkAssignedAsPending = false,
    pollIntervalMs = 0
}) => {
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        } catch (err) { 
            console.error("Fetch error", err); 
        }
    };

    useEffect(() => { 
        fetchTasks(); 
    }, [refreshTrigger]);

    useEffect(() => {
        if (!pollIntervalMs) return;
        const id = setInterval(fetchTasks, pollIntervalMs);
        return () => clearInterval(id);
    }, [pollIntervalMs]);

    const visibleTasks = useMemo(() => {
        if (!filterUserId) return tasks;
        return tasks.filter(t => (t.userId?._id || t.userId) === filterUserId);
    }, [tasks, filterUserId]);

    useEffect(() => {
        if (!autoMarkAssignedAsPending) return;
        if (!filterUserId) return;

        const assignedMine = visibleTasks.filter((t) => t.status === 'Assigned');
        if (assignedMine.length === 0) return;

        let cancelled = false;
        (async () => {
            try {
                await Promise.all(
                    assignedMine.map((t) =>
                        axios.put(`/api/tasks/${t._id}`, { status: 'Pending', isEscalated: false })
                    )
                );

                if (cancelled) return;
                setTasks((prev) =>
                    prev.map((t) => {
                        if ((t.userId?._id || t.userId) !== filterUserId) return t;
                        if (t.status !== 'Assigned') return t;
                        return { ...t, status: 'Pending', isEscalated: false };
                    })
                );
                if (onRefresh) onRefresh();
            } catch (err) {
                console.error('Error auto-marking tasks as Pending:', err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [autoMarkAssignedAsPending, filterUserId, visibleTasks, onRefresh]);

    const handleDelete = async (id) => {
        if (window.confirm("Delete this task?")) {
            await axios.delete(`/api/tasks/${id}`);
            onRefresh(); 
        }
    };

    const setStatus = async (id, newStatus) => {
        try {
            // Crucial: We set isEscalated to false here. 
            // If the status changes, Elena is active, so the sparkle must go away!
            await axios.put(`/api/tasks/${id}`, { 
                status: newStatus,
                isEscalated: false 
            });
            setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status: newStatus, isEscalated: false } : t)));
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    // Helper to format date and check if overdue
    const formatDate = (dateString, status) => {
        if (!dateString) return <span style={{ color: '#94a3b8' }}>No Date</span>;
        
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isOverdue = date < today && status !== 'Completed';

        return (
            <span style={{ 
                color: isOverdue ? '#dc2626' : 'inherit', 
                fontWeight: isOverdue ? '700' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {isOverdue && <Calendar size={12} />}
                {date.toLocaleDateString()}
            </span>
        );
    };

    return (
        <div style={containerStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr style={headerRowStyle}>
                        <th style={thPadding}>Task Name</th>
                        <th style={thPadding}>Project</th>
                        {showAssignee && <th style={thPadding}>Assignee</th>}
                        <th style={thPadding}>Priority</th>
                        <th style={thPadding}>Due Date</th>
                        <th style={thPadding}>Status</th>
                        <th style={thPadding}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {visibleTasks.map(task => (
                        <tr key={task._id} style={rowStyle}>
<td style={{ ...tdPadding, display: 'flex', alignItems: 'center', minWidth: '200px' }}>
    <span style={{ marginRight: '8px' }}>{task.title}</span>
    {task.isEscalated && (
        <Sparkles 
            size={20} 
            color="#eab308" 
            fill="#eab308" 
        />
    )}
</td>
                            <td style={tdPadding}>
                                <span style={projectLabel}>{task.projectName || 'General'}</span>
                            </td>
                            {showAssignee && <td style={tdPadding}>{task.userId?.name || 'Unknown'}</td>}
                            <td style={{ ...tdPadding, color: task.priority === 5 ? '#dc2626' : '#1e293b', fontWeight: task.priority === 5 ? '700' : '400' }}>
                                Level {task.priority}
                            </td>
                            <td style={tdPadding}>
                                {formatDate(task.dueDate, task.status)}
                            </td>
                            <td style={tdPadding}>
                                <span style={statusBadge(task.status)}>{task.status}</span>
                            </td>
                            <td style={tdPadding}>
                                {allowStatusUpdate && (
                                    <>
                                        {task.status === 'Assigned' && (
                                            <button onClick={() => setStatus(task._id, 'Pending')} style={actionBtn} title="Mark as Pending">
                                                <UserCheck size={18} color="#0369a1" />
                                            </button>
                                        )}
                                        {task.status === 'Pending' && (
                                            <>
                                                <button onClick={() => setStatus(task._id, 'Hold')} style={actionBtn} title="Put on Hold">
                                                    <PauseCircle size={18} color="#b45309" />
                                                </button>
                                                <button onClick={() => setStatus(task._id, 'Completed')} style={actionBtn} title="Mark as Completed">
                                                    <CheckCircle size={18} color="green" />
                                                </button>
                                            </>
                                        )}
                                        {task.status === 'Hold' && (
                                            <>
                                                <button onClick={() => setStatus(task._id, 'Pending')} style={actionBtn} title="Resume (Pending)">
                                                    <PlayCircle size={18} color="#0369a1" />
                                                </button>
                                                <button onClick={() => setStatus(task._id, 'Completed')} style={actionBtn} title="Mark as Completed">
                                                    <CheckCircle size={18} color="green" />
                                                </button>
                                            </>
                                        )}
                                        {task.status === 'Completed' && (
                                            <button onClick={() => setStatus(task._id, 'Pending')} style={actionBtn} title="Reopen (Pending)">
                                                <Clock size={18} color="orange" />
                                            </button>
                                        )}
                                    </>
                                )}
                                {allowDelete && (
                                    <button onClick={() => handleDelete(task._id)} style={actionBtn} title="Delete Task">
                                        <Trash2 size={18} color="#ef4444" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- STYLES ---
const containerStyle = { 
    background: '#fff', 
    borderRadius: '8px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
    padding: '8px',
    overflowX: 'auto' 
};

const tableStyle = { width: '100%', borderCollapse: 'collapse' };

const headerRowStyle = { 
    background: '#f8fafc', 
    textAlign: 'left', 
    borderBottom: '2px solid #e2e8f0',
    fontSize: '12px',
    color: '#64748b'
};

const rowStyle = { borderBottom: '1px solid #f1f5f9' };

const thPadding = { padding: '12px 15px', background: '#f8fafc' };
const tdPadding = { padding: '12px 15px', fontSize: '14px', color: '#334155' };

const projectLabel = {
    background: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#475569',
    border: '1px solid #e2e8f0'
};

const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', margin: '0 5px' };

const statusBadge = (status) => {
    let bgColor = '#fef9c3'; // Default Yellow (Pending)
    let textColor = '#854d0e';

    if (status === 'Completed') {
        bgColor = '#dcfce7'; 
        textColor = '#166534';
    } else if (status === 'Hold') {
        bgColor = '#ffedd5';
        textColor = '#9a3412';
    } else if (status === 'Assigned') {
        bgColor = '#e0f2fe'; 
        textColor = '#0369a1';
    }

    return {
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '600',
        backgroundColor: bgColor,
        color: textColor,
        textTransform: 'uppercase'
    };
};

export default TaskList;
