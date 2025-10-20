import React from 'react';
import type { Workflow, DisputeStatus } from '../types.ts';
import { ExclamationIcon } from './icons/ExclamationIcon.tsx';

interface DisputesHubProps {
  disputedWorkflows: Workflow[];
  onUpdateDisputeStatus: (workflowId: string, newStatus: DisputeStatus) => void;
  onOpenDispute: (workflow: Workflow) => void;
}

const DisputeCard: React.FC<{ workflow: Workflow, onOpen: () => void }> = ({ workflow, onOpen }) => {
    return (
        <div className="bg-card p-3 rounded-lg border shadow-sm cursor-pointer hover:bg-accent" onClick={onOpen}>
            <h4 className="font-semibold text-card-foreground text-sm">{workflow.clientName}</h4>
            <p className="text-xs text-muted-foreground font-mono mt-1">#{workflow.externalId} - ${workflow.amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">"{workflow.disputeReason}"</p>
        </div>
    );
};

const DisputeColumn: React.FC<{ title: string; workflows: Workflow[]; children: React.ReactNode }> = ({ title, workflows, children }) => {
    return (
        <div className="w-full sm:w-1/2 md:w-1/4 flex-shrink-0 flex flex-col bg-muted/50 rounded-lg p-3">
            <h3 className="font-semibold text-sm text-foreground mb-3 px-1">{title} ({workflows.length})</h3>
            <div className="space-y-3 h-full overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export const DisputesHub: React.FC<DisputesHubProps> = ({ disputedWorkflows, onOpenDispute }) => {
    
    const columns: { status: DisputeStatus, title: string }[] = [
        { status: 'New', title: 'New Disputes' },
        { status: 'Under Review', title: 'Under Review' },
        { status: 'Resolution Proposed', title: 'Resolution Proposed' },
        { status: 'Resolved', title: 'Resolved' },
    ];

    const workflowsByStatus = (status: DisputeStatus) => disputedWorkflows.filter(w => w.disputeStatus === status);

    if (disputedWorkflows.length === 0) {
        return (
             <div className="flex flex-col h-full bg-card rounded-lg shadow-lg border items-center justify-center text-center p-6">
                <ExclamationIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-card-foreground">Disputes Hub</h3>
                <p className="text-sm text-muted-foreground">No active disputes. Disputed invoices will appear here.</p>
            </div>
        )
    }

  return (
    <div className="h-full flex flex-col">
        <div className="pb-4">
            <h2 className="text-2xl font-bold text-foreground">Disputes Hub</h2>
            <p className="text-muted-foreground">Manage and resolve client invoice disputes.</p>
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-x-auto">
            {columns.map(col => (
                <div key={col.status} className="w-full sm:w-1/2 md:w-1/4 flex-shrink-0 border-r border-border last:border-r-0 pr-4 last:pr-0">
                    <DisputeColumn title={col.title} workflows={workflowsByStatus(col.status)}>
                        {workflowsByStatus(col.status).map(wf => (
                            <DisputeCard key={wf.id} workflow={wf} onOpen={() => onOpenDispute(wf)} />
                        ))}
                    </DisputeColumn>
                </div>
            ))}
        </div>
    </div>
  );
};