// Fix: Implemented the Dashboard component to resolve parsing errors due to missing file content.
import React from 'react';
import type { Workflow, User, Message, Draft } from '../types';
import { WorkflowTracker } from './WorkflowTracker';
import { InspectorPanel } from './InspectorPanel';
import { ChatInterface } from './ChatInterface';
import { MetricCard } from './MetricCard';
import { DollarIcon } from './icons/DollarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { CashFlowChart } from './CashFlowChart';
import { WebhookListener } from './WebhookListener';

interface DashboardProps {
    workflows: Workflow[];
    currentUser: User;
    selectedWorkflowId: string | null;
    onSelectWorkflow: (workflowId: string) => void;
    selectedWorkflow: Workflow | null;
    onAddTask: (workflowId: string, taskContent: string) => void;
    onToggleTask: (workflowId: string, taskId: string) => void;
    onAddNote: (workflowId: string, noteContent: string) => void;
    onViewAuditTrail: (workflowId: string) => void;
    messages: Message[];
    onSendMessage: (prompt: string) => void;
    onSendDraft: (draft: Draft) => void;
    onAdjustDraftTone: (draft: Draft, instruction: string) => void;
    onProposeSettlement: (workflowId: string, discount: number) => void;
    scenarioWorkflows: Workflow[] | null;
    onClearScenario: () => void;
    onPaymentReceived: (workflowId: string) => void;
    onNewInvoice: (invoiceData: object) => void;
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
    const { workflows } = props;

    // Calculate metrics
    const totalOutstanding = workflows.filter(w => w.status !== 'Completed').reduce((sum, w) => sum + w.amount, 0);
    const overdueAmount = workflows.filter(w => w.status === 'Overdue').reduce((sum, w) => sum + w.amount, 0);
    const collectedThisMonth = workflows.filter(w => {
        if (w.status !== 'Completed' || !w.paymentDate) return false;
        const paymentDate = new Date(w.paymentDate);
        const today = new Date();
        return paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear();
    }).reduce((sum, w) => sum + w.amount, 0);
    
    const overdueWorkflowsCount = workflows.filter(w => w.status === 'Overdue').length;

    return (
        <main className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <MetricCard 
                    title="Total Outstanding AR" 
                    value={`$${totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<DollarIcon className="w-8 h-8 text-green-400"/>}
                    tooltip="Total amount for all 'In Progress' and 'Overdue' invoices."
                 />
                 <MetricCard 
                    title="Overdue AR" 
                    value={`$${overdueAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<ClockIcon className="w-8 h-8 text-red-400"/>}
                    tooltip="Total amount for all invoices past their due date."
                 />
                 <MetricCard 
                    title="Collected (This Month)" 
                    value={`$${collectedThisMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    icon={<CheckCircleIcon className="w-8 h-8 text-blue-400"/>}
                    tooltip="Total amount collected in the current calendar month."
                 />
                 <MetricCard 
                    title="Workflows Overdue" 
                    value={overdueWorkflowsCount.toString()}
                    icon={<CalendarIcon className="w-8 h-8 text-yellow-400"/>}
                    tooltip="Total number of workflows currently overdue."
                 />
            </div>

            <div>
                <CashFlowChart workflows={workflows} scenarioWorkflows={props.scenarioWorkflows} onClearScenario={props.onClearScenario} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 h-[700px]">
                    <WorkflowTracker 
                        workflows={props.workflows} 
                        currentUser={props.currentUser} 
                        onSelectWorkflow={props.onSelectWorkflow}
                        selectedWorkflowId={props.selectedWorkflowId}
                    />
                </div>
                <div className="lg:col-span-5 h-[700px]">
                    <InspectorPanel 
                        workflow={props.selectedWorkflow}
                        onAddTask={props.onAddTask}
                        onToggleTask={props.onToggleTask}
                        onAddNote={props.onAddNote}
                        onViewAuditTrail={props.onViewAuditTrail}
                        currentUser={props.currentUser}
                        onProposeSettlement={props.onProposeSettlement}
                    />
                </div>
                <div className="lg:col-span-4 h-[700px]">
                    <ChatInterface 
                        messages={props.messages}
                        onSendMessage={props.onSendMessage}
                        onSendDraft={props.onSendDraft}
                        onAdjustDraftTone={props.onAdjustDraftTone}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1">
                 <WebhookListener onPaymentReceived={props.onPaymentReceived} onNewInvoice={props.onNewInvoice} workflows={props.workflows} />
            </div>
        </main>
    );
};
