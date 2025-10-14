
import React from 'react';
import type { Workflow, User, DunningPlan } from '../types';
import { WorkflowTracker } from './WorkflowTracker';
import { InspectorPanel } from './InspectorPanel';
import { ChatInterface } from './ChatInterface';
import { MetricCard } from './MetricCard';
import { DollarIcon } from './icons/DollarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { WebhookListener } from './WebhookListener';
import { CashAppPanel } from './CashAppPanel';

interface DashboardProps {
  workflows: Workflow[];
  currentUser: User;
  selectedWorkflowId: string | null;
  onSelectWorkflow: (workflowId: string) => void;
  onUpdateWorkflows: (updatedWorkflows: Workflow[]) => void;
  isAutonomousMode: boolean;
  dunningPlans: DunningPlan[];
  onPaymentReceived: (workflowId: string) => void;
  onNewInvoice: (invoiceData: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  workflows,
  currentUser,
  selectedWorkflowId,
  onSelectWorkflow,
  onUpdateWorkflows,
  isAutonomousMode,
  dunningPlans,
  onPaymentReceived,
  onNewInvoice,
}) => {
  const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId) || null;

  // Calculate metrics
  const outstandingWorkflows = workflows.filter(w => w.status !== 'Completed');
  const totalOutstanding = outstandingWorkflows.reduce((sum, w) => sum + w.amount, 0);
  const overdueWorkflows = workflows.filter(w => w.status === 'Overdue');
  const totalOverdue = overdueWorkflows.reduce((sum, w) => sum + w.amount, 0);

  const daysOverdue = overdueWorkflows.map(w => {
    const dueDate = new Date(w.dueDate);
    const today = new Date();
    // Adjust for timezone to avoid off-by-one day errors
    const due = new Date(Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()));
    const now = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    const timeDiff = now.getTime() - due.getTime();
    return Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
  });

  const avgDaysOverdue = daysOverdue.length > 0
    ? Math.round(daysOverdue.reduce((a, b) => a + b, 0) / daysOverdue.length)
    : 0;

  return (
    <main className="flex flex-col gap-6 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Outstanding AR"
          value={`$${(totalOutstanding / 1000).toFixed(1)}k`}
          icon={<DollarIcon className="w-8 h-8 text-blue-400" />}
          tooltip={`Total Amount: $${totalOutstanding.toLocaleString()}`}
        />
        <MetricCard
          title="Total Overdue AR"
          value={`$${(totalOverdue / 1000).toFixed(1)}k`}
          icon={<ClockIcon className="w-8 h-8 text-red-400" />}
          tooltip={`Total Amount: $${totalOverdue.toLocaleString()}`}
        />
        <MetricCard
          title="Overdue Invoices"
          value={overdueWorkflows.length.toString()}
          icon={<CheckCircleIcon className="w-8 h-8 text-yellow-400" />}
          tooltip={`${overdueWorkflows.length} invoices are past their due date.`}
        />
         <MetricCard
          title="Avg. Days Overdue"
          value={`${avgDaysOverdue} days`}
          icon={<ClockIcon className="w-8 h-8 text-orange-400" />}
          tooltip={`Average time invoices have been overdue.`}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <WorkflowTracker
            workflows={workflows}
            currentUser={currentUser}
            onSelectWorkflow={onSelectWorkflow}
            selectedWorkflowId={selectedWorkflowId}
          />
        </div>
        <div className="lg:col-span-5">
            <InspectorPanel
                workflow={selectedWorkflow}
                dunningPlans={dunningPlans}
                workflows={workflows}
                onUpdateWorkflows={onUpdateWorkflows}
                currentUser={currentUser}
                isAutonomousMode={isAutonomousMode}
            />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          {currentUser.role !== 'Collector' ? (
              <ChatInterface
                workflows={workflows}
                currentUser={currentUser}
                dunningPlans={dunningPlans}
                selectedWorkflow={selectedWorkflow}
              />
          ) : (
            <div className="h-full flex flex-col gap-6">
                <CashAppPanel workflows={workflows} onUpdateWorkflows={onUpdateWorkflows} />
                <WebhookListener workflows={workflows} onPaymentReceived={onPaymentReceived} onNewInvoice={onNewInvoice} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
