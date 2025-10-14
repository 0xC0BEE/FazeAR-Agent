
export interface User {
  id: string;
  name: string;
  role: 'Collector' | 'Manager' | 'Admin';
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

export interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface Task {
  id: string;
  content: string;
  assignee: string;
  isCompleted: boolean;
}

export interface Communication {
  stepName: string;
  timestamp: string;
}

export interface AuditEntry {
  timestamp: string;
  activity: string;
  details: string;
}

export interface Workflow {
  id: string;
  clientName: string;
  amount: number;
  createdDate: string;
  dueDate: string;
  paymentDate?: string;
  status: 'In Progress' | 'Overdue' | 'Completed';
  assignee: string;
  dunningPlanName: string;
  notes: Note[];
  tasks: Task[];
  communicationHistory: Communication[];
  auditTrail: AuditEntry[];
  paymentUrl: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'system';
    content: string;
    isThinking?: boolean;
    relatedDocuments?: {
        title: string;
        uri: string;
    }[];
}
