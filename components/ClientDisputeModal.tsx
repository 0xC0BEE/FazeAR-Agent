import React, { useState } from 'react';
import type { Workflow } from '../types.ts';
import { ExclamationIcon } from './icons/ExclamationIcon.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from './ui/Dialog.tsx';
import { Button } from './ui/Button.tsx';
import { Label } from './ui/Label.tsx';

interface ClientDisputeModalProps {
  invoice: Workflow;
  onClose: () => void;
  onSubmit: (workflowId: string, reason: string) => void;
}

export const ClientDisputeModal: React.FC<ClientDisputeModalProps> = ({ invoice, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onSubmit(invoice.id, reason.trim());
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
             <div className="flex items-center gap-2">
                <ExclamationIcon className="w-6 h-6 text-amber-400"/>
                Submit a Dispute
             </div>
          </DialogTitle>
          <DialogDescription>
             You are submitting a dispute for invoice <span className="font-mono text-foreground">{invoice.externalId}</span> for <span className="font-semibold text-foreground">${invoice.amount.toLocaleString()}</span>. Please provide a clear reason below so our team can investigate.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
             <div>
                <Label htmlFor="disputeReason" className="mb-1">
                    Reason for Dispute
                </Label>
                 <textarea
                    id="disputeReason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="e.g., I was overcharged, I did not receive these goods, etc."
                    className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm"
                />
            </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
                onClick={handleConfirm}
                disabled={!reason.trim()}
                variant="destructive"
                className="bg-amber-600 hover:bg-amber-700"
            >
                Submit Dispute
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};