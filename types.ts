export interface User {
  id: string;
  name: string;
  role: 'Collector' | 'Manager' | 'Admin';
}

export interface AuditLogEntry {
  timestamp: string;
  activity: string;
  details: string;
}

export interface Dispute {
  id: string;
  amount: number;
  reason: string;
  status: 'Open' | 'Resolved' | 'Pending';
  dateCreated: string;
}

export interface Workflow {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'In Progress' | 'Overdue' | 'Completed';
  assignee: string;
  dunningPlan: string;
  lastContacted: string | null;
  paymentDate?: string;
  createdDate: string;
  auditTrail: AuditLogEntry[];
  externalId: string;
  disputes?: Dispute[];
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

export interface FunctionCall {
  name: string;
  args: Record<string, any>;
  id: string;
}

export interface FunctionResponse {
  id: string;
  name: string;
  response: {
    result: any;
  };
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    content?: string;
    isThinking?: boolean;
    toolCall?: FunctionCall;
    toolResponse?: FunctionResponse;
}