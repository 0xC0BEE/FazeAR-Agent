import React from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Workflow, DisputeStatus } from '../types.ts';
import { ExclamationIcon } from './icons/ExclamationIcon.tsx';
import { DollarIcon } from './icons/DollarIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { CalendarIcon } from './icons/CalendarIcon.tsx';

interface DisputesHubProps {
  disputedWorkflows: Workflow[];
  onUpdateDisputeStatus: (workflowId: string, newStatus: DisputeStatus) => void;
  onOpenDispute: (workflow: Workflow) => void;
}

const DisputeCard: React.FC<{ workflow: Workflow }> = ({ workflow }) => {
    return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-slate-500 cursor-grab active:cursor-grabbing">
            <h4 className="font-bold text-sm text-white">{workflow.clientName}</h4>
            <p className="text-xs text-slate-400 font-mono">{workflow.externalId}</p>
            <div className="mt-2 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2"><DollarIcon className="w-3 h-3 text-slate-500"/><span>${workflow.amount.toLocaleString()}</span></div>
                <div className="flex items-center gap-2"><CalendarIcon className="w-3 h-3 text-slate-500"/><span>Due: {new Date(workflow.dueDate).toLocaleDateString()}</span></div>
                <div className="flex items-center gap-2"><UserIcon className="w-3 h-3 text-slate-500"/><span>{workflow.assignee}</span></div>
            </div>
            <p className="mt-2 text-xs italic text-amber-300 bg-amber-900/50 p-1.5 rounded-md">"{workflow.disputeReason}"</p>
        </div>
    );
};

interface DisputeColumnProps {
    status: DisputeStatus;
    workflows: Workflow[];
    onDrop: (status: DisputeStatus, workflowId: string) => void;
    onOpenDispute: (workflow: Workflow) => void;
}

const DisputeColumn: React.FC<DisputeColumnProps> = ({ status, workflows, onDrop, onOpenDispute }) => {
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-slate-700/50');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-slate-700/50');
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-slate-700/50');
        const workflowId = e.dataTransfer.getData("workflowId");
        onDrop(status, workflowId);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, workflowId: string) => {
        e.dataTransfer.setData("workflowId", workflowId);
    };

    return (
        <div 
            className="flex-1 bg-slate-800/50 rounded-lg p-3 transition-colors"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <h3 className="font-semibold text-slate-300 text-sm mb-3 px-1">{status} ({workflows.length})</h3>
            <div className="space-y-2 h-full">
                {workflows.map(wf => (
                    <div 
                        key={wf.id} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, wf.id)}
                        onClick={() => onOpenDispute(wf)}
                        className="cursor-pointer"
                    >
                        <DisputeCard workflow={wf} />
                    </div>
                ))}
            </div>
        </div>
    );
};


export const DisputesHub: React.FC<DisputesHubProps> = ({ disputedWorkflows, onUpdateDisputeStatus, onOpenDispute }) => {
  const columns: DisputeStatus[] = ['New', 'Under Review', 'Resolution Proposed', 'Resolved'];
  
  const workflowsByStatus = (status: DisputeStatus) => 
    disputedWorkflows.filter(w => w.disputeStatus === status);

  const handleDrop = (newStatus: DisputeStatus, workflowId: string) => {
    const workflow = disputedWorkflows.find(w => w.id === workflowId);
    if (workflow && workflow.disputeStatus !== newStatus) {
        onUpdateDisputeStatus(workflowId, newStatus);
    }
  };

  if (disputedWorkflows.length === 0) {
    return (
        <div className="flex flex-col h-full items-center justify-center text-center p-6 text-slate-400">
            <ExclamationIcon className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No Disputed Invoices</h2>
            <p>When an invoice is marked as disputed, it will appear here for resolution.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6 flex-shrink-0">
          <h2 className="text-3xl font-bold text-white">Disputes Hub</h2>
          <p className="text-slate-400 mt-1">Manage and resolve disputed invoices using the Kanban board.</p>
      </div>
      <div className="flex-grow flex gap-4 overflow-x-auto pb-4">
        {columns.map(status => (
            <DisputeColumn 
                key={status}
                status={status}
                workflows={workflowsByStatus(status)}
                onDrop={handleDrop}
                onOpenDispute={onOpenDispute}
            />
        ))}
      </div>
    </div>
  );
};