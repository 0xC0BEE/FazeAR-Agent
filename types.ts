
export interface Task {
  id: string;
  content: string;
  assignee: string;
  isCompleted: boolean;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface CommunicationHistory {
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
  status: 'Overdue' | 'In Progress' | 'Completed';
  assignee: string;
  dunningPlanName: string;
  notes: Note[];
  tasks: Task[];
  communicationHistory: CommunicationHistory[];
  auditTrail: AuditEntry[];
  paymentUrl: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Collector' | 'Manager' | 'Admin';
}

export interface DunningPlanStep {
    day: number;
    action: 'EMAIL' | 'CALL';
    template: string;
}

export interface DunningPlan {
  name: string;
  steps: DunningPlanStep[];
}

export interface Draft {
    type: 'draft';
    recipient: string;
    subject: string;
    body: string;
    workflowId: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string | Draft;
  isLoading?: boolean;
  isAutonomous?: boolean;
}
