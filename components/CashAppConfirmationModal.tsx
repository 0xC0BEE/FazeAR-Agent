import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';
import type { Match } from '../types.ts';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter,
    DialogClose
} from './ui/Dialog.tsx';
import { Button } from './ui/Button.tsx';

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
        case 'matched': return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Matched</span>;
        case 'partial': return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Partial Match</span>;
        default: return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive/10 text-destructive">Unmatched</span>;
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
             <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-6 h-6 text-green-500"/>
                <span>Confirm Payment Matches</span>
             </div>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <div className="bg-muted p-3 rounded-lg mb-4 flex justify-around text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <p className="text-xl font-bold text-foreground">{matches.length}</p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-bold text-foreground">${totalAmount.toLocaleString()}</p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Workflows Matched</p>
                    <p className="text-xl font-bold text-green-500">{matchedCount}</p>
                </div>
            </div>
            <div className="max-h-[40vh] overflow-y-auto pr-2">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase sticky top-0 bg-card">
                        <tr>
                            <th className="px-4 py-2">Client Name</th>
                            <th className="px-4 py-2">Invoice Ref.</th>
                            <th className="px-4 py-2 text-right">Amount Paid</th>
                            <th className="px-4 py-2 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((match, index) => (
                            <tr key={index} className="border-b border-border last:border-b-0">
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
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
                onClick={() => onConfirm(matches)}
                className="bg-green-600 hover:bg-green-700"
            >
                Confirm & Apply {matchedCount} Payments
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};