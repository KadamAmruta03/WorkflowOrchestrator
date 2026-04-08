import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import { adminPageContainerStyle } from './pageStyles';

export default function Onboarding({ refresh }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    gender: '',
    department: '',
    designation: '',
    email: '',
    doj: '',
    employeeType: '',
    mobile: '',
    dob: '',
    skills: '',
    password: ''
  });

  const [age, setAge] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const genderRef = useRef(null);
  const typeRef = useRef(null);
  const deptRef = useRef(null);
  const desigRef = useRef(null);

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showDesigDropdown, setShowDesigDropdown] = useState(false);

  const [genderSearch, setGenderSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const [deptSearch, setDeptSearch] = useState('');
  const [desigSearch, setDesigSearch] = useState('');

  const lists = useMemo(
    () => ({
      genders: ['Male', 'Female', 'Other'],
      types: ['Full-time', 'Intern', 'Contract', 'Undefined'],
      departments: ['IT', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations', 'Product'],
      designations: ['Software Engineer', 'Senior Developer', 'UI/UX Designer', 'Project Manager', 'Data Analyst', 'QA Engineer', 'HR Manager']
    }),
    []
  );

  const filterList = (items, query) => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => String(x).toLowerCase().includes(q));
  };

  const fetchNextId = async () => {
    try {
      const res = await axios.get('/api/users/count');
      const currentCount = parseInt(res.data.count, 10) || 0;
      const nextNumber = 10001 + currentCount;
      setFormData((prev) => ({ ...prev, employeeId: `EMP-${nextNumber}` }));
    } catch {
      setFormData((prev) => ({ ...prev, employeeId: 'EMP-10001' }));
    }
  };

  useEffect(() => {
    fetchNextId();

    const handleClickOutside = (e) => {
      if (genderRef.current && !genderRef.current.contains(e.target)) setShowGenderDropdown(false);
      if (typeRef.current && !typeRef.current.contains(e.target)) setShowTypeDropdown(false);
      if (deptRef.current && !deptRef.current.contains(e.target)) setShowDeptDropdown(false);
      if (desigRef.current && !desigRef.current.contains(e.target)) setShowDesigDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDobChange = (e) => {
    const birthDate = e.target.value;
    setFormData((prev) => ({ ...prev, dob: birthDate }));
    if (!birthDate) return setAge('');

    const today = new Date();
    const birth = new Date(birthDate);
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) calculatedAge -= 1;
    setAge(calculatedAge);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const employeeData = {
        name: formData.fullName,
        gender: formData.gender,
        dob: formData.dob,
        calculatedAge: age,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password || 'TEMP_PASSWORD',
        role: 'Employee',
        employeeId: formData.employeeId,
        department: formData.department,
        designation: formData.designation,
        doj: formData.doj,
        skills: String(formData.skills || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        employeeType: formData.employeeType || 'Undefined',
        recruitmentStatus: 'Approved'
      };

      await axios.post('/api/users/add', employeeData);

      setNotice(`Employee ${formData.fullName} added.`);
      setFormData({
        employeeId: '',
        fullName: '',
        gender: '',
        department: '',
        designation: '',
        email: '',
        doj: '',
        employeeType: '',
        mobile: '',
        dob: '',
        skills: '',
        password: ''
      });
      setGenderSearch('');
      setTypeSearch('');
      setDeptSearch('');
      setDesigSearch('');
      setAge('');
      await fetchNextId();
      if (refresh) refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={containerStyle}>
      <style>{onboardingCss}</style>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: 22, fontWeight: 900 }}>Employee Onboarding</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>Create a new employee record in the users collection.</p>
        </div>
      </div>

      <div style={card}>
        <form onSubmit={submit} style={formGrid}>
          <div style={inputGroup}>
            <label style={labelStyle}>Employee ID</label>
            <input className="wo-onboarding-input" style={inputStyle} value={formData.employeeId} readOnly />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Full Name</label>
            <input
              className="wo-onboarding-input"
              style={inputStyle}
              required
              value={formData.fullName}
              onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Clark Jermoe Kent"
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Email</label>
            <input
              className="wo-onboarding-input"
              style={inputStyle}
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder="clerk@gmail.com"
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Mobile</label>
            <input
              className="wo-onboarding-input"
              style={inputStyle}
              value={formData.mobile}
              onChange={(e) => setFormData((p) => ({ ...p, mobile: e.target.value }))}
              placeholder="7834572360"
            />
          </div>

          <div style={inputGroup} ref={genderRef}>
            <label style={labelStyle}>Gender</label>
            <div style={{ position: 'relative' }}>
              <input
                className="wo-onboarding-input"
                style={inputStyle}
                value={genderSearch}
                onFocus={() => setShowGenderDropdown(true)}
                onChange={(e) => {
                  const v = e.target.value;
                  setGenderSearch(v);
                  setFormData((p) => ({ ...p, gender: v }));
                }}
                placeholder="Male | Female | Other"
              />
              {showGenderDropdown && (
                <div style={dropdownListStyle}>
                  {filterList(lists.genders, genderSearch).map((g) => (
                    <div
                      key={g}
                      style={dropdownItemStyle}
                      onClick={() => {
                        setFormData((p) => ({ ...p, gender: g }));
                        setGenderSearch(g);
                        setShowGenderDropdown(false);
                      }}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={inputGroup} ref={typeRef}>
            <label style={labelStyle}>Employee Type</label>
            <div style={{ position: 'relative' }}>
              <input
                className="wo-onboarding-input"
                style={inputStyle}
                value={typeSearch}
                onFocus={() => setShowTypeDropdown(true)}
                onChange={(e) => {
                  const v = e.target.value;
                  setTypeSearch(v);
                  setFormData((p) => ({ ...p, employeeType: v }));
                }}
                placeholder="Full-time | Intern | Contract"
              />
              {showTypeDropdown && (
                <div style={dropdownListStyle}>
                  {filterList(lists.types, typeSearch).map((t) => (
                    <div
                      key={t}
                      style={dropdownItemStyle}
                      onClick={() => {
                        setFormData((p) => ({ ...p, employeeType: t }));
                        setTypeSearch(t);
                        setShowTypeDropdown(false);
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Date of Birth</label>
            <input className="wo-onboarding-input" style={inputStyle} type="date" value={formData.dob} onChange={handleDobChange} />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Calculated Age</label>
            <input className="wo-onboarding-input" style={inputStyle} value={age} readOnly placeholder="Auto" />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Joining Date</label>
            <input
              className="wo-onboarding-input"
              style={inputStyle}
              type="date"
              required
              value={formData.doj}
              onChange={(e) => setFormData((p) => ({ ...p, doj: e.target.value }))}
            />
          </div>

          <div style={inputGroup} ref={deptRef}>
            <label style={labelStyle}>Department</label>
            <div style={{ position: 'relative' }}>
              <input
                className="wo-onboarding-input"
                style={inputStyle}
                value={deptSearch}
                onFocus={() => setShowDeptDropdown(true)}
                onChange={(e) => {
                  const v = e.target.value;
                  setDeptSearch(v);
                  setFormData((p) => ({ ...p, department: v }));
                }}
                placeholder="Sales"
              />
              {showDeptDropdown && (
                <div style={dropdownListStyle}>
                  {filterList(lists.departments, deptSearch).map((d) => (
                    <div
                      key={d}
                      style={dropdownItemStyle}
                      onClick={() => {
                        setFormData((p) => ({ ...p, department: d }));
                        setDeptSearch(d);
                        setShowDeptDropdown(false);
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={inputGroup} ref={desigRef}>
            <label style={labelStyle}>Designation</label>
            <div style={{ position: 'relative' }}>
              <input
                className="wo-onboarding-input"
                style={inputStyle}
                value={desigSearch}
                onFocus={() => setShowDesigDropdown(true)}
                onChange={(e) => {
                  const v = e.target.value;
                  setDesigSearch(v);
                  setFormData((p) => ({ ...p, designation: v }));
                }}
                placeholder="Project Manager"
              />
              {showDesigDropdown && (
                <div style={dropdownListStyle}>
                  {filterList(lists.designations, desigSearch).map((d) => (
                    <div
                      key={d}
                      style={dropdownItemStyle}
                      onClick={() => {
                        setFormData((p) => ({ ...p, designation: d }));
                        setDesigSearch(d);
                        setShowDesigDropdown(false);
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input
              className="wo-onboarding-input"
              style={inputStyle}
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              placeholder="Optional (TEMP_PASSWORD if empty)"
            />
          </div>

          <div style={{ ...inputGroup, gridColumn: 'span 3' }}>
            <label style={labelStyle}>Skills (comma separated)</label>
            <input
              className="wo-onboarding-input"
              style={inputStyle}
              value={formData.skills}
              onChange={(e) => setFormData((p) => ({ ...p, skills: e.target.value }))}
              placeholder="React, Node.js, Express.js"
            />
          </div>

          <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <button type="submit" style={submitBtn} disabled={busy}>
              {busy ? 'Saving...' : 'Add Employee'}
            </button>
          </div>
        </form>

        {error ? <div style={errorBox}>{error}</div> : null}
        {notice ? (
          <div style={noticeBox}>
            <CheckCircle size={18} /> {notice}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const containerStyle = adminPageContainerStyle;
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const card = { background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', padding: '14px 16px 12px', width: '100%', boxSizing: 'border-box' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 0 };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: 8, width: '100%' };
const labelStyle = { fontSize: 12, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.75px' };
const onboardingCss = `
  .wo-onboarding-input:focus {
    outline: none;
    box-shadow: none;
    border-color: #e2e8f0;
  }
`;
const inputStyle = { width: '100%', padding: '11px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fff', boxShadow: 'none' };
const dropdownListStyle = { position: 'absolute', top: '105%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)' };
const dropdownItemStyle = { padding: '12px 14px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #f1f5f9' };
const submitBtn = { padding: '12px 18px', borderRadius: 8, background: '#0f172a', color: '#fff', cursor: 'pointer', border: 'none', fontSize: 13, fontWeight: 900 };
const errorBox = { marginTop: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 10, borderRadius: 8, fontSize: 13 };
const noticeBox = { marginTop: 10, background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#065f46', padding: 10, borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 };
