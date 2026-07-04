import type { CustomerRequest, TriagedRequest, TriageDecision } from './types';

// ─── Mock Customer Requests ────────────────────────────────────────────────────
export const RAW_REQUESTS: CustomerRequest[] = [
  {
    id: 'REQ-001',
    customerName: 'Ali CEO',
    customerType: 'VIP',
    issue: 'Booking Cancellation',
    description:
      'VIP customer Ali CEO (Gold Tier) reports his appointment was cancelled without notice. He has been with us for 3 years.',
    channel: 'email',
    timestamp: '10:02 AM',
  },
  {
    id: 'REQ-002',
    customerName: 'Mohammed',
    customerType: 'NEW',
    issue: 'New Appointment Request',
    description:
      'New customer Mohammed wants to book the earliest available slot today. Referred by an existing customer.',
    channel: 'chat',
    timestamp: '10:15 AM',
  },
  {
    id: 'REQ-003',
    customerName: 'Khaled',
    customerType: 'REGULAR',
    issue: 'Double Charge — Refund Required',
    description:
      'Customer Khaled was charged twice for the same service. Total overcharge is 900 BHD. He is frustrated and has threatened to dispute with his bank.',
    channel: 'phone',
    timestamp: '09:48 AM',
  },
  {
    id: 'REQ-004',
    customerName: 'Idrees',
    customerType: 'REGULAR',
    issue: 'Pricing Inquiry',
    description:
      'Customer Idrees is asking about the cost difference between the standard and premium service packages.',
    channel: 'chat',
    timestamp: '10:20 AM',
  },
  {
    id: 'REQ-005',
    customerName: 'Hussain',
    customerType: 'REGULAR',
    issue: 'Urgent Issue — Review Threat',
    description:
      'Customer Hussain is experiencing a service issue and is threatening to leave a 1-star review publicly on Google if not resolved within the hour.',
    channel: 'phone',
    timestamp: '10:05 AM',
  },
];

// ─── Knowledge Base & VIP List ─────────────────────────────────────────────────
const VIP_LIST = ['Ali CEO', 'Eleanor Voss', 'Michael Tran'];
const REFUND_APPROVAL_LIMIT = 500; // BHD

function isVip(name: string): boolean {
  return VIP_LIST.includes(name);
}

// ─── Decision Engine ───────────────────────────────────────────────────────────
function triageRequest(req: CustomerRequest): TriageDecision {
  switch (req.id) {

    // ── REQ-001: VIP cancellation ─────────────────────────────────────────────
    case 'REQ-001': {
      const vipConfirmed = isVip(req.customerName);
      return {
        requestId: req.id,
        priority: 'HIGH',
        confidenceScore: 96,
        action: 'ASSIGN_STAFF',
        assignedTo: 'Sarah',
        suggestedResponse: `Hi Ali, we sincerely apologise for the cancellation issue. We've reserved our next available slot exclusively for you and Sarah will be in touch within 5 minutes to confirm the details. Thank you for your loyalty.`,
        reasoning: `Customer confirmed on VIP list (Gold Tier, 3-year client). Policy: VIP cancellations get immediate priority re-booking with a senior staff member. Auto-checked availability — 3 slots remain today.`,
        workflowStatus: vipConfirmed ? 'IN_PROGRESS' : 'ESCALATED',
        requiresManagerApproval: false,
        automatedActionTriggered: true,
        automatedActionLabel: '✓ VIP slot reserved · Sarah notified',
      };
    }

    // ── REQ-002: New customer booking ─────────────────────────────────────────
    case 'REQ-002': {
      return {
        requestId: req.id,
        priority: 'MEDIUM',
        confidenceScore: 88,
        action: 'AUTO_RESOLVE',
        assignedTo: null,
        suggestedResponse: `Hi Mohammed, welcome! We've booked you into the earliest slot today at 11:30 AM. You'll receive a confirmation SMS shortly. Looking forward to meeting you!`,
        reasoning: `New customer with referral. Standard booking flow — checked availability, earliest slot at 11:30 AM auto-allocated. No VIP status, no billing issue. System can handle this end-to-end.`,
        workflowStatus: 'RESOLVED',
        requiresManagerApproval: false,
        automatedActionTriggered: true,
        automatedActionLabel: '✓ Booked 11:30 AM · Confirmation SMS queued',
      };
    }

    // ── REQ-003: Double charge / refund (EDGE CASE — must escalate) ───────────
    case 'REQ-003': {
      const refundAmount = 900;
      const exceedsLimit = refundAmount > REFUND_APPROVAL_LIMIT;
      return {
        requestId: req.id,
        priority: 'HIGH',
        confidenceScore: 99,
        action: 'ESCALATE',
        assignedTo: null,
        suggestedResponse: `Hi Khaled, we're truly sorry for this billing error. We've flagged this as urgent and a manager will contact you within 15 minutes to authorise your full 900 BHD refund. We'll also apply a service credit as an apology.`,
        reasoning: `⚠ EDGE CASE: Refund amount (${refundAmount} BHD) exceeds the ${REFUND_APPROVAL_LIMIT} BHD auto-approval limit. Business rule requires manager sign-off. AI cannot process this autonomously — escalation is mandatory.`,
        workflowStatus: 'ESCALATED',
        requiresManagerApproval: exceedsLimit,
        automatedActionTriggered: true,
        automatedActionLabel: '⚠ Manager alert sent · Ticket #4821 opened',
      };
    }

    // ── REQ-004: Pricing question ─────────────────────────────────────────────
    case 'REQ-004': {
      return {
        requestId: req.id,
        priority: 'LOW',
        confidenceScore: 98,
        action: 'AUTO_RESOLVE',
        assignedTo: null,
        suggestedResponse: `Hi Idrees! Our Standard Package is $120/session, covering the core service. The Premium Package is $185/session and includes priority scheduling, extended time, and a complimentary follow-up. Happy to book either for you!`,
        reasoning: `Straightforward pricing query matched in knowledge base. Confidence is high (98%). No billing issue, no urgency. System resolves automatically — no staff required.`,
        workflowStatus: 'RESOLVED',
        requiresManagerApproval: false,
        automatedActionTriggered: true,
        automatedActionLabel: '✓ KB match found · Response auto-sent',
      };
    }

    // ── REQ-005: Review threat ────────────────────────────────────────────────
    case 'REQ-005': {
      return {
        requestId: req.id,
        priority: 'HIGH',
        confidenceScore: 91,
        action: 'ASSIGN_STAFF',
        assignedTo: 'James',
        suggestedResponse: `Hi Hussain, we're sorry to hear about your experience — that's not the standard we hold ourselves to. James from our team will call you back within 10 minutes to personally resolve this. We appreciate you giving us the chance to make it right.`,
        reasoning: `Public review threat creates reputational risk. Requires human empathy and negotiation — automated response insufficient. James assigned for immediate callback within SLA. Urgency: high (1-hour window stated by customer).`,
        workflowStatus: 'IN_PROGRESS',
        requiresManagerApproval: false,
        automatedActionTriggered: true,
        automatedActionLabel: '✓ James alerted · Callback queued (10 min)',
      };
    }

    default:
      throw new Error(`Unknown request: ${req.id}`);
  }
}

// ─── Sort by priority ──────────────────────────────────────────────────────────
const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function getTriagedRequests(): TriagedRequest[] {
  return RAW_REQUESTS.map((req) => ({
    request: req,
    decision: triageRequest(req),
  })).sort(
    (a, b) =>
      PRIORITY_ORDER[a.decision.priority] - PRIORITY_ORDER[b.decision.priority]
  );
}
