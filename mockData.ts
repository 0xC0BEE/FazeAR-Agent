
import { User, DunningPlan, Workflow } from './types.ts';
import { v4 as uuidv4 } from 'uuid';

export const USERS: User[] = [
  { id: 'user-1', name: 'Alex Johnson', role: 'Admin' },
  { id: 'user-2', name: 'Maria Garcia', role: 'Manager' },
  { id: 'user-3', name: 'David Chen', role: 'Collector' },
  { id: 'user-4', name: 'Emily White', role: 'Collector' },
];

export const DUNNING_PLANS: DunningPlan[] = [
  {
    name: 'Standard',
    steps: [
      { day: 3, action: 'EMAIL', template: 'Gentle Reminder' },
      { day: 15, action: 'EMAIL', template: 'Second Notice' },
      { day: 30, action: 'CALL', template: 'First Call Script' },
      { day: 45, action: 'EMAIL', template: 'Final Notice' },
    ],
  },
  {
    name: 'Aggressive',
    steps: [
      { day: 1, action: 'EMAIL', template: 'Payment Due' },
      { day: 7, action: 'CALL', template: 'First Call Script' },
      { day: 14, action: 'EMAIL', template: 'Second Notice (Urgent)' },
      { day: 21, action: 'CALL', template: 'Second Call Script' },
      { day: 30, action: 'EMAIL', template: 'Final Notice (Action Required)' },
    ],
  },
];

const generateRandomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

export const WORKFLOWS: Workflow[] = [
  // Overdue
  {
    id: `wf-a1b7c7f5`,
    externalId: 'qb_inv_88a1b7',
    clientName: 'Innovate Corp',
    amount: 25000,
    dueDate: '2024-06-15',
    createdDate: '2024-05-16',
    status: 'Overdue',
    assignee: 'David Chen',
    dunningPlan: 'Standard',
    currentStep: 2,
    auditTrail: [
        { timestamp: '2024-06-18T10:00:00Z', activity: 'Email Sent', details: 'Template: Second Notice' },
        { timestamp: '2024-05-19T09:00:00Z', activity: 'Email Sent', details: 'Template: Gentle Reminder' }
    ],
  },
  {
    id: `wf-d8e9f0a1`,
    externalId: 'qb_inv_92c3d8',
    clientName: 'Quantum Solutions',
    amount: 15234.50,
    dueDate: '2024-05-20',
    createdDate: '2024-04-20',
    status: 'Overdue',
    assignee: 'Emily White',
    dunningPlan: 'Aggressive',
    currentStep: 4,
    auditTrail: [ { timestamp: '2024-05-28T14:20:10Z', activity: 'Call Logged', details: 'Left voicemail with contact.' } ],
  },
  // In Progress
  {
    id: `wf-b2c3d4e5`,
    externalId: 'qb_inv_75e9f0',
    clientName: 'Synergy Partners',
    amount: 7800,
    dueDate: '2024-08-01',
    createdDate: '2024-07-02',
    status: 'In Progress',
    assignee: 'David Chen',
    dunningPlan: 'Standard',
    currentStep: 0,
    auditTrail: [],
  },
  {
    id: `wf-f6g7h8i9`,
    externalId: 'qb_inv_b4a0e1',
    clientName: 'Apex Industries',
    amount: 42500,
    dueDate: '2024-07-25',
    createdDate: '2024-06-25',
    status: 'In Progress',
    assignee: 'Emily White',
    dunningPlan: 'Standard',
    currentStep: 0,
    auditTrail: [],
  },
  // More data
  ...Array.from({ length: 20 }, (_, i) => {
    const clientNames = ['Nexus Tech', 'Visionary Inc.', 'Pinnacle Group', 'Momentum LLC', 'Starlight Enterprises'];
    const assignees = ['David Chen', 'Emily White'];
    const created = new Date();
    created.setDate(created.getDate() - i * 5 - 10);
    const due = new Date(created);
    due.setDate(due.getDate() + 30);
    const today = new Date();
    const isOverdue = due < today;
    return {
        id: `wf-${uuidv4().slice(0, 8)}`,
        externalId: `qb_inv_${uuidv4().slice(0, 6)}`,
        clientName: clientNames[i % clientNames.length],
        amount: Math.floor(Math.random() * (50000 - 500 + 1)) + 500,
        dueDate: due.toISOString().split('T')[0],
        createdDate: created.toISOString().split('T')[0],
        status: isOverdue ? 'Overdue' : 'In Progress',
        assignee: assignees[i % assignees.length],
        dunningPlan: 'Standard',
        currentStep: isOverdue ? 1 : 0,
        auditTrail: isOverdue ? [{ timestamp: new Date(new Date(due).setDate(due.getDate() + 3)).toISOString(), activity: 'Email Sent', details: 'Template: Gentle Reminder' }] : [],
    } as Workflow
  })
];