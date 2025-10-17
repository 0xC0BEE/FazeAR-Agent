import React, { useState } from 'react';
import type { Workflow } from '../types.ts';
import { WebhookIcon } from './icons/WebhookIcon.tsx';
import { v4 as uuidv4 } from 'uuid';
import { MOCK_REMITTANCE_ADVICE } from '../mockData.ts';

interface WebhookListenerProps {
  workflows: Workflow[];
  onSimulateEvent: (type: string, data: any) => void;
}

export const WebhookListener: React.FC<WebhookListenerProps> = ({ workflows, onSimulateEvent }) => {
    const [selectedScenario, setSelectedScenario] = useState('');

    const handleSimulate = () => {
        if (!selectedScenario) {
            alert("Please select a scenario to simulate.");
            return;
        }

        const [type, value] = selectedScenario.split(':');

        switch (type) {
            case 'remittance':
                onSimulateEvent('remittance_advice', { text: MOCK_REMITTANCE_ADVICE });
                break;
            case 'payment':
                const workflowToPay = workflows.find(w => w.externalId === value && w.status !== 'Completed');
                if (workflowToPay) {
                    onSimulateEvent('payment_received', { id: workflowToPay.id });
                } else {
                    alert(`Could not find an active workflow with ID ${value} to pay.`);
                }
                break;
            case 'invoice':
                const randomAmount = Math.floor(Math.random() * (25000 - 2000 + 1)) + 2000;
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 30);
                const newInvoiceData = {
                    clientName: value,
                    amount: randomAmount,
                    dueDate: dueDate.toISOString().split('T')[0],
                    externalId: `qb_${uuidv4().slice(0, 8)}`,
                };
                onSimulateEvent('new_invoice', newInvoiceData);
                break;
            default:
                break;
        }
        setSelectedScenario(''); // Reset after simulation
    };
    
    // Find some active workflows for the scenarios
    const overdueWorkflow = workflows.find(w => w.status === 'Overdue');
    const inProgressWorkflow = workflows.find(w => w.status === 'In Progress');


    return (
        <div className="bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col items-center text-center border border-slate-700">
            <WebhookIcon className="w-8 h-8 text-purple-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">Webhook Listener</h3>
            <p className="text-xs text-slate-400 mb-4">Simulate external events from your connected services.</p>
            <div className="w-full flex gap-2">
                <select 
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="" disabled>Select a scenario...</option>
                    <option value="remittance:email">Complex Remittance Advice (Email)</option>
                    {inProgressWorkflow && <option value={`invoice:${inProgressWorkflow.clientName}`}>New Invoice: {inProgressWorkflow.clientName}</option>}
                    {overdueWorkflow && <option value={`payment:${overdueWorkflow.externalId}`}>Payment Received: {overdueWorkflow.clientName} ({overdueWorkflow.externalId})</option>}
                </select>
                <button
                    onClick={handleSimulate}
                    disabled={!selectedScenario}
                    className="w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-md text-xs transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    Simulate
                </button>
            </div>
        </div>
    );
};