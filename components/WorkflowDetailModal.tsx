
import React from 'react';
import type { Workflow } from '../types';
import { XIcon } from './icons/XIcon';

interface WorkflowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
}

// Note: This component is created to resolve file errors but is not currently used in the main application flow.
// The InspectorPanel component serves a similar purpose within the dashboard layout.
export const WorkflowDetailModal: React.FC<WorkflowDetailModalProps> = ({ isOpen, onClose, workflow }) => {
  if (!isOpen || !workflow) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4 border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Details for {workflow.clientName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-slate-300">ID: {workflow.id}</p>
          <p className="text-slate-300">Amount: ${workflow.amount.toLocaleString()}</p>
          <p className="text-slate-300">Due Date: {workflow.dueDate}</p>
          <p className="text-slate-300">Status: {workflow.status}</p>
        </div>
      </div>
    </div>
  );
};
