import React from 'react';
import type { Workflow } from '../types.ts';
import { WebhookIcon } from './icons/WebhookIcon.tsx';
import { v4 as uuidv4 } from 'uuid';

interface WebhookListenerProps {
  workflows: Workflow[];
  onPaymentReceived: (workflowId: string) => void;
  onNewInvoice: (invoiceData: object) => void;
}

export const WebhookListener: React.FC<WebhookListenerProps> = ({ workflows, onPaymentReceived, onNewInvoice }) => {
    const handleSimulatePayment = () => {
        const inProgressWorkflow = workflows.find(w => w.status === 'In Progress' || w.status === 'Overdue');
        if (inProgressWorkflow) {
            onPaymentReceived(inProgressWorkflow.id);
        } else {
            alert("No 'In Progress' or 'Overdue' workflow found to simulate payment for.");
        }
    };

    const handleSimulateNewInvoice = () => {
        const randomAmount = Math.floor(Math.random() * (25000 - 2000 + 1)) + 2000;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        
        const newInvoiceData = {
            clientName: 'Starlight Enterprises',
            amount: randomAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            externalId: `qb_${uuidv4()}`,
        };
        onNewInvoice(newInvoiceData);
    };

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col items-center text-center border border-slate-700">
            <WebhookIcon className="w-8 h-8 text-purple-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">Webhook Listener</h3>
            <p className="text-xs text-slate-400 mb-4">Simulate external events from your connected services.</p>
            <div className="w-full space-y-2">
                <button
                    onClick={handleSimulateNewInvoice}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-1.5 rounded-md text-xs transition-colors"
                >
                    Simulate New Invoice from QuickBooks
                </button>
                <button
                    onClick={handleSimulatePayment}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-md text-xs transition-colors"
                >
                    Simulate Payment Received from Stripe
                </button>
            </div>
        </div>
    );
};