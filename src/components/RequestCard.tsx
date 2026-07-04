import React, { useState } from 'react';
import type { TriagedRequest } from '../types';

interface CardProps {
  item: TriagedRequest;
  index: number;
}

const PRIORITY_CONFIG = {
  HIGH: { label: 'HIGH', color: '#ff4d4d', bg: 'rgba(255,77,77,0.12)', border: 'rgba(255,77,77,0.35)' },
  MEDIUM: { label: 'MEDIUM', color: '#f5a623', bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.35)' },
  LOW: { label: 'LOW', color: '#4caf50', bg: 'rgba(76,175,80,0.12)', border: 'rgba(76,175,80,0.35)' },
};

const ACTION_CONFIG = {
  AUTO_RESOLVE: { label: 'Auto-Resolve', icon: '⚡', color: '#4caf50' },
  ESCALATE: { label: 'Escalate to Manager', icon: '🚨', color: '#ff4d4d' },
  ASSIGN_STAFF: { label: 'Assign to Staff', icon: '👤', color: '#7b8cde' },
};

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: '#888' },
  IN_PROGRESS: { label: 'In Progress', color: '#f5a623' },
  ESCALATED: { label: 'Escalated', color: '#ff4d4d' },
  RESOLVED: { label: 'Resolved', color: '#4caf50' },
};

const CUSTOMER_TYPE_BADGE = {
  VIP: { label: '★ VIP', color: '#f5c842', bg: 'rgba(245,200,66,0.15)' },
  NEW: { label: '✦ NEW', color: '#7b8cde', bg: 'rgba(123,140,222,0.15)' },
  REGULAR: { label: 'Regular', color: '#aaa', bg: 'rgba(255,255,255,0.07)' },
};

const CHANNEL_ICON: Record<string, string> = {
  email: '✉',
  phone: '📞',
  chat: '💬',
};

export const RequestCard: React.FC<CardProps> = ({ item, index }) => {
  const { request, decision } = item;
  const [showResponse, setShowResponse] = useState(false);
  const [workflowTriggered, setWorkflowTriggered] = useState(
    decision.automatedActionTriggered
  );
  const [status, setStatus] = useState(decision.workflowStatus);

  const priority = PRIORITY_CONFIG[decision.priority];
  const action = ACTION_CONFIG[decision.action];
  const statusCfg = STATUS_CONFIG[status];
  const ctBadge = CUSTOMER_TYPE_BADGE[request.customerType];

  const handleTriggerWorkflow = () => {
    setWorkflowTriggered(true);
    if (decision.action === 'ESCALATE') setStatus('ESCALATED');
    else if (decision.action === 'AUTO_RESOLVE') setStatus('RESOLVED');
    else setStatus('IN_PROGRESS');
  };

  return (
    <div
      className="request-card"
      style={{
        borderLeft: `4px solid ${priority.color}`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* ── Header Row ────────────────────────────────────── */}
      <div className="card-header">
        <div className="card-header-left">
          <span className="rank-badge">#{index + 1}</span>
          <div className="customer-info">
            <div className="customer-name">
              {request.customerName}
              <span
                className="customer-type-badge"
                style={{ color: ctBadge.color, background: ctBadge.bg }}
              >
                {ctBadge.label}
              </span>
            </div>
            <div className="issue-label">
              <span className="request-id-tag">{request.id}</span>
              <span className="channel-icon">{CHANNEL_ICON[request.channel]}</span>
              {request.issue}
              <span className="timestamp">{request.timestamp}</span>
            </div>
          </div>
        </div>

        <div className="card-header-right">
          <span
            className="priority-badge"
            style={{
              color: priority.color,
              background: priority.bg,
              border: `1px solid ${priority.border}`,
            }}
          >
            {priority.label}
          </span>
          <span
            className="status-dot"
            style={{ color: statusCfg.color }}
          >
            ● {statusCfg.label}
          </span>
        </div>
      </div>

      {/* ── Description ───────────────────────────────────── */}
      <p className="card-description">{request.description}</p>

      {/* ── Decision Row ──────────────────────────────────── */}
      <div className="decision-row">
        {/* Confidence */}
        <div className="decision-block">
          <span className="decision-label">AI Confidence</span>
          <div className="confidence-bar-wrap">
            <div
              className="confidence-bar-fill"
              style={{
                width: `${decision.confidenceScore}%`,
                background:
                  decision.confidenceScore >= 90
                    ? '#4caf50'
                    : decision.confidenceScore >= 70
                    ? '#f5a623'
                    : '#ff4d4d',
              }}
            />
          </div>
          <span className="confidence-value">{decision.confidenceScore}%</span>
        </div>

        {/* Action */}
        <div className="decision-block">
          <span className="decision-label">Recommended Action</span>
          <span className="action-chip" style={{ color: action.color }}>
            {action.icon} {action.label}
          </span>
        </div>

        {/* Staff */}
        <div className="decision-block">
          <span className="decision-label">Assigned To</span>
          <span className="assigned-value">
            {decision.assignedTo ? (
              <>
                <span className="avatar">{decision.assignedTo[0]}</span>
                {decision.assignedTo}
              </>
            ) : (
              <span style={{ color: '#888' }}>— System</span>
            )}
          </span>
        </div>

        {/* Manager flag */}
        {decision.requiresManagerApproval && (
          <div className="decision-block">
            <span className="decision-label">Approval</span>
            <span className="manager-flag">⚠ Manager Required</span>
          </div>
        )}
      </div>

      {/* ── Reasoning ─────────────────────────────────────── */}
      <div className="reasoning-box">
        <span className="reasoning-label">🧠 AI Reasoning</span>
        <p className="reasoning-text">{decision.reasoning}</p>
      </div>

      {/* ── Automated Workflow ─────────────────────────────── */}
      <div className="workflow-row">
        {workflowTriggered ? (
          <span className="workflow-triggered">{decision.automatedActionLabel}</span>
        ) : (
          <button className="workflow-btn" onClick={handleTriggerWorkflow}>
            ▶ Trigger Workflow
          </button>
        )}

        <button
          className="response-toggle"
          onClick={() => setShowResponse((v) => !v)}
        >
          {showResponse ? '▲ Hide Response' : '✉ View Response'}
        </button>
      </div>

      {/* ── Suggested Response (expandable) ───────────────── */}
      {showResponse && (
        <div className="response-box">
          <div className="response-header">
            <span>Suggested Response</span>
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(decision.suggestedResponse)}
            >
              Copy ✂
            </button>
          </div>
          <p className="response-text">"{decision.suggestedResponse}"</p>
        </div>
      )}
    </div>
  );
};
