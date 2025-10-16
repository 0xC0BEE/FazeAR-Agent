
export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Collector';
}

export interface DunningStep {
  day: number;
  action: 'EMAIL' | 'CALL';
  template: string;
}

export interface DunningPlan {
  name: string;
  steps: DunningStep[];
}

export interface AuditTrailEntry {
  timestamp: string;
  activity: string;
  details: string;
}

export interface Workflow {
  id: string;
  externalId: string; // e.g., from QuickBooks
  clientName: string;
  amount: number;
  dueDate: string;
  createdDate: string;
  status: 'In Progress' | 'Overdue' | 'Completed';
  assignee: string;
  dunningPlan: string;
  currentStep: number;
  auditTrail: AuditTrailEntry[];
  paymentDate?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'tool';
  content?: string;
  toolCall?: { id: string; name: string; args: any };
  toolResponse?: { id: string; name: string; response: any };
  isThinking?: boolean;
}
