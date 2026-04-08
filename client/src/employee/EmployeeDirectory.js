import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { employeePageContainerStyle, employeePageHeaderStyle, employeePageTitleStyle, employeePageSubtitleStyle } from './pageStyles';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    axios.get(`/api/users`).then((res) => setEmployees(res.data || [])).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter((e) => {
      return (
        e.name?.toLowerCase().includes(query) ||
        e.email?.toLowerCase().includes(query) ||
        e.department?.toLowerCase().includes(query) ||
        e.designation?.toLowerCase().includes(query)
      );
    });
  }, [employees, q]);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={employeePageTitleStyle}>Directory</h2>
          <p style={employeePageSubtitleStyle}>Quick contact view</p>
        </div>
      </div>

      <div style={controls}>
        <div style={searchWrapper}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search people..."
            style={searchField}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr style={theadRow}>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Department</th>
              <th style={th}>Designation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" style={empty}>No results.</td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e._id} style={row}>
                  <td style={td}>{e.name}</td>
                  <td style={td}><a href={`mailto:${e.email}`} style={emailLink}>{e.email}</a></td>
                  <td style={td}>{e.department || '-'}</td>
                  <td style={td}>{e.designation || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const containerStyle = employeePageContainerStyle;
const headerStyle = employeePageHeaderStyle;
const controls = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const searchWrapper = { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '8px', flex: 1, maxWidth: '520px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const searchField = { border: 'none', outline: 'none', fontSize: '14px', width: '100%' };
const tableWrapper = { border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%' };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '720px' };
const theadRow = { borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
const th = { padding: '12px 15px', textAlign: 'left', color: '#475569', fontWeight: 'bold', whiteSpace: 'nowrap' };
const td = { padding: '12px 15px', borderBottom: '1px solid #f1f5f9', color: '#334155', verticalAlign: 'middle', whiteSpace: 'nowrap' };
const row = { transition: 'background 0.2s' };
const empty = { padding: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '16px' };
const emailLink = { color: '#2563eb', textDecoration: 'none' };
