import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Circle, ClipboardCheck } from 'lucide-react';

export default function EmployeeOnboarding({ user }) {
  const [checklist, setChecklist] = useState(null);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const fetchChecklist = useCallback(async () => {
    if (!user?.id) return;
    const res = await axios.get(`/api/onboarding/${user.id}`);
    setChecklist(res.data);
  }, [user?.id]);

  useEffect(() => {
    fetchChecklist().catch((e) => setError(e.response?.data?.message || 'Failed to load checklist.'));
  }, [fetchChecklist]);

  const items = useMemo(() => checklist?.items || [], [checklist]);
  const completedCount = items.filter((i) => Boolean(i.completedAt)).length;
  const totalCount = items.length || 0;
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const key = it.category || 'Week 1';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    return Array.from(map.entries());
  }, [items]);

  const toggle = async (item) => {
    if (!checklist?._id || !user?.id) return;
    setError('');
    setBusyId(item._id);
    try {
      const res = await axios.patch(`/api/onboarding/${user.id}/items/${item._id}`, { completed: !item.completedAt });
      setChecklist(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update item.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={header}>
        <div>
          <h2 style={{ margin: 0, color: '#1a2a47', fontSize: 24, fontWeight: 900 }}>Onboarding Checklist</h2>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>A guided first-week checklist (mark items as you finish).</p>
        </div>
      </div>

      <div style={panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={iconBubble}><ClipboardCheck size={18} /></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a' }}>Progress</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {completedCount}/{totalCount} completed
              </div>
            </div>
          </div>
          <div style={pctPill}>{pct}%</div>
        </div>
        <div style={progressTrack}>
          <div style={{ ...progressFill, width: `${pct}%` }} />
        </div>
        {error ? <div style={errorBox}>{error}</div> : null}
      </div>

      {grouped.map(([category, list]) => (
        <div key={category} style={panel}>
          <div style={panelTitle}>{category}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map((item) => {
              const done = Boolean(item.completedAt);
              const busy = busyId === item._id;
              return (
                <button
                  key={item._id}
                  onClick={() => toggle(item)}
                  disabled={busy}
                  style={{ ...itemRow, ...(done ? itemRowDone : null) }}
                  title="Toggle complete"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {done ? <CheckCircle2 size={18} color="#16a34a" /> : <Circle size={18} color="#94a3b8" />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', textAlign: 'left' }}>{item.title}</div>
                      {item.description ? (
                        <div style={{ fontSize: 12, color: '#64748b', textAlign: 'left', marginTop: 2 }}>{item.description}</div>
                      ) : null}
                    </div>
                  </div>
                  <div style={done ? donePill : todoPill}>{done ? 'Done' : 'To do'}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const containerStyle = { marginLeft: '-200px', width: 'calc(100% - 85px)', padding: 20, marginTop: '-50px', display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const panel = { background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', width: '130%', padding: 14, boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)', boxSizing: 'border-box' };
const panelTitle = { fontSize: 11, fontWeight: 900, letterSpacing: 1.1, textTransform: 'uppercase', color: '#334155', marginBottom: 10 };
const itemRow = { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9', background: '#fff', padding: '12px 12px', borderRadius: 8, cursor: 'pointer' };
const itemRowDone = { background: '#f0fdf4', border: '1px solid #bbf7d0' };
const todoPill = { fontSize: 11, fontWeight: 900, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: 8 };
const donePill = { fontSize: 11, fontWeight: 900, color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: 8 };
const progressTrack = { height: 10, background: '#f1f5f9', borderRadius: 8, marginTop: 12, overflow: 'hidden', border: '1px solid #e2e8f0' };
const progressFill = { height: '100%', background: 'linear-gradient(90deg, #2563eb, #16a34a)' };
const pctPill = { fontSize: 12, fontWeight: 900, color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: 8 };
const iconBubble = { width: 34, height: 34, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' };
const errorBox = { marginTop: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: 10, borderRadius: 8, fontSize: 13 };
