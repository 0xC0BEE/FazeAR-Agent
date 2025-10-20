import React, { useState } from 'react';
import type { User, Workflow } from '../types.ts';
import { CreditCardIcon } from './icons/CreditCardIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';
import { ClientDisputeModal } from './ClientDisputeModal.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/Dialog.tsx';
import { Button } from './ui/Button.tsx';

interface PaymentPortalProps {
    user: User;
    workflows: Workflow[];
    onDispute: (workflowId: string, reason: string, clientName: string) => void;
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
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pay Invoice {invoice.externalId}</DialogTitle>
                     <DialogDescription>
                        You are paying <span className="font-bold text-foreground">${invoice.amount.toLocaleString()}</span> for invoice <span className="font-mono text-foreground">{invoice.externalId}</span> due on <span className="text-foreground">{new Date(invoice.dueDate).toLocaleDateString()}</span>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                         <label className="block text-sm font-medium text-foreground mb-1">Card Details</label>
                        <div className="p-3 bg-muted border rounded-lg">
                           <p className="text-sm text-muted-foreground">Placeholder for a secure card element (e.g., Stripe).</p>
                        </div>
                    </div>
                    <DialogFooter>
                         <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <CreditCardIcon className="w-5 h-5" />}
                            <span className="ml-2">Confirm Payment of ${invoice.amount.toLocaleString()}</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export const PaymentPortal: React.FC<PaymentPortalProps> = ({ user, workflows, onDispute }) => {
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [disputeSuccess, setDisputeSuccess] = useState(false);
    const [payingInvoice, setPayingInvoice] = useState<Workflow | null>(null);
    const [disputingInvoice, setDisputingInvoice] = useState<Workflow | null>(null);

    const openInvoices = workflows.filter(w => w.status !== 'Completed');
    const closedInvoices = workflows.filter(w => w.status === 'Completed');
    const totalDue = openInvoices.reduce((sum, w) => sum + w.amount, 0);

    const handlePaymentSuccess = () => {
        setPayingInvoice(null);
        setPaymentSuccess(true);
        setTimeout(() => setPaymentSuccess(false), 4000); // Reset after a few seconds
    }

    const handleDisputeSubmit = (workflowId: string, reason: string) => {
        if (user.clientName) {
            onDispute(workflowId, reason, user.clientName);
            setDisputingInvoice(null);
            setDisputeSuccess(true);
            setTimeout(() => setDisputeSuccess(false), 4000);
        }
    };
    
    const getStatusChip = (status: Workflow['status']) => {
        if (status === 'Completed') return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Paid</span>;
        if (status === 'Disputed') return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Disputed</span>;
        if (status === 'Overdue') return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive/10 text-destructive">Overdue</span>;
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">In Progress</span>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-lg p-6 border mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-1">Welcome, {user.name}!</h2>
                <p className="text-muted-foreground">This is your secure portal to view and pay invoices for {user.clientName}.</p>
            </div>
            
            {paymentSuccess && (
                <div className="bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6"/>
                    <p className="font-semibold">Payment successful! Your records will be updated shortly.</p>
                </div>
            )}

            {disputeSuccess && (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg mb-6 flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6"/>
                    <p className="font-semibold">Dispute submitted successfully. Our team will review it shortly.</p>
                </div>
            )}

            <div className="bg-card rounded-lg shadow-lg border">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground">Outstanding Invoices</h3>
                    <p className="text-muted-foreground">You have <span className="font-bold text-foreground">{openInvoices.length}</span> open invoices with a total balance of <span className="font-bold text-foreground">${totalDue.toLocaleString()}</span>.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-3">Invoice #</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="text-foreground">
                            {openInvoices.map(invoice => (
                                <tr key={invoice.id} className="border-b border-border last:border-b-0">
                                    <td className="px-6 py-4 font-mono">{invoice.externalId}</td>
                                    <td className="px-6 py-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right font-mono">${invoice.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">{getStatusChip(invoice.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {invoice.status !== 'Disputed' ? (
                                            <div className="flex gap-2 justify-end">
                                                <Button 
                                                    onClick={() => setDisputingInvoice(invoice)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-300"
                                                >
                                                    Dispute
                                                </Button>
                                                <Button 
                                                    onClick={() => setPayingInvoice(invoice)}
                                                    size="sm"
                                                >
                                                    Pay
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs italic text-muted-foreground">Under Review</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                             {openInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-muted-foreground italic">
                                        You have no outstanding invoices.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice History */}
            <div className="mt-6 bg-card rounded-lg shadow-lg border">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground">Invoice History</h3>
                    <p className="text-muted-foreground">Showing your most recently paid invoices.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                             <tr>
                                <th className="px-6 py-3">Invoice #</th>
                                <th className="px-6 py-3">Payment Date</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                         <tbody className="text-foreground">
                            {closedInvoices.slice(0, 5).map(invoice => (
                                <tr key={invoice.id} className="border-b border-border last:border-b-0">
                                    <td className="px-6 py-4 font-mono">{invoice.externalId}</td>
                                    <td className="px-6 py-4">{invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 text-right font-mono">${invoice.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">{getStatusChip(invoice.status)}</td>
                                </tr>
                            ))}
                            {closedInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-muted-foreground italic">
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
             {disputingInvoice && (
                <ClientDisputeModal
                    invoice={disputingInvoice}
                    onClose={() => setDisputingInvoice(null)}
                    onSubmit={handleDisputeSubmit}
                />
            )}
        </div>
    );
};