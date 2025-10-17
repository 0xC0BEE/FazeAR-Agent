import { v4 as uuidv4 } from 'uuid';
import type { User, Workflow, Settings } from './types.ts';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alex Johnson', role: 'Admin' },
  { id: '2', name: 'Maria Garcia', role: 'Manager' },
  { id: '3', name: 'David Chen', role: 'Collector' },
  { id: '4', name: 'Sarah Lee', role: 'Collector' },
  { id: '5', name: 'John Smith', role: 'Client', clientName: 'Quantum Dynamics' },
];

const generateWorkflows = (): Workflow[] => {
    const assignees = ['David Chen', 'Sarah Lee', 'Maria Garcia'];
    const clients = ['Innovate Corp', 'Nexus Solutions', 'Quantum Dynamics', 'Starlight Enterprises', 'Apex Industries', 'Momentum Labs'];
    const plans = ['Standard Net 30', 'Aggressive', 'Gentle Reminder'];
    
    let workflows: Workflow[] = [];

    for (let i = 0; i < 25; i++) {
        const createDateOffset = Math.floor(Math.random() * 90);
        const createdDate = new Date(today.getTime() - createDateOffset * 24 * 60 * 60 * 1000);
        const dueDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const isOverdue = today > dueDate;
        const isCompleted = Math.random() > 0.7;
        
        let status: 'Overdue' | 'In Progress' | 'Completed' = 'In Progress';
        if (isCompleted) {
            status = 'Completed';
        } else if (isOverdue) {
            status = 'Overdue';
        }

        workflows.push({
            id: `wf_${uuidv4()}`,
            clientName: clients[i % clients.length],
            amount: Math.floor(Math.random() * (25000 - 1000 + 1)) + 1000,
            dueDate: formatDate(dueDate),
            status: status,
            assignee: assignees[i % assignees.length],
            auditTrail: [
                { timestamp: new Date(createdDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Invoice Created', details: 'Automatically generated via QuickBooks integration.' },
                ...(status === 'Overdue' ? [{ timestamp: new Date(dueDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Reminder Sent', details: 'Automated email reminder sent.' }] : []),
                ...(status === 'Completed' ? [{ timestamp: new Date(dueDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Payment Received', details: 'Payment processed via Stripe.' }] : [])
            ],
            externalId: `inv_${1001 + i}`,
            dunningPlan: plans[i % plans.length],
            paymentDate: status === 'Completed' ? formatDate(new Date(dueDate.getTime() - 5 * 24 * 60 * 60 * 1000)) : undefined,
            createdDate: formatDate(createdDate),
            isAutonomous: status === 'Overdue' && Math.random() > 0.5, // Randomly set some overdue invoices to autonomous
        });
    }
    return workflows;
};

export const MOCK_WORKFLOWS: Workflow[] = generateWorkflows();

export const MOCK_SETTINGS: Settings = {
  dunningPlans: [
    {
      id: 'plan1',
      name: 'Standard Net 30',
      steps: [
        { id: 's1', day: 1, template: 'First Reminder' },
        { id: 's2', day: 7, template: 'Second Reminder' },
        { id: 's3', day: 15, template: 'Final Notice' },
      ],
    },
    {
      id: 'plan2',
      name: 'Aggressive',
      steps: [
        { id: 's4', day: 1, template: 'Immediate Follow-up' },
        { id: 's5', day: 3, template: 'Second Follow-up' },
        { id: 's6', day: 5, template: 'Escalation Notice' },
      ],
    },
     {
      id: 'plan3',
      name: 'Gentle Reminder',
      steps: [
        { id: 's7', day: 3, template: 'Friendly Reminder' },
        { id: 's8', day: 14, template: 'Gentle Follow-up' },
      ],
    },
  ],
  integrations: [
    { id: 'quickbooks', name: 'QuickBooks', connected: true, description: 'Automatically sync invoices, customers, and payments from your QuickBooks Online account.' },
    { id: 'stripe', name: 'Stripe', connected: true, description: 'Connect your Stripe account to sync payment statuses and enable the client payment portal.' },
    { id: 'gmail', name: 'Gmail', connected: false, description: 'Allow the FazeAR agent to send automated reminders and communications directly from your email.' },
  ],
};

export const MOCK_REMITTANCE_ADVICE = `
From: accounting@innovatecorp.com
Subject: Payment Advice

Hi Team,

Please see attached remittance for our latest wire transfer.

- Invoice inv_1001, Amount: $12550.00 (Innovate Corp)
- Inv # inv_1004, Paid: $8300 (For Starlight)
- Apex Industries payment for inv_1005 for 21000 dollars

Thanks,
John @ Innovate
`;