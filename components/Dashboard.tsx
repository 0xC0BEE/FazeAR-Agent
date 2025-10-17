import React, { useState, useMemo, useEffect } from 'react';
import type { Workflow, User, ChatMessage, Tone, Communication } from '../types';
import { WorkflowTracker } from './WorkflowTracker';
import { InspectorPanel } from './InspectorPanel';
import { ChatInterface } from './ChatInterface';
import { MetricCard } from './MetricCard';
import { DollarIcon } from './icons/DollarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CommunicationsLog } from './CommunicationsLog';
import { CashAppPanel } from './CashAppPanel';

interface DashboardProps {
  workflows: Workflow[];
  currentUser: User;
  users: User[];
  onUpdateWorkflow: (workflowId: string, updates: Partial<Workflow>) => void;
  onAddNote: (workflowId: string, note: string, author: string) => void;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (input: string, tone: Tone) => void;
  onLogCommunication: (messageContent: string, workflow: Workflow) => void;
  communications: Communication[];
  onSendCommunication: (commId: string) => void;
  remittanceText: string;
  onSetRemittanceText: (text: string) => void;
  isAnalyzingCashApp: boolean;
  onAnalyzeRemittance: (text: string) => void;
  onSimulateRemittance: () => void;
  onDisputeWorkflow: (workflow: Workflow) => void;
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [activeActionTab, setActiveActionTab] = useState<'inspector' | 'comms' | 'cash'>('inspector');

  const selectedWorkflow = useMemo(() => {
    return props.workflows.find(w => w.id === selectedWorkflowId) || null;
  }, [selectedWorkflowId, props.workflows]);

  useEffect(() => {
    if (selectedWorkflowId) {
      setActiveActionTab('inspector');
    }
  }, [selectedWorkflowId]);

  const { totalOverdue, collectedToday, avgCollectionTime } = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = props.workflows.filter(w => w.status === 'Overdue');
    const collected = props.workflows.filter(w => w.paymentDate);

    const totalOverdue = overdue.reduce((sum, w) => sum + w.amount, 0);
    const collectedToday = props.workflows.filter(w => w.paymentDate === todayStr).reduce((sum, w) => sum + w.amount, 0);
    
    let collectionDaysSum = 0;
    collected.forEach(w => {
        const createDate = new Date(w.createdDate);
        const payDate = new Date(w.paymentDate!);
        collectionDaysSum += (payDate.getTime() - createDate.getTime()) / (1000 * 3600 * 24);
    });
    const avgCollectionTime = collected.length > 0 ? Math.round(collectionDaysSum / collected.length) : 0;
    
    return { totalOverdue, collectedToday, avgCollectionTime };
  }, [props.workflows]);

  const tabButtonClasses = (tabName: typeof activeActionTab) => 
    `px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
        activeActionTab === tabName
            ? 'bg-slate-700 text-white'
            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
    }`;


  return (
    <main className="grid grid-cols-12 gap-6 h-full">
      {/* Left Column: Workflow Tracker */}
      <div className="col-span-12 lg:col-span-3 h-full min-h-0">
        <WorkflowTracker 
            workflows={props.workflows}
            currentUser={props.currentUser}
            onSelectWorkflow={setSelectedWorkflowId}
            selectedWorkflowId={selectedWorkflowId}
        />
      </div>

      {/* Middle Column: Metrics & AI Assistant */}
      <div className="col-span-12 lg:col-span-5 h-full flex flex-col gap-6 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          <MetricCard title="Total Overdue" value={`$${totalOverdue.toLocaleString()}`} icon={<ClockIcon className="w-8 h-8 text-red-400"/>} />
          <MetricCard title="Collected Today" value={`$${collectedToday.toLocaleString()}`} icon={<CheckCircleIcon className="w-8 h-8 text-green-400"/>} />
          <MetricCard title="Avg. Collection Time" value={`${avgCollectionTime} days`} icon={<DollarIcon className="w-8 h-8 text-blue-400"/>} />
        </div>
        <div className="flex-grow min-h-0">
          <ChatInterface 
             messages={props.chatMessages}
             isLoading={props.isChatLoading}
             onSendMessage={props.onSendMessage}
             selectedWorkflow={selectedWorkflow}
             onLogCommunication={props.onLogCommunication}
          />
        </div>
      </div>

      {/* Right Column: Action Hub */}
      <div className="col-span-12 lg:col-span-4 h-full min-h-0">
        <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
          <div className="p-2 border-b border-slate-700 flex-shrink-0">
            <nav className="flex gap-1">
              <button onClick={() => setActiveActionTab('inspector')} className={tabButtonClasses('inspector')}>Inspector</button>
              <button onClick={() => setActiveActionTab('comms')} className={tabButtonClasses('comms')}>Comms Log</button>
              <button onClick={() => setActiveActionTab('cash')} className={tabButtonClasses('cash')}>Cash App</button>
            </nav>
          </div>
          <div className="flex-grow overflow-y-auto">
            {activeActionTab === 'inspector' && (
                <InspectorPanel 
                    workflow={selectedWorkflow}
                    users={props.users}
                    onUpdateWorkflow={props.onUpdateWorkflow}
                    onAddNote={(note) => selectedWorkflow && props.onAddNote(selectedWorkflow.id, note, props.currentUser.name)}
                    onDisputeWorkflow={() => selectedWorkflow && props.onDisputeWorkflow(selectedWorkflow)}
                />
            )}
            {activeActionTab === 'comms' && (
                <CommunicationsLog 
                    communications={props.communications}
                    onSend={props.onSendCommunication}
                />
            )}
            {activeActionTab === 'cash' && (
                <CashAppPanel 
                    remittanceText={props.remittanceText}
                    onSetRemittanceText={props.onSetRemittanceText}
                    onAnalyze={props.onAnalyzeRemittance}
                    isLoading={props.isAnalyzingCashApp}
                    onSimulate={props.onSimulateRemittance}
                />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};