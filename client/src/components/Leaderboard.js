import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Star } from 'lucide-react';

const Leaderboard = ({ refreshTrigger }) => {
    const [rankings, setRankings] = useState([]);

    useEffect(() => {
        axios.get('/api/tasks/leaderboard')
            .then(res => setRankings(res.data))
            .catch(err => console.error(err));
    }, [refreshTrigger]);

    const getIcon = (index) => {
        if (index === 0) return <Trophy color="#FFD700" size={24} />; // Gold
        if (index === 1) return <Medal color="#C0C0C0" size={24} />;  // Silver
        if (index === 2) return <Medal color="#CD7F32" size={24} />;  // Bronze
        return <Star color="#cbd5e1" size={20} />;
    };

    return (
        <div style={cardStyle}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy color="#2563eb" /> Employee Leaderboard
            </h3>
            <div style={listStyle}>
                {rankings.map((emp, index) => (
                    <div key={emp._id} style={itemStyle(index)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={rankStyle}>{index + 1}</span>
                            {getIcon(index)}
                            <span style={{ fontWeight: '600' }}>{emp.employeeDetails.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
                                {emp.completedTasks}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Tasks Done</div>
                        </div>
                    </div>
                ))}
                {rankings.length === 0 && <p style={{ color: '#94a3b8' }}>No completed tasks yet!</p>}
            </div>
        </div>
    );
};

// --- STYLES ---
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', minWidth: '300px' };
const listStyle = { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' };
const itemStyle = (index) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: index < 3 ? '#f8fafc' : 'transparent',
    border: index < 3 ? '1px solid #e2e8f0' : 'none'
});
const rankStyle = { width: '25px', color: '#94a3b8', fontWeight: 'bold' };

export default Leaderboard;
