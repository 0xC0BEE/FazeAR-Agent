// Fix: Re-implemented the full types.ts to resolve widespread module and type errors.
export type Tone = 'Default' | 'Friendly' | 'Formal' | 'Firm';

export type Role = 'Admin' | 'Manager' | 'Collector' | 'Client';

export interface User {
  id: string;
  name: string;
  role: Role;
  clientName?: string;
}

export interface ChatMessage {
  id:string;
  role: 'user' | 'model' | 'system';
  content: string | null;
  isThinking?: boolean;
  toolCall?: {
    name: string;
    args: any;
  };
}

export type DisputeStatus = 'New' | 'Under Review' | 'Resolution Proposed' | 'Resolved';

export interface AuditLogEntry {
  timestamp: string;
  activity: string;
  details: string;
}

export interface Communication {
    id: string;
    recipient: string;
    subject: string;
    body: string;
    status: 'Draft' | 'Sent';
    timestamp: string;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export interface Workflow {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  // Fix: Added 'Disputed' to the list of possible workflow statuses to resolve a type error when an invoice is disputed.
  status: 'Overdue' | 'In Progress' | 'Completed' | 'Disputed';
  assignee: string;
  isAutonomous: boolean;
  externalId: string; // e.g., QB invoice number
  auditTrail: AuditLogEntry[];
  communications: Communication[];
  dunningPlanId: string | null;
  disputeStatus: DisputeStatus | null;
  disputeReason: string | null;
  createdDate: string;
  paymentDate: string | null;
  items: InvoiceItem[];
}

export interface DunningStep {
  id: string;
  day: number; // days after due date
  template: string; // Could be an ID or the template content itself
}

export interface DunningPlan {
  id: string;
  name: string;
  steps: DunningStep[];
}

export interface Integration {
  id: 'quickbooks' | 'stripe' | 'gmail';
  name: string;
  description: string;
  connected: boolean;
}

export interface Settings {
  dunningPlans: DunningPlan[];
  integrations: Integration[];
}

export interface Notification {
  id: string;
  type: 'agent' | 'success' | 'error' | 'info';
  message: string;
}

export interface Match {
  clientName: string;
  invoiceId: string;
  amountPaid: number;
  workflowId: string | null;
  status: 'matched' | 'partial' | 'unmatched';
}

export interface ResolutionSuggestion {
    summary: string;
    suggestions: {
        title: string;
        prompt: string;
    }[];
}