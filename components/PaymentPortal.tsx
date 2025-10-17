
import React, { useState } from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { User, Workflow } from '../types.ts';
import { CreditCardIcon } from './icons/CreditCardIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';
import { XIcon } from './icons/XIcon.tsx';

interface PaymentPortalProps {
    user: User;
    workflows: Workflow[];
}

const PaymentModal: React.FC<{ invoice: Workflow, onClose: () => void, onSuccess: () => void }> = ({ invoice, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onSuccess();
        }, 1500);
    };
    
    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">Pay Invoice {invoice.externalId}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-400">You are paying <span className="font-bold text-white">${invoice.amount.toLocaleString()}</span> for invoice <span className="font-mono text-white">{invoice.externalId}</span> due on <span className="text-white">{new Date(invoice.dueDate).toLocaleDateString()}</span>.</p>
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Card Details</label>
                            <div className="p-3 bg-slate-900 border border-slate-600 rounded-lg">
                               <p className="text-sm text-slate-500">Placeholder for a secure card element (e.g., Stripe).</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right">
                         <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors hover:bg-blue-700 disabled:bg-slate-600 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <CreditCardIcon className="w-5 h-5" />}
                            Confirm Payment of ${invoice.amount.toLocaleString()}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const PaymentPortal: React.FC<PaymentPortalProps> = ({ user, workflows }) => {
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [payingInvoice, setPayingInvoice] = useState<Workflow | null>(null);

    const openInvoices = workflows.filter(w => w.status !== 'Completed');
    const closedInvoices = workflows.filter(w => w.status === 'Completed');
    const totalDue = openInvoices.reduce((sum, w) => sum + w.amount, 0);

    const handlePaymentSuccess = () => {
        setPayingInvoice(null);
        setPaymentSuccess(true);
        setTimeout(() => setPaymentSuccess(false), 4000); // Reset after a few seconds
    }
    
    const getStatusChip = (status: Workflow['status']) => {
        if (status === 'Completed') return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-200 text-green-800">Paid</span>;
        if (status === 'Overdue') return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-200 text-red-800">Overdue</span>;
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-200 text-blue-800">In Progress</span>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Welcome, {user.name}!</h2>
                <p className="text-slate-400">This is your secure portal to view and pay invoices for {user.clientName}.</p>
            </div>
            
            {paymentSuccess && (
                <div className="bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6"/>
                    <p className="font-semibold">Payment successful! Your records will be updated shortly.</p>
                </div>
            )}

            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-white">Outstanding Invoices</h3>
                    <p className="text-slate-400">You have <span className="font-bold text-white">{openInvoices.length}</span> open invoices with a total balance of <span className="font-bold text-white">${totalDue.toLocaleString()}</span>.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3">Invoice #</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {openInvoices.map(invoice => (
                                <tr key={invoice.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-mono">{invoice.externalId}</td>
                                    <td className="px-6 py-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right font-mono">${invoice.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">{getStatusChip(invoice.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setPayingInvoice(invoice)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1 rounded-md transition-colors"
                                        >
                                            Pay
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {openInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-400 italic">
                                        You have no outstanding invoices.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice History */}
            <div className="mt-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-white">Invoice History</h3>
                    <p className="text-slate-400">Showing your most recently paid invoices.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                             <tr>
                                <th className="px-6 py-3">Invoice #</th>
                                <th className="px-6 py-3">Payment Date</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                         <tbody>
                            {closedInvoices.slice(0, 5).map(invoice => (
                                <tr key={invoice.id} className="border-b border-slate-700 last:border-b-0">
                                    <td className="px-6 py-4 font-mono">{invoice.externalId}</td>
                                    <td className="px-6 py-4">{invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 text-right font-mono">${invoice.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">{getStatusChip(invoice.status)}</td>
                                </tr>
                            ))}
                            {closedInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-slate-400 italic">
                                        No paid invoices to display.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {payingInvoice && (
                <PaymentModal 
                    invoice={payingInvoice}
                    onClose={() => setPayingInvoice(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};
