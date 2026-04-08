import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { adminPageContainerStyle, adminPageHeaderStyle, adminPageTitleStyle, adminPageSubtitleStyle } from './pageStyles';

const Contacts = ({ employees = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [localEmployees, setLocalEmployees] = useState(employees);

    // Sync local state if props change
    React.useEffect(() => {
        setLocalEmployees(employees);
    }, [employees]);

    // --- SORTING LOGIC ---
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedEmployees = [...localEmployees].sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        const strA = valA?.toString().toLowerCase() || '';
        const strB = valB?.toString().toLowerCase() || '';
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredEmployees = sortedEmployees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
        return sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
    };

    return (
        <div style={containerStyle}>
            {/* HEADER */}
            <div style={headerStyle}>
                <div>
                    <h2 style={adminPageTitleStyle}>Employee Directory</h2>
                    <p style={adminPageSubtitleStyle}>Manage and view all resource records.</p>
                </div>
            </div>

            {/* ACTION BAR */}
            <div style={headerSection}>
                <div style={controlsLeft}>
                    <div style={searchWrapper}>
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            style={searchField}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={sortWrapper}>
                        <ArrowUpDown size={18} color="#64748b" />
                        <select 
                            style={sortDropdown} 
                            value={sortConfig.key} 
                            onChange={(e) => handleSort(e.target.value)}
                        >
                            <option value="name">Sort by Name</option>
                            <option value="employeeId">Sort by ID</option>
                            <option value="calculatedAge">Sort by Age</option>
                            <option value="department">Sort by Dept</option>
                            <option value="doj">Sort by Joining Date</option>
                        </select>
                        <button onClick={() => handleSort(sortConfig.key)} style={directionToggle}>
                            {sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'}
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div style={tableWrapper} className="custom-scrollbar">
                <table style={crmTable}>
                    <thead>
                        <tr style={tableHeaderRow}>
                            <th style={thStyle} onClick={() => handleSort('employeeId')}>ID <SortIcon column="employeeId"/></th>
                            <th style={thStyle} onClick={() => handleSort('name')}>Full Name <SortIcon column="name"/></th>
                            <th style={thStyle} onClick={() => handleSort('gender')}>Gender <SortIcon column="gender"/></th>
                            <th style={thStyle} onClick={() => handleSort('calculatedAge')}>Age <SortIcon column="calculatedAge"/></th>
                            <th style={thStyle} onClick={() => handleSort('department')}>Department <SortIcon column="department"/></th>
                            <th style={thStyle} onClick={() => handleSort('designation')}>Designation <SortIcon column="designation"/></th>
	                            <th style={thStyle}>Email</th>
	                            <th style={thStyle}>Mobile</th>
	                            <th style={thStyle} onClick={() => handleSort('doj')}>DOJ <SortIcon column="doj"/></th>
	                            <th style={thStyle}>Type</th>
	                            <th style={thStyle}>Skills</th>
	                        </tr>
	                    </thead>
                    <tbody>
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => (
                                <tr key={emp._id} style={tableRow}>
                                    <td style={tdStyle}><span style={idBadge}>{emp.employeeId || 'N/A'}</span></td>
                                    <td style={{...tdStyle, fontWeight: '600', color: '#1a2a6c'}}>{emp.name}</td>
                                    <td style={tdStyle}>{emp.gender || '---'}</td>
                                    <td style={tdStyle}>{emp.calculatedAge || '---'}</td>
                                    <td style={tdStyle}>{emp.department || '---'}</td>
                                    <td style={tdStyle}>{emp.designation || '---'}</td>
                                    <td style={tdStyle}>
                                        <a href={`mailto:${emp.email}`} style={emailLink}>{emp.email}</a>
                                    </td>
	                                    <td style={tdStyle}>{emp.mobile || '---'}</td>
	                                    <td style={tdStyle}>{emp.doj || '---'}</td>
	                                    <td style={tdStyle}>{emp.employeeType || '---'}</td>
	                                    <td style={tdStyle}>
	                                        <div style={skillScroll}>
	                                            {emp.skills?.map((s, i) => (
	                                                <span key={i} style={skillTag}>{s}</span>
	                                            ))}
	                                        </div>
	                                    </td>
                                </tr>
                            ))
	                        ) : (
	                            <tr>
	                                <td colSpan="11" style={emptyState}>No employee records found.</td>
	                            </tr>
	                        )}
                    </tbody>
                </table>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { height: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                `}</style>
            </div>
        </div>
    );
};

// --- STYLES (No CSS changes, only fixed width for scannability) ---
const headerStyle = adminPageHeaderStyle;
const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const controlsLeft = { display: 'flex', gap: '10px', alignItems: 'center' };
const searchWrapper = { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '8px', flex: 1, maxWidth: '600px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const searchField = { border: 'none', outline: 'none', fontSize: '14px', width: '100%' };
const sortWrapper = { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const sortDropdown = { border: 'none', outline: 'none', fontSize: '14px', color: '#475569', cursor: 'pointer' };
const directionToggle = { border: 'none', background: '#f1f5f9', color: '#1a2a6c', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer' };
const tableWrapper = { border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%' };
const crmTable = { width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '1100px'};
const tableHeaderRow = { borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
const thStyle = { padding: '12px 15px', textAlign: 'left', color: '#475569', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px 15px', borderBottom: '1px solid #f1f5f9', color: '#334155', verticalAlign: 'middle', whiteSpace: 'nowrap' };
const tableRow = { transition: 'background 0.2s' };
const idBadge = { background: '#f1f5f9', padding: '3px 7px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: '#64748b' };
const emailLink = { color: '#2563eb', textDecoration: 'none' };
const skillScroll = { display: 'flex', gap: '4px' };
const skillTag = { background: '#f1f5f9', padding: '2px 6px', borderRadius: '8px', fontSize: '10px', whiteSpace: 'nowrap' };
const emptyState = { padding: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '16px' };

const containerStyle = adminPageContainerStyle;

export default Contacts;
