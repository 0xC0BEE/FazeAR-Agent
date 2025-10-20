import React, { useState, useMemo } from 'react';
import type { Workflow, ChatMessage, User, Tone, Match, Settings } from '../types.ts';
import { WorkflowTracker } from './WorkflowTracker.tsx';
import { ChatInterface } from './ChatInterface.tsx';
import { InspectorPanel } from './InspectorPanel.tsx';

interface DashboardProps {
    workflows: Workflow[];
    currentUser: User;
    messages: ChatMessage[];
    isLoading: boolean;
    settings: Settings;
    onSendMessage: (input: string, tone: Tone) => void;
    onLogCommunication: (messageContent: string, workflow: Workflow) => void;
    onAnalyzeRemittance: (text: string) => Promise<Match[]>;
    onConfirmMatches: (matches: Match[]) => void;
    onDisputeWorkflow: (workflowId: string, reason: string) => void;
    onUpdateWorkflow: React.Dispatch<React.SetStateAction<Workflow[]>>;
    onAddNotification: (type: 'agent' | 'success' | 'error' | 'info', message: string) => void;
    onViewInvoice: (workflow: Workflow) => void;
    onInitiateCall: (workflow: Workflow) => void;
    pendingMatches: Match[] | null;
    onClearPendingMatches: () => void;
    users: User[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    workflows, 
    currentUser,
    messages,
    isLoading,
    settings,
    onSendMessage,
    onLogCommunication,
    onAnalyzeRemittance,
    onConfirmMatches,
    onDisputeWorkflow,
    onUpdateWorkflow,
    onAddNotification,
    onViewInvoice,
    onInitiateCall,
    pendingMatches,
    onClearPendingMatches,
    users
}) => {
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

    const selectedWorkflow = useMemo(() => {
        return workflows.find(w => w.id === selectedWorkflowId) || null;
    }, [selectedWorkflowId, workflows]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Column 1: Workflow Tracker */}
            <div className="lg:col-span-3 h-full overflow-hidden">
                <WorkflowTracker 
                    workflows={workflows}
                    currentUser={currentUser}
                    onSelectWorkflow={setSelectedWorkflowId}
                    selectedWorkflowId={selectedWorkflowId}
                />
            </div>
            
            {/* Column 2: AI Assistant */}
            <div className="lg:col-span-5 h-full overflow-hidden">
                <ChatInterface 
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={onSendMessage}
                    selectedWorkflow={selectedWorkflow}
                    onLogCommunication={onLogCommunication}
                />
            </div>

            {/* Column 3: Inspector Panel */}
            <div className="lg:col-span-4 h-full overflow-hidden">
                <InspectorPanel
                    workflow={selectedWorkflow}
                    users={users}
                    settings={settings}
                    onAnalyzeRemittance={onAnalyzeRemittance}
                    onConfirmMatches={onConfirmMatches}
                    onDisputeWorkflow={onDisputeWorkflow}
                    onUpdateWorkflow={onUpdateWorkflow}
                    onAddNotification={onAddNotification}
                    onViewInvoice={onViewInvoice}
                    onInitiateCall={onInitiateCall}
                    pendingMatches={pendingMatches}
                    onClearPendingMatches={onClearPendingMatches}
                />
            </div>
        </div>
    );
};