import { v4 as uuidv4 } from 'uuid';
import type { User, Workflow, Settings, DunningPlan, InvoiceItem } from './types.ts';

export const MOCK_USERS: User[] = [
  { id: 'user_1', name: 'Alice (Admin)', role: 'Admin' },
  { id: 'user_2', name: 'Bob (Manager)', role: 'Manager' },
  { id: 'user_3', name: 'Charlie (Collector)', role: 'Collector' },
  { id: 'user_4', name: 'Sarah Lee', role: 'Collector' },
  { id: 'user_5', name: 'John Smith (Client)', role: 'Client', clientName: 'Starlight Enterprises' },
  { id: 'user_6', name: 'Apex Representative (Client)', role: 'Client', clientName: 'Apex Industries' },
  { id: 'user_7', name: 'Innovate Rep (Client)', role: 'Client', clientName: 'Innovate Corp' },
  { id: 'user_8', name: 'Quantum Rep (Client)', role: 'Client', clientName: 'Quantum Dynamics' },
  { id: 'user_9', name: 'Meridian Rep (Client)', role: 'Client', clientName: 'Meridian Group' },
  { id: 'user_10', name: 'Nexus Rep (Client)', role: 'Client', clientName: 'Nexus Solutions' },
];

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const createDate = (daysOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return formatDate(date);
};

const standardDunningPlanId = "plan_standard_v1";

const generateRandomItems = (baseAmount: number): { items: InvoiceItem[], total: number } => {
    const items: InvoiceItem[] = [];
    let remainingAmount = baseAmount;
    
    if (Math.random() > 0.3) { // 70% chance of multiple items
        const numItems = Math.floor(Math.random() * 3) + 2; // 2-4 items
        for (let i = 0; i < numItems - 1; i++) {
            const portion = remainingAmount * (Math.random() * 0.4 + 0.2); // 20-60% of remaining
            const price = Math.floor(portion / 100) * 100 + (Math.random() > 0.5 ? 50 : 0);
            const quantity = 1;
            items.push({
                description: `Service Item #${Math.floor(Math.random() * 1000)}`,
                quantity,
                price
            });
            remainingAmount -= price;
        }
    }
    
    items.push({
        description: `Final Service #${Math.floor(Math.random() * 1000)}`,
        quantity: 1,
        price: remainingAmount
    });

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items, total };
}


const generateWorkflows = (): Workflow[] => {
    const clientNames = ['Quantum Dynamics', 'Starlight Enterprises', 'Innovate Corp', 'Apex Industries', 'Meridian Group', 'Nexus Solutions'];
    const assignees = ['Charlie (Collector)', 'Sarah Lee'];
    const statuses: Workflow['status'][] = ['Overdue', 'In Progress'];
    
    const workflows: Workflow[] = [];

    for (let i = 0; i < 15; i++) {
        const baseAmount = Math.floor(Math.random() * 25000) + 5000;
        const { items, total } = generateRandomItems(baseAmount);
        const dueDateOffset = Math.floor(Math.random() * 90) - 60; // -60 to +30 days from today
        const createdDateOffset = dueDateOffset - (Math.floor(Math.random() * 15) + 30);
        const status = new Date(createDate(dueDateOffset)) < new Date() ? 'Overdue' : 'In Progress';

        workflows.push({
            id: uuidv4(),
            clientName: clientNames[i % clientNames.length],
            amount: total,
            dueDate: createDate(dueDateOffset),
            status: status,
            assignee: assignees[i % assignees.length],
            isAutonomous: Math.random() > 0.5,
            externalId: `qb_${88201 + i}`,
            auditTrail: [{ timestamp: createDate(createdDateOffset), activity: 'Invoice Created', details: 'Generated from QuickBooks integration.' }],
            communications: [],
            dunningPlanId: standardDunningPlanId,
            disputeStatus: null,
            disputeReason: null,
            createdDate: createDate(createdDateOffset),
            paymentDate: null,
            items: items,
        });
    }

    // Add specific cases
    workflows[3].disputeStatus = 'New';
    workflows[3].disputeReason = "Client claims goods were not received.";
    workflows[3].status = 'Overdue';

    workflows.push({
        id: 'workflow_completed_1',
        clientName: 'Starlight Enterprises',
        amount: 4500.00,
        dueDate: createDate(-35),
        status: 'Completed',
        assignee: 'Sarah Lee',
        isAutonomous: false,
        externalId: 'qb_88199',
        auditTrail: [],
        communications: [],
        dunningPlanId: null,
        disputeStatus: null,
        disputeReason: null,
        createdDate: createDate(-65),
        paymentDate: createDate(-20),
        items: [{ description: 'Consulting Services', quantity: 1, price: 4500.00 }]
    });

    return workflows;
}

export const MOCK_WORKFLOWS: Workflow[] = generateWorkflows();

const standardDunningPlan: DunningPlan = {
    id: standardDunningPlanId,
    name: 'Standard Follow-up',
    steps: [
        { id: uuidv4(), day: 1, template: 'First Reminder' },
        { id: uuidv4(), day: 7, template: 'Second Reminder' },
        { id: uuidv4(), day: 15, template: 'Final Notice' },
        { id: uuidv4(), day: 30, template: 'Escalation to Manager' },
    ]
};

const aggressiveDunningPlan: DunningPlan = {
    id: "plan_aggressive_v1",
    name: 'Aggressive Follow-up',
    steps: [
        { id: uuidv4(), day: 1, template: 'Immediate Overdue Notice' },
        { id: uuidv4(), day: 3, template: 'Call Reminder' },
        { id: uuidv4(), day: 7, template: 'Demand Letter' },
    ]
};


export const MOCK_SETTINGS: Settings = {
    dunningPlans: [standardDunningPlan, aggressiveDunningPlan],
    integrations: [
        { id: 'quickbooks', name: 'QuickBooks', description: 'Sync invoices, customers, and payments automatically from your QuickBooks Online account.', connected: true },
        { id: 'stripe', name: 'Stripe', description: 'Enable clients to pay invoices directly via a secure portal using credit card or ACH.', connected: true },
        { id: 'gmail', name: 'Gmail', description: 'Connect your inbox to send emails directly and parse incoming remittance advice.', connected: false },
    ]
};

export const MOCK_REMITTANCE_ADVICE = `
Hi Team,

Please see attached remittance for payments processed today, 07/26/2024.

Vendor: Innovate Corp
Payment Ref: 9901-BXI-23
Total Amount: $22,750.00

Invoice Number: qb_88203
Amount: 22750.00

---
Also processing payment for Quantum.

*Invoice qb_88201, $15,200.50*

Let me know if you have questions.

Thanks,
Jane Doe
Accounts Payable
`;