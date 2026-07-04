import React, { useState, useMemo } from 'react';
import { getTriagedRequests } from './data';
import { RequestCard } from './components/RequestCard';
import './App.css';

const STAFF = [
  { name: 'Sarah', role: 'Senior Advisor', avatar: 'S', active: true },
  { name: 'James', role: 'Customer Success', avatar: 'J', active: true },
];

const SLOTS_REMAINING = 3;

function App() {
  const [requests] = useState(() => getTriagedRequests());
  const [sortMode, setSortMode] = useState<'priority' | 'time'>('priority');

  // Parse "HH:MM AM/PM" → total minutes since midnight for comparison
  function parseTime(ts: string): number {
    const [time, period] = ts.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

  const sortedRequests = useMemo(() => {
    const copy = [...requests];
    if (sortMode === 'priority') {
      return copy.sort(
        (a, b) => PRIORITY_ORDER[a.decision.priority] - PRIORITY_ORDER[b.decision.priority]
      );
    } else {
      // oldest (smallest time value) first
      return copy.sort(
        (a, b) => parseTime(a.request.timestamp) - parseTime(b.request.timestamp)
      );
    }
  }, [requests, sortMode]);

  const highCount = requests.filter((r) => r.decision.priority === 'HIGH').length;
  const autoCount = requests.filter((r) => r.decision.action === 'AUTO_RESOLVE').length;
  const escalateCount = requests.filter((r) => r.decision.action === 'ESCALATE').length;

  return (
    <div className="app">
      {/* ── Top Nav ────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">TriageAI</span>
          </div>
          <span className="topbar-sub">Smart Request Management</span>
        </div>
        <div className="topbar-right">
          <div className="live-indicator">
            <span className="live-dot" />
            Live
          </div>
          <span className="topbar-time">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      <main className="main">
        {/* ── Summary Bar ─────────────────────────────────── */}
        <section className="summary-bar">
          <div className="summary-card accent-red">
            <span className="summary-num">{highCount}</span>
            <span className="summary-label">High Priority</span>
          </div>
          <div className="summary-card accent-green">
            <span className="summary-num">{autoCount}</span>
            <span className="summary-label">Auto-Resolved</span>
          </div>
          <div className="summary-card accent-red">
            <span className="summary-num">{escalateCount}</span>
            <span className="summary-label">Escalated</span>
          </div>
          <div className="summary-card accent-blue">
            <span className="summary-num">{SLOTS_REMAINING}</span>
            <span className="summary-label">Slots Today</span>
          </div>
          <div className="summary-card accent-orange">
            <span className="summary-num">{requests.length}</span>
            <span className="summary-label">Requests</span>
          </div>
        </section>

        {/* ── Staff Panel ──────────────────────────────────── */}
        <section className="staff-panel">
          <h2 className="panel-title">On-Duty Staff</h2>
          <div className="staff-list">
            {STAFF.map((s) => (
              <div className="staff-chip" key={s.name}>
                <span className="staff-avatar">{s.avatar}</span>
                <div>
                  <div className="staff-name">{s.name}</div>
                  <div className="staff-role">{s.role}</div>
                </div>
                <span className="staff-status-dot" />
              </div>
            ))}
          </div>
        </section>

        {/* ── Requests ────────────────────────────────────── */}
        <section className="requests-section">
          <div className="requests-header">
            <h2 className="panel-title">Incoming Requests</h2>
            <div className="sort-toggle">
              <span className="sort-label">Sort by:</span>
              <button
                id="sort-priority-btn"
                className={`sort-btn${sortMode === 'priority' ? ' sort-btn--active' : ''}`}
                onClick={() => setSortMode('priority')}
              >
                ↑ Priority
              </button>
              <button
                id="sort-time-btn"
                className={`sort-btn${sortMode === 'time' ? ' sort-btn--active' : ''}`}
                onClick={() => setSortMode('time')}
              >
                🕐 Time (oldest first)
              </button>
            </div>
          </div>
          <div className="requests-list">
            {sortedRequests.map((item, i) => (
              <RequestCard key={item.request.id} item={item} index={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
