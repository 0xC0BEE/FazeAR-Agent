import React, { useState, useEffect } from 'react';
import { mockUsers, mockWorkflows, mockDunningPlans } from './mockData';
import type { User, Workflow, DunningPlan, AuditLogEntry, ChatMessage, FunctionCall, FunctionResponse, Dispute } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { SettingsModal } from './components/SettingsModal';
import { PaymentPortal } from './components/PaymentPortal';
import { v4 as uuidv4 } from 'uuid';
import { runAgent } from './services/geminiService';

const App: React.FC = () => {
  const [isPaymentPortal, setIsPaymentPortal] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [users] = useState(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[1]); // Default to Manager
  const [dunningPlans, setDunningPlans] = useState<DunningPlan[]>(mockDunningPlans);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(mockWorkflows.find(w => w.status === 'Overdue')?.id || null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAutonomousMode, setIsAutonomousMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scenarioWorkflows, setScenarioWorkflows] = useState<Workflow[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('workflowId')) {
      setIsPaymentPortal(true);
    }
  }, []);

  useEffect(() => {
    setMessages([
        {
            id: uuidv4(),
            role: 'model',
            content: `Hi ${currentUser.name}, I'm FazeAR. I'm ready to assist. What would you like to do?`
        }
    ]);
  }, [currentUser]);

  const addAuditLog = (workflowId: string, activity: string, details: string): Workflow[] => {
    const newEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      activity,
      details,
    };
    let updatedWorkflows: Workflow[] = [];
    setWorkflows(prev => {
        updatedWorkflows = prev.map(w =>
            w.id === workflowId ? { ...w, auditTrail: [...w.auditTrail, newEntry] } : w
        );
        return updatedWorkflows;
    });
    return updatedWorkflows;
  };
  
  const executeFunctionCall = (toolCall: FunctionCall): FunctionResponse => {
      console.log("Executing tool:", toolCall.name, "with args:", toolCall.args);
      let result: any = { success: false, message: 'Tool not found or failed.' };
      
      try {
        switch (toolCall.name) {
            case 'add_note': {
                const { workflowId, note } = toolCall.args;
                addAuditLog(workflowId, 'Note Added', `Added by ${currentUser.name} via AI Agent: "${note}"`);
                result = { success: true, message: `Note added to workflow ${workflowId}.` };
                break;
            }
            case 'run_cash_flow_scenario': {
                const { modifications } = toolCall.args;
                const newScenarioWorkflows = workflows.map(w => {
                    const mod = modifications.find((m: any) => m.workflowId === w.id);
                    return mod ? { ...w, dueDate: mod.newDueDate } : w;
                });
                setScenarioWorkflows(newScenarioWorkflows);
                result = { success: true, message: 'Scenario has been applied to the cash flow forecast.' };
                break;
            }
            case 'clear_cash_flow_scenario': {
                setScenarioWorkflows(null);
                result = { success: true, message: 'Scenario has been cleared.' };
                break;
            }
             case 'get_analytics_summary': {
                // In a real app, this might be more complex, but for now we format existing data.
                if (toolCall.args.reportType === 'aging') {
                    // Simplified aging logic for agent
                    const overdue = workflows.filter(w => w.status === 'Overdue');
                    const totalOverdue = overdue.reduce((sum, w) => sum + w.amount, 0);
                    result = `There are ${overdue.length} overdue invoices, totaling $${totalOverdue.toLocaleString()}.`;
                } else if (toolCall.args.reportType === 'collector_performance') {
                     result = 'Collector performance data is available in the Analytics view. Currently, Alex Johnson and Maria Garcia are the primary collectors.';
                } else {
                     result = 'Unknown report type.';
                }
                break;
            }
            case 'log_dispute': {
                const { workflowId, amount, reason } = toolCall.args;
                const newDispute: Dispute = {
                    id: uuidv4(),
                    amount,
                    reason,
                    status: 'Open',
                    dateCreated: new Date().toISOString(),
                };
                setWorkflows(prev => prev.map(w => {
                    if (w.id === workflowId) {
                        return { ...w, disputes: [...(w.disputes || []), newDispute] };
                    }
                    return w;
                }));
                addAuditLog(workflowId, 'Dispute Logged', `New dispute of $${amount.toLocaleString()} logged for reason: ${reason}.`);
                result = { success: true, message: `Dispute logged for workflow ${workflowId}.` };
                break;
            }
            default:
                result = { success: false, message: `Tool "${toolCall.name}" is not a valid tool.` };
        }
      } catch (e: any) {
          console.error("Error executing tool:", e);
          result = { success: false, message: `Error executing tool: ${e.message}` };
      }

      return {
          id: toolCall.id,
          name: toolCall.name,
          response: { result },
      };
  }

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { id: uuidv4(), role: 'user', content: input };
    const currentHistory = [...messages, newUserMessage];
    setMessages(currentHistory);
    setIsLoading(true);

    const runConversation = async (history: ChatMessage[]) => {
        try {
            const response = await runAgent(history, workflows, currentUser);

            const call = response.candidates?.[0]?.content.parts[0].functionCall;
            if (call) {
                // Agent wants to call a tool
                const toolCallMessage: ChatMessage = { id: uuidv4(), role: 'model', toolCall: call };
                
                const toolResponse = executeFunctionCall(call);
                const toolResponseMessage: ChatMessage = { id: uuidv4(), role: 'model', toolResponse };

                // Continue the conversation with the tool's result
                runConversation([...history, toolCallMessage, toolResponseMessage]);

            } else {
                // Agent responded with text
                const modelResponse: ChatMessage = {
                    id: uuidv4(),
                    role: 'model',
                    content: response.text,
                };
                setMessages(prev => [...prev.filter(m => !m.isThinking), modelResponse]);
                setIsLoading(false);
            }

        } catch (error) {
            console.error("Failed to get response from Gemini:", error);
            const errorMessage: ChatMessage = {
                id: uuidv4(),
                role: 'model',
                content: "Sorry, I'm having trouble connecting right now. Please try again later."
            };
            setMessages(prev => [...prev.filter(m => !m.isThinking), errorMessage]);
            setIsLoading(false);
        }
    };
    
    // Start the conversation
    const thinkingMessage: ChatMessage = { id: uuidv4(), role: 'model', content: '', isThinking: true };
    setMessages(prev => [...prev, thinkingMessage]);
    runConversation(currentHistory);
  };
  

  const handleUpdateWorkflows = (updatedWorkflows: Workflow[]) => {
    setWorkflows(updatedWorkflows);
  }

  const handleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
  };
  
  const handlePaymentReceived = (workflowId: string, amountPaid?: number) => {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      const paymentAmount = amountPaid !== undefined ? amountPaid : workflow.amount;
      const shortFall = workflow.amount - paymentAmount;

      let newStatus: Workflow['status'] = workflow.status;
      if (shortFall <= 0) {
          newStatus = 'Completed';
      }

      const updatedWorkflows = workflows.map(w => {
          if (w.id === workflowId) {
              const updatedWorkflow = {
                  ...w,
                  status: newStatus,
                  paymentDate: shortFall <= 0 ? new Date().toISOString().split('T')[0] : w.paymentDate,
              };
              return {
                  ...updatedWorkflow,
                  auditTrail: [...updatedWorkflow.auditTrail, { timestamp: new Date().toISOString(), activity: 'Payment Received', details: `Payment of $${paymentAmount.toLocaleString()} received via external webhook.` }]
              };
          }
          return w;
      });
      setWorkflows(updatedWorkflows);

      if (shortFall > 0) {
          handleSendMessage(`Log a dispute for workflow ${workflowId} for a short payment of ${shortFall.toFixed(2)}. Inferred reason is "Unspecified Short Payment".`);
      }

      if (newStatus === 'Completed' && selectedWorkflowId === workflowId) {
          setSelectedWorkflowId(null);
      }
  };

  const handleNewInvoice = (invoiceData: any) => {
      const newWorkflow: Workflow = {
        id: uuidv4(),
        clientName: invoiceData.clientName,
        amount: invoiceData.amount,
        dueDate: invoiceData.dueDate,
        status: 'In Progress',
        assignee: 'Alex Johnson',
        dunningPlan: 'Standard',
        lastContacted: null,
        createdDate: new Date().toISOString().split('T')[0],
        auditTrail: [{ timestamp: new Date().toISOString(), activity: 'Workflow Created', details: `Invoice created via webhook from QuickBooks.` }],
        externalId: invoiceData.externalId,
      };
      setWorkflows(prev => [newWorkflow, ...prev]);
  };

  const handleAddNote = (workflowId: string, note: string) => {
    // This is now handled by the agent, but we keep the direct function for now
    addAuditLog(workflowId, 'Note Added', `Added by ${currentUser.name}: "${note}"`);
  };
  
  const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId) || null;

  if (isPaymentPortal) {
      return <PaymentPortal workflows={workflows} onPay={handlePaymentReceived} />;
  }

  return (
    <div className="bg-slate-900 text-slate-300 h-full font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="max-w-screen-2xl mx-auto w-full flex-shrink-0">
        <Header 
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentView={currentView}
          onSetView={setCurrentView}
          users={users}
          currentUser={currentUser}
          onSetCurrentUser={setCurrentUser}
        />
      </div>
      <main className="flex-1 min-h-0 w-full max-w-screen-2xl mx-auto">
        {currentView === 'dashboard' ? (
          <Dashboard
            workflows={workflows}
            currentUser={currentUser}
            selectedWorkflow={selectedWorkflow}
            onSelectWorkflow={handleSelectWorkflow}
            onUpdateWorkflows={handleUpdateWorkflows}
            onPaymentReceived={handlePaymentReceived}
            onNewInvoice={handleNewInvoice}
            onAddNote={(note) => selectedWorkflow && handleSendMessage(`Add note to workflow ${selectedWorkflow.id}: ${note}`)}
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            scenarioWorkflows={scenarioWorkflows}
            onClearScenario={() => handleSendMessage('Clear the cash flow scenario')}
          />
        ) : (
          <Analytics workflows={workflows} users={users} />
        )}
      </main>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          dunningPlans={dunningPlans}
          onUpdateDunningPlans={setDunningPlans}
          isAutonomousMode={isAutonomousMode}
          onSetAutonomousMode={setIsAutonomousMode}
          currentUser={currentUser}
        />
    </div>
  );
}

export default App;