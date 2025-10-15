
import React, { useState } from 'react';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

// Note: This is a standalone UI component for demonstration purposes.
// It is not connected to the main application's state.
export const PaymentPortal: React.FC = () => {
    const [invoiceId, setInvoiceId] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setPaymentSuccess(true);
        }, 2000);
    };

    if (paymentSuccess) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-slate-400">Thank you for your payment. A confirmation has been sent to your email.</p>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Make a Payment</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="invoiceId" className="block text-sm font-medium text-slate-300 mb-1">Invoice Number</label>
                        <input
                            type="text"
                            id="invoiceId"
                            value={invoiceId}
                            onChange={(e) => setInvoiceId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">Amount</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Card Details</label>
                        <div className="p-3 bg-slate-900 border border-slate-600 rounded-lg">
                           <p className="text-sm text-slate-500">Placeholder for a secure card element (e.g., Stripe or Braintree).</p>
                        </div>
                    </div>
                </div>
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors hover:bg-blue-700 disabled:bg-slate-600 flex items-center justify-center gap-2"
                >
                    {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <CreditCardIcon className="w-5 h-5" />}
                    Pay ${amount || '0.00'}
                </button>
            </form>
        </div>
    );
};
