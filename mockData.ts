
import { v4 as uuidv4 } from 'uuid';
import type { Workflow, User, DunningPlan, AuditEntry } from './types';

export const initialUsers: User[] = [
  { id: 'user-1', name: 'Alex Johnson', role: 'Collector' },
  { id: 'user-2', name: 'Sarah Miller', role: 'Manager' },
  { id: 'user-3', name: 'David Chen', role: 'Admin' },
];

export const dunningPlans: DunningPlan[] = [
  {
    name: 'Standard',
    steps: [
      { day: 1, action: 'EMAIL', template: 'Gentle Reminder' },
      { day: 7, action: 'EMAIL', template: 'Second Reminder' },
      { day: 15, action: 'CALL', template: 'Follow-up Call' },
      { day: 30, action: 'EMAIL', template: 'Final Notice' },
    ],
  },
  {
    name: 'Aggressive',
    steps: [
      { day: 1, action: 'EMAIL', template: 'Immediate Reminder' },
      { day: 3, action: 'CALL', template: 'First Follow-up Call' },
      { day: 7, action: 'EMAIL', template: 'Urgent Payment Request' },
      { day: 14, action: 'CALL', template: 'Final Warning Call' },
    ],
  },
];

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const createAuditTrail = (creator: string, activity: string, details: string): AuditEntry[] => [
  { timestamp: new Date(new Date().getTime() - 86400000).toISOString(), activity: 'Workflow Created', details: `Created by ${creator}` },
  { timestamp: new Date().toISOString(), activity, details },
];

export const initialWorkflows: Workflow[] = [
  {
    id: 'wf-1',
    clientName: 'Quantum Solutions',
    amount: 15234.50,
    createdDate: formatDate(new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)), // 45 days ago
    dueDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)), // 15 days ago
    status: 'Overdue',
    assignee: 'Alex Johnson',
    dunningPlanName: 'Standard',
    notes: [
        { id: uuidv4(), content: "Client mentioned they're waiting for a PO.", author: 'Alex Johnson', timestamp: new Date().toISOString() },
    ],
    tasks: [
        { id: uuidv4(), content: "Follow up via phone call.", assignee: 'Alex Johnson', isCompleted: false }
    ],
    communicationHistory: [
        { stepName: "Gentle Reminder Email Sent", timestamp: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        { stepName: "Second Reminder Email Sent", timestamp: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    auditTrail: createAuditTrail('Sarah Miller', 'Status Changed to Overdue', 'Payment not received by due date.'),
    paymentUrl: `${window.location.origin}/pay?workflowId=wf-1`,
  },
  {
    id: 'wf-2',
    clientName: 'Synergy Corp',
    amount: 8500.00,
    createdDate: formatDate(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)),
    dueDate: formatDate(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)), // 10 days from now
    status: 'In Progress',
    assignee: 'Alex Johnson',
    dunningPlanName: 'Standard',
    notes: [],
    tasks: [],
    communicationHistory: [],
    auditTrail: createAuditTrail('David Chen', 'Initial Review', 'Workflow created and assigned.'),
    paymentUrl: `${window.location.origin}/pay?workflowId=wf-2`,
  },
  {
    id: 'wf-3',
    clientName: 'Innovate Inc.',
    amount: 25000.00,
    createdDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
    dueDate: formatDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    status: 'In Progress',
    assignee: 'Sarah Miller',
    dunningPlanName: 'Standard',
    notes: [{id: uuidv4(), content: 'High-value client, monitor closely.', author: 'David Chen', timestamp: new Date().toISOString()}],
    tasks: [],
    communicationHistory: [],
    auditTrail: createAuditTrail('David Chen', 'Initial Review', 'Workflow created and assigned.'),
    paymentUrl: `${window.location.origin}/pay?workflowId=wf-3`,
  },
   {
    id: 'wf-4',
    clientName: 'Apex Industries',
    amount: 4500.75,
    createdDate: formatDate(new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000)),
    dueDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
    status: 'Overdue',
    assignee: 'Alex Johnson',
    dunningPlanName: 'Aggressive',
    notes: [],
    tasks: [
        { id: uuidv4(), content: "Send urgent payment request.", assignee: 'Alex Johnson', isCompleted: true },
        { id: uuidv4(), content: "Prepare for final warning call.", assignee: 'Alex Johnson', isCompleted: false }
    ],
    communicationHistory: [
        { stepName: "Immediate Reminder Email Sent", timestamp: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    auditTrail: createAuditTrail('Sarah Miller', 'Status Changed to Overdue', 'Payment not received by due date.'),
    paymentUrl: `${window.location.origin}/pay?workflowId=wf-4`,
  },
  {
    id: 'wf-5',
    clientName: 'Horizon Dynamics',
    amount: 11200.00,
    createdDate: formatDate(new Date(today.getTime() - 75 * 24 * 60 * 60 * 1000)),
    dueDate: formatDate(new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)), // 45 days ago
    paymentDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
    status: 'Completed',
    assignee: 'Sarah Miller',
    dunningPlanName: 'Standard',
    notes: [{id: uuidv4(), content: 'Payment received after final notice.', author: 'Sarah Miller', timestamp: new Date().toISOString()}],
    tasks: [],
    communicationHistory: [],
    auditTrail: createAuditTrail('Sarah Miller', 'Payment Received', 'Payment processed via Stripe.'),
    paymentUrl: `${window.location.origin}/pay?workflowId=wf-5`,
  },
  {
    id: 'wf-6',
    clientName: 'Pinnacle Group',
    amount: 7800.00,
    createdDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
    dueDate: formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)), // 5 days from now
    status: 'In Progress',
    assignee: 'Sarah Miller',
    dunningPlanName: 'Standard',
    notes: [],
    tasks: [],
    communicationHistory: [],
    auditTrail: createAuditTrail('David Chen', 'Initial Review', 'Workflow created and assigned.'),
    paymentUrl: `${window.location.origin}/pay?workflowId=wf-6`,
  },
];