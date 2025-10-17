import React from 'react';
import type { Workflow, User, ChatMessage } from '../types.ts';
import { WorkflowTracker } from './WorkflowTracker.tsx';
import { InspectorPanel } from './InspectorPanel.tsx';
import { ChatInterface } from './ChatInterface.tsx';
import { CashFlowChart } from './CashFlowChart.tsx';
import { WebhookListener } from './WebhookListener.tsx';
import { CashAppPanel } from './CashAppPanel.tsx';

interface DashboardProps {
  workflows: Workflow[];
  currentUser: User;
  selectedWorkflow: Workflow | null;
  onSelectWorkflow: (id: string) => void;
  onUpdateWorkflows: (workflows: Workflow[]) => void;
  onSimulateEvent: (type: string, data: any) => void;
  onAddNote: (note: string) => void;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (input: string) => void;
  scenarioWorkflows: Workflow[] | null;
  onClearScenario: () => void;
  onToggleWorkflowAutonomy: (workflowId: string) => void;
  remittanceText: string;
  onSetRemittanceText: (text: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  workflows,
  currentUser,
  selectedWorkflow,
  onSelectWorkflow,
  onUpdateWorkflows,
  onSimulateEvent,
  onAddNote,
  messages,
  isLoading,
  onSendMessage,
  scenarioWorkflows,
  onClearScenario,
  onToggleWorkflowAutonomy,
  remittanceText,
  onSetRemittanceText,
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full min-h-0">
      {/* Left Column */}
      <div className="xl:col-span-3 flex flex-col h-full min-h-0">
        <WorkflowTracker
          workflows={workflows}
          currentUser={currentUser}
          onSelectWorkflow={onSelectWorkflow}
          selectedWorkflowId={selectedWorkflow?.id || null}
        />
      </div>

      {/* Middle Column */}
      <div className="xl:col-span-5 flex flex-col gap-6 h-full min-h-0">
        <div className="flex-shrink-0">
           <CashFlowChart 
              workflows={workflows}
              scenarioWorkflows={scenarioWorkflows}
              onClearScenario={onClearScenario}
          />
        </div>
        <div className="flex-1 min-h-0">
          <InspectorPanel
            workflow={selectedWorkflow}
            onAddNote={onAddNote}
            onToggleWorkflowAutonomy={onToggleWorkflowAutonomy}
          />
        </div>
      </div>
      
      {/* Right Column */}
      <div className="xl:col-span-4 flex flex-col gap-6 h-full min-h-0">
        <div className="flex-grow min-h-0">
          <ChatInterface
              currentUser={currentUser}
              selectedWorkflow={selectedWorkflow}
              messages={messages}
              isLoading={isLoading}
              onSendMessage={onSendMessage}
          />
        </div>
        <div className="flex-shrink-0">
            <CashAppPanel 
              workflows={workflows} 
              onUpdateWorkflows={onUpdateWorkflows} 
              remittanceText={remittanceText}
              onSetRemittanceText={onSetRemittanceText}
            />
        </div>
        <div className="flex-shrink-0">
            <WebhookListener 
                workflows={workflows} 
                onSimulateEvent={onSimulateEvent}
            />
        </div>
      </div>
    </div>
  );
};