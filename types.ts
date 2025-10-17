export type Role = 'Admin' | 'Manager' | 'Collector' | 'Client';

export interface User {
  id: string;
  name: string;
  role: Role;
  clientName?: string; // Only for clients
}

export type WorkflowStatus = 'Overdue' | 'In Progress' | 'Completed' | 'Disputed';
export type DisputeStatus = 'New' | 'Under Review' | 'Resolution Proposed' | 'Resolved';

export interface AuditEntry {
  timestamp: string;
  activity: string;
  details: string;
}

export interface Workflow {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  createdDate: string;
  status: WorkflowStatus;
  assignee: string;
  auditTrail: AuditEntry[];
  externalId: string;
  dunningPlan: string;
  paymentDate?: string;
  isAutonomous: boolean;
  disputeStatus?: DisputeStatus;
  disputeReason?: string;
}

export interface ToolCall {
  name: string;
  args: Record<string, any>;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content?: string;
  isThinking?: boolean;
  toolCall?: ToolCall;
}

export type Tone = 'Default' | 'Friendly' | 'Formal' | 'Firm';

export interface DunningStep {
  id: string;
  day: number;
  template: string;
}

export interface DunningPlan {
  id: string;
  name: string;
  steps: DunningStep[];
}

export interface Integration {
    id: 'quickbooks' | 'stripe' | 'gmail';
    name: string;
    connected: boolean;
    description: string;
}

export interface Settings {
  dunningPlans: DunningPlan[];
  integrations: Integration[];
}

export interface Communication {
    id: string;
    recipient: string;
    subject: string;
    body: string;
    status: 'Draft' | 'Sent';
    workflowId: string;
}

export interface Notification {
    id: string;
    message: string;
    type: 'agent' | 'success' | 'error' | 'info';
}
