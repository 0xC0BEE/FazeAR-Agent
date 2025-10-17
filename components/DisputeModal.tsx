import React, { useState, useEffect } from 'react';
import type { Workflow } from '../types';
import { XIcon } from './icons/XIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4 border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2">
            <ExclamationIcon className="w-6 h-6 text-amber-400"/>
            <h2 className="text-lg font-semibold text-white">Dispute Invoice</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
            <p className="text-sm text-slate-400 mb-4">You are marking invoice <span className="font-mono text-white">{workflow.externalId}</span> for <span className="font-semibold text-white">{workflow.clientName}</span> as disputed. Please provide a clear reason below.</p>
            <div>
                <label htmlFor="disputeReason" className="block text-sm font-medium text-slate-300 mb-1">
                    Reason for Dispute
                </label>
                 <textarea
                    id="disputeReason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="e.g., Client claims they were overcharged, goods not received, etc."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
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
                onClick={handleConfirm}
                disabled={!reason.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors disabled:bg-slate-600"
            >
                Confirm Dispute
            </button>
        </div>
      </div>
    </div>
  );
};