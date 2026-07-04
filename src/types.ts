export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Action = 'AUTO_RESOLVE' | 'ESCALATE' | 'ASSIGN_STAFF';
export type StaffMember = 'Sarah' | 'James' | null;
export type WorkflowStatus = 'PENDING' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED';

export interface CustomerRequest {
  id: string;
  customerName: string;
  customerType: 'VIP' | 'NEW' | 'REGULAR';
  issue: string;
  description: string;
  channel: 'email' | 'phone' | 'chat';
  timestamp: string;
}

export interface TriageDecision {
  requestId: string;
  priority: Priority;
  confidenceScore: number; // 0–100
  action: Action;
  assignedTo: StaffMember;
  suggestedResponse: string;
  reasoning: string;
  workflowStatus: WorkflowStatus;
  requiresManagerApproval: boolean;
  automatedActionTriggered: boolean;
  automatedActionLabel?: string;
}

export interface TriagedRequest {
  request: CustomerRequest;
  decision: TriageDecision;
}
