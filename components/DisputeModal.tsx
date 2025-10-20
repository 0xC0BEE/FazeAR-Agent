import React, { useState, useEffect } from 'react';
import type { Workflow } from '../types.ts';
import { ExclamationIcon } from './icons/ExclamationIcon.tsx';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter,
    DialogClose
} from './ui/Dialog.tsx';
import { Button } from './ui/Button.tsx';
import { Label } from './ui/Label.tsx';
import { Textarea } from './ui/Textarea.tsx';


interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
  onConfirm: (workflowId: string, reason: string) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, workflow, onConfirm }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !workflow) {
    return null;
  }

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(workflow.id, reason.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
             <div className="flex items-center gap-2">
                <ExclamationIcon className="w-6 h-6 text-amber-500"/>
                <span>Dispute Invoice</span>
             </div>
          </DialogTitle>
          <DialogDescription>
             You are marking invoice <span className="font-mono text-foreground">{workflow.externalId}</span> for <span className="font-semibold text-foreground">{workflow.clientName}</span> as disputed. Please provide a clear reason below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <div>
                <Label htmlFor="disputeReason" className="mb-1">
                    Reason for Dispute
                </Label>
                 <Textarea
                    id="disputeReason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="e.g., Client claims they were overcharged, goods not received, etc."
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
                className="bg-amber-600 hover:bg-amber-700 text-white"
            >
                Confirm Dispute
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
