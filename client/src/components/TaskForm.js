import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskForm = ({ onTaskCreated }) => {
    const [employees, setEmployees] = useState([]);
    const [taskData, setTaskData] = useState({ title: '', priority: 1, userId: '' });
    const [message, setMessage] = useState('');

    // Fetch employees for the dropdown
    useEffect(() => {
        axios.get('/api/users')
            .then(res => setEmployees(res.data))
            .catch(err => console.error("Error fetching users:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sends data to the /assign-new endpoint where Burnout Guard is checked
            const response = await axios.post('/api/tasks/assign-new', taskData);
            
            setMessage(response.data.message);
            setTaskData({ title: '', priority: 1, userId: '' }); // Clear form
            
            if (onTaskCreated) onTaskCreated(); // Refresh the table below
        } catch (err) {
            // Shows the error message from the backend (e.g., "Assignment Blocked!")
            setMessage(err.response?.data?.message || "Error assigning task");
        }
    };

    return (
        <div style={formContainer}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>Assign New Task</h3>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input 
                    type="text" 
                    placeholder="Task Name" 
                    required 
                    value={taskData.title}
                    onChange={e => setTaskData({...taskData, title: e.target.value})} 
                    style={inputStyle} 
                />
                
                <select 
                    value={taskData.priority}
                    onChange={e => setTaskData({...taskData, priority: Number(e.target.value)})} 
                    style={inputStyle}
                >
                    <option value="1">Priority 1 (Low)</option>
                    <option value="3">Priority 3 (Medium)</option>
                    <option value="5">Priority 5 (Urgent)</option>
                </select>

                <select 
                    required 
                    value={taskData.userId}
                    onChange={e => setTaskData({...taskData, userId: e.target.value})} 
                    style={inputStyle}
                >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                </select>

                <button type="submit" style={buttonStyle}>
                    Assign Task
                </button>
            </form>
            
            {message && (
                <p style={{ 
                    marginTop: '15px', 
                    color: message.includes('Blocked') ? '#dc2626' : '#16a34a', 
                    fontWeight: 'bold',
                    fontSize: '14px' 
                }}>
                    {message}
                </p>
            )}
        </div>
    );
};

// --- STYLES ---
const formContainer = { 

    padding: '20px', 
    backgroundColor: '#fff', 
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
};

const formStyle = { display: 'flex', gap: '10px', flexWrap: 'wrap' };

const inputStyle = { 
    padding: '10px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    fontSize: '14px',
    outline: 'none',
    minWidth: '200px'
};

const buttonStyle = { 
    padding: '10px 24px', 
    cursor: 'pointer', 
    backgroundColor: '#2563eb', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'background 0.2s'
};

export default TaskForm;
