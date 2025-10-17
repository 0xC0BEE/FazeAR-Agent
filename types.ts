export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Collector';
}

export interface AuditTrailEntry {
  timestamp: string;
  activity: string;
  details: string;
}

export interface Workflow {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Overdue' | 'In Progress' | 'Completed';
  assignee: string;
  auditTrail: AuditTrailEntry[];
  externalId: string;
  dunningPlan: string;
  paymentDate?: string; // YYYY-MM-DD
  createdDate: string; // YYYY-MM-DD
  isAutonomous: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolResponse {
  id: string;
  name: string;
  response: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'tool';
  content?: string;
  isThinking?: boolean;
  toolCall?: ToolCall;
  toolResponse?: ToolResponse;
}

export interface DunningStep {
  id:string;
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
}

export interface Settings {
  dunningPlans: DunningPlan[];
  integrations: Integration[];
}