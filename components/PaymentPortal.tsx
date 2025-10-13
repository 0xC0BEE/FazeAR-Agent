import React, { useState, useEffect } from 'react';
import type { Workflow } from '../types';
import { StripeIcon } from './icons/StripeIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface PaymentPortalProps {
    workflows: Workflow[];
    onPay: (workflowId: string) => void;
}

export const PaymentPortal: React.FC<PaymentPortalProps> = ({ workflows, onPay }) => {
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [isPaid, setIsPaid] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const workflowId = params.get('workflowId');
        if (workflowId) {
            const foundWorkflow = workflows.find(w => w.id === workflowId);
            if (foundWorkflow) {
                setWorkflow(foundWorkflow);
                if(foundWorkflow.status === 'Completed') {
                    setIsPaid(true);
                }
            } else {
                setError("Invoice not found. The link may be invalid or expired.");
            }
        } else {
            setError("No invoice specified. Please use the link provided in your email.");
        }
    }, [workflows]);
    
    const handlePay = () => {
        if (workflow && !isPaid) {
            onPay(workflow.id);
            setIsPaid(true);
        }
    };

    const getStatusChip = (status: Workflow['status']) => {
        if (isPaid) status = 'Completed';
        switch (status) {
            case 'Completed': return <div className="text-sm font-semibold px-3 py-1 rounded-full text-green-800 bg-green-100">Paid</div>;
            case 'Overdue': return <div className="text-sm font-semibold px-3 py-1 rounded-full text-red-800 bg-red-100">Overdue</div>;
            default: return <div className="text-sm font-semibold px-3 py-1 rounded-full text-blue-800 bg-blue-100">In Progress</div>;
        }
    };
    
    return (
        <div className="bg-slate-100 min-h-screen font-sans flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">FazeAR Secure Payment</h1>
                    <p className="text-slate-500">A simple and secure way to pay your invoices.</p>
                </header>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                
                {workflow && !error && (
                    <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                        <div className="p-6 md:p-8">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{workflow.clientName}</h2>
                                    <p className="text-slate-500 text-sm">Invoice ID: ...{workflow.id.slice(-12)}</p>
                                </div>
                                {getStatusChip(workflow.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                                <div className="bg-slate-50 p-4 rounded-md">
                                    <p className="text-slate-500 font-semibold">Due Date</p>
                                    <p className="text-slate-800 font-bold">{new Date(workflow.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-md text-right">
                                    <p className="text-slate-500 font-semibold">Amount Due</p>
                                    <p className="text-slate-800 font-bold text-2xl">${workflow.amount.toLocaleString()}</p>
                                </div>
                            </div>

                            {isPaid ? (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center gap-3" role="alert">
                                    <CheckCircleIcon className="w-8 h-8 flex-shrink-0"/>
                                    <div>
                                        <p className="font-bold">Payment Complete!</p>
                                        <p className="text-sm">Thank you for your payment. A confirmation has been sent to your accounts team.</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <button 
                                        onClick={handlePay}
                                        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
                                    >
                                        <CreditCardIcon className="w-6 h-6"/>
                                        Pay ${workflow.amount.toLocaleString()} Now
                                    </button>
                                     <p className="text-xs text-slate-400 mt-4 text-center flex items-center justify-center gap-2">
                                        Powered by <StripeIcon className="w-14 h-auto" />
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                 <footer className="text-center mt-8">
                    <p className="text-sm text-slate-400">
                        Need help? Contact our support team at <a href="mailto:support@fazear.com" className="text-blue-600 hover:underline">support@fazear.com</a>.
                    </p>
                    <a href="/" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                        &larr; Return to Agent Dashboard
                    </a>
                </footer>
            </div>
        </div>
    );
};
