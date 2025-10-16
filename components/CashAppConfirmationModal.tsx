
import React from 'react';
import { XIcon } from './icons/XIcon.tsx';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';

interface Match {
  clientName: string;
  invoiceId: string;
  amountPaid: number;
  workflowId: string | null;
  status: 'matched' | 'partial' | 'unmatched';
}

interface CashAppConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  onConfirm: (matches: Match[]) => void;
}

export const CashAppConfirmationModal: React.FC<CashAppConfirmationModalProps> = ({ isOpen, onClose, matches, onConfirm }) => {
  if (!isOpen) return null;
  
  const matchedCount = matches.filter(m => m.status === 'matched').length;
  const totalAmount = matches.reduce((sum, m) => sum + m.amountPaid, 0);

  const getStatusChip = (status: Match['status']) => {
      switch (status) {
        case 'matched': return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-200 text-green-800">Matched</span>;
        case 'partial': return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800">Partial Match</span>;
        default: return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-200 text-red-800">Unmatched</span>;
      }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl m-4 border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-400"/>
            <h2 className="text-lg font-semibold text-white">Confirm Payment Matches</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
            <div className="bg-slate-900/50 p-3 rounded-lg mb-4 flex justify-around text-center">
                <div>
                    <p className="text-sm text-slate-400">Total Payments</p>
                    <p className="text-xl font-bold text-white">{matches.length}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-400">Total Amount</p>
                    <p className="text-xl font-bold text-white">${totalAmount.toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-400">Workflows Matched</p>
                    <p className="text-xl font-bold text-green-400">{matchedCount}</p>
                </div>
            </div>
            <div className="max-h-[40vh] overflow-y-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2">Client Name</th>
                            <th className="px-4 py-2">Invoice Ref.</th>
                            <th className="px-4 py-2 text-right">Amount Paid</th>
                            <th className="px-4 py-2 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((match, index) => (
                            <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                                <td className="px-4 py-3">{match.clientName}</td>
                                <td className="px-4 py-3 font-mono text-xs">{match.invoiceId}</td>
                                <td className="px-4 py-3 text-right font-mono">${match.amountPaid.toLocaleString()}</td>
                                <td className="px-4 py-3 text-center">{getStatusChip(match.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right space-x-2">
            <button 
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={() => onConfirm(matches)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors"
            >
                Confirm & Apply {matchedCount} Payments
            </button>
        </div>
      </div>
    </div>
  );
};