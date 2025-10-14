

import type { User, DunningPlan, Workflow } from './types';
import { v4 as uuidv4 } from 'uuid';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alex Johnson', role: 'Collector' },
  { id: 'user-2', name: 'Maria Garcia', role: 'Manager' },
  { id: 'user-3', name: 'Sam Chen', role: 'Admin' },
];

export const mockDunningPlans: DunningPlan[] = [
  {
    name: 'Standard',
    steps: [
      { day: 1, action: 'EMAIL', template: 'Initial Reminder' },
      { day: 7, action: 'EMAIL', template: 'Second Reminder' },
      { day: 15, action: 'CALL', template: 'First Call Script' },
      { day: 30, action: 'EMAIL', template: 'Escalation Notice' },
    ],
  },
  {
    name: 'Aggressive',
    steps: [
      { day: 1, action: 'EMAIL', template: 'Urgent Reminder' },
      { day: 3, action: 'CALL', template: 'Immediate Follow-up' },
      { day: 7, action: 'EMAIL', template: 'Final Notice' },
      { day: 14, action: 'CALL', template: 'Escalation Call' },
    ],
  },
];

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const mockWorkflows: Workflow[] = [
  {
    id: 'c7a4c3f5-118a-4c28-8a8b-59a4c8f2c7f5',
    clientName: 'Innovate Corp',
    amount: 15234.50,
    dueDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)),
    status: 'Overdue',
    assignee: 'Alex Johnson',
    dunningPlan: 'Standard',
    lastContacted: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
    createdDate: formatDate(new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)),
    auditTrail: [
      { timestamp: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Email Sent', details: 'Template: Second Reminder' },
      { timestamp: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Email Sent', details: 'Template: Initial Reminder' },
      { timestamp: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Workflow Created', details: 'Invoice #INV-001 created.' }
    ],
    externalId: 'qb_inv_123',
  },
  {
    id: 'd8b5e4a3-229c-5d39-9b9c-60b5d9e3d8e6',
    clientName: 'Synergy Corp',
    amount: 7500.00,
    dueDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
    status: 'Overdue',
    assignee: 'Maria Garcia',
    dunningPlan: 'Standard',
    lastContacted: null,
    createdDate: formatDate(new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000)),
    auditTrail: [{ timestamp: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Workflow Created', details: 'Invoice #INV-004 created.' }],
    externalId: 'qb_inv_128',
    disputes: [
        { id: uuidv4(), amount: 1000, reason: 'Damaged Goods Claim', status: 'Open', dateCreated: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: uuidv4(),
    clientName: 'Quantum Solutions',
    amount: 8500.00,
    dueDate: formatDate(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)),
    status: 'In Progress',
    assignee: 'Alex Johnson',
    dunningPlan: 'Standard',
    lastContacted: null,
    createdDate: formatDate(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)),
    auditTrail: [{ timestamp: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Workflow Created', details: 'Invoice #INV-002 created.' }],
    externalId: 'qb_inv_124',
  },
    {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    clientName: 'Apex Industries',
    amount: 22000.75,
    dueDate: formatDate(new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000)),
    status: 'Overdue',
    assignee: 'Maria Garcia',
    dunningPlan: 'Aggressive',
    lastContacted: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
    createdDate: formatDate(new Date(today.getTime() - 70 * 24 * 60 * 60 * 1000)),
    auditTrail: [
        { timestamp: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Call Made', details: 'Spoke to accounts payable.' },
        { timestamp: new Date(today.getTime() - 39 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Email Sent', details: 'Template: Urgent Reminder' },
        { timestamp: new Date(today.getTime() - 70 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Workflow Created', details: 'Invoice #INV-003 created.' }
    ],
    externalId: 'qb_inv_125',
  },
  {
    id: uuidv4(),
    clientName: 'Zenith Tech',
    amount: 5000.00,
    dueDate: formatDate(new Date(today.getTime() - 95 * 24 * 60 * 60 * 1000)),
    status: 'Overdue',
    assignee: 'Alex Johnson',
    dunningPlan: 'Standard',
    lastContacted: formatDate(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)),
    createdDate: formatDate(new Date(today.getTime() - 125 * 24 * 60 * 60 * 1000)),
    auditTrail: [],
    externalId: 'qb_inv_126',
  },
  {
    id: uuidv4(),
    clientName: 'Nova Digital',
    amount: 1250.25,
    dueDate: formatDate(new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)),
    status: 'Completed',
    assignee: 'Maria Garcia',
    dunningPlan: 'Standard',
    lastContacted: formatDate(new Date(today.getTime() - 65 * 24 * 60 * 60 * 1000)),
    paymentDate: formatDate(new Date(today.getTime() - 58 * 24 * 60 * 60 * 1000)),
    createdDate: formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)),
    auditTrail: [],
    externalId: 'qb_inv_127',
  },
];