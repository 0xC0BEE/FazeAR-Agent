import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { User, Workflow, Settings, ChatMessage, DunningPlan, ToolCall, ToolResponse } from './types.ts';
import { MOCK_USERS, MOCK_WORKFLOWS, MOCK_SETTINGS } from './mockData.ts';
import { runChat } from './services/geminiService.ts';
import { Header } from './components/Header.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Analytics } from './components/Analytics.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { PaymentPortal } from './components/PaymentPortal.tsx';
// Fix: Use FunctionCall type for tool calls from the Gemini API response, as FunctionCallPart is not exported.
import type { FunctionCall } from '@google/genai';

function App() {
  const [users] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'initial-msg', role: 'model', content: "Hello! I'm your FazeAR agent. How can I help you with your accounts receivable today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics' | 'portal'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scenarioWorkflows, setScenarioWorkflows] = useState<Workflow[] | null>(null);
  const [isGlobalAutonomous, setIsGlobalAutonomous] = useState(false);
  const [remittanceText, setRemittanceText] = useState('');

  const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId) || null;
  
  const runAutonomousAgentCycle = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dunningPlansMap = new Map<string, DunningPlan>(
      settings.dunningPlans.map(p => [p.name, p])
    );

    const updatedWorkflows = workflows.map(w => {
      if (w.status !== 'Overdue' || !w.isAutonomous) {
        return w;
      }

      const plan = dunningPlansMap.get(w.dunningPlan);
      if (!plan) return w;

      const dueDate = new Date(w.dueDate);
      const utcDueDate = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());
      utcDueDate.setHours(0,0,0,0);
        
      const timeDiff = today.getTime() - utcDueDate.getTime();
      const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let updatedWorkflow = { ...w, auditTrail: [...w.auditTrail] };
      
      for (const step of plan.steps) {
        if (daysOverdue >= step.day) {
           const actionAlreadyLogged = w.auditTrail.some(
             entry => entry.activity === 'Autonomous Action' && entry.details.includes(step.template)
           );

           if (!actionAlreadyLogged) {
             updatedWorkflow.auditTrail.push({
               timestamp: new Date().toISOString(),
               activity: 'Autonomous Action',
               details: `Agent executed step: '${step.template}' from '${plan.name}' plan.`
             });
           }
        }
      }
      return updatedWorkflow;
    });

    setWorkflows(updatedWorkflows);
  }, [workflows, settings.dunningPlans]);


  useEffect(() => {
    let interval: number | undefined;
    if (isGlobalAutonomous) {
      // Run immediately and then set interval
      runAutonomousAgentCycle();
      interval = window.setInterval(runAutonomousAgentCycle, 15000); // Check every 15 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGlobalAutonomous, runAutonomousAgentCycle]);

  const handleSetCurrentUser = (user: User) => {
    if (user.id === currentUser.id) return;
    setCurrentUser(user);
    setSelectedWorkflowId(null);
    if (user.role === 'Client') {
      setCurrentView('portal');
    } else if (user.role === 'Collector' && currentView === 'analytics') {
      setCurrentView('dashboard');
    } else if (currentView === 'portal') {
      setCurrentView('dashboard');
    }
  };
  
  const handleUpdateSettings = (newSettings: Partial<Settings>) => {
      setSettings(prev => ({...prev, ...newSettings}));
  };

  const handleUpdateWorkflows = (updatedWorkflows: Workflow[]) => {
    setWorkflows(updatedWorkflows);
  };
  
  const handleToggleWorkflowAutonomy = (workflowId: string) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflowId
          ? { ...w, isAutonomous: !w.isAutonomous }
          : w
      )
    );
  };

  const handlePaymentReceived = (workflowId: string) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflowId
          ? {
              ...w,
              status: 'Completed',
              paymentDate: new Date().toISOString().split('T')[0],
              auditTrail: [
                ...w.auditTrail,
                {
                  timestamp: new Date().toISOString(),
                  activity: 'Payment Received',
                  details: 'Simulated via Webhook Listener.',
                },
              ],
            }
          : w
      )
    );
    if (selectedWorkflowId === workflowId) {
        setSelectedWorkflowId(null);
    }
  };

  const handleNewInvoice = (invoiceData: any | any[]) => {
     const invoicesToCreate = Array.isArray(invoiceData) ? invoiceData : [invoiceData];
     const newWorkflows: Workflow[] = invoicesToCreate.map(data => ({
        id: `wf_${uuidv4()}`,
        clientName: data.clientName,
        amount: data.amount,
        dueDate: data.dueDate,
        status: new Date(data.dueDate) < new Date() ? 'Overdue' : 'In Progress',
        assignee: 'Maria Garcia', // Default assignee
        auditTrail: [
            {
                timestamp: new Date().toISOString(),
                activity: 'Invoice Created',
                details: 'Simulated via Webhook Listener.',
            },
        ],
        externalId: data.externalId,
        dunningPlan: 'Standard Net 30',
        createdDate: new Date().toISOString().split('T')[0],
        isAutonomous: false,
    }));
    setWorkflows(prev => [...newWorkflows, ...prev]);
  };
  
  const handleAddNote = (workflowId: string, note: string) => {
    setWorkflows(prev => prev.map(w => w.id === workflowId ? {
        ...w,
        auditTrail: [...w.auditTrail, {
            timestamp: new Date().toISOString(),
            activity: `Note Added by ${currentUser.name}`,
            details: note,
        }]
    } : w));
  };

  const handleAssignWorkflow = (workflowId: string, assigneeName: string) => {
    setWorkflows(prev => prev.map(w => w.id === workflowId ? {
      ...w,
      assignee: assigneeName,
      auditTrail: [...w.auditTrail, {
          timestamp: new Date().toISOString(),
          activity: 'Workflow Reassigned',
          details: `Assigned to ${assigneeName} by ${currentUser.name} via AI Agent.`,
      }]
    } : w))
  };

  const handleSendReminder = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => w.id === workflowId ? {
      ...w,
      auditTrail: [...w.auditTrail, {
          timestamp: new Date().toISOString(),
          activity: 'Reminder Sent',
          details: `Reminder sent by ${currentUser.name} via AI Agent.`,
      }]
    } : w))
  };

  const resolveWorkflowId = (identifier: string): string | { error: string, suggestions?: string[] } => {
    const directMatch = workflows.find(w => w.externalId === identifier);
    if (directMatch) return directMatch.id;

    const nameMatches = workflows.filter(w => 
      w.clientName.toLowerCase().includes(identifier.toLowerCase()) && w.status !== 'Completed'
    );

    if (nameMatches.length === 0) return { error: `Could not find an active workflow for "${identifier}".`};
    if (nameMatches.length === 1) return nameMatches[0].id;
    
    // Prioritize overdue if multiple active workflows exist for one client
    const overdueMatches = nameMatches.filter(w => w.status === 'Overdue');
    if (overdueMatches.length === 1) return overdueMatches[0].id;

    return { 
      error: `Found multiple active workflows for "${identifier}". Please specify which invoice.`,
      suggestions: nameMatches.map(w => w.externalId)
    };
  };

  // Fix: The response from Gemini contains a FunctionCall object, not a FunctionCallPart.
  const executeToolCall = (toolCall: FunctionCall): ToolResponse['response'] => {
    const { name, args } = toolCall;
    const { workflowIdentifier, assigneeName, note } = args;
    
    const workflowIdResult = resolveWorkflowId(workflowIdentifier as string);
    if (typeof workflowIdResult !== 'string') {
      return { success: false, message: workflowIdResult.error };
    }
    const workflowId = workflowIdResult;

    switch (name) {
      case 'assign_workflow':
        const assignee = users.find(u => u.name === assigneeName);
        if (!assignee) return { success: false, message: `Collector "${assigneeName}" not found.` };
        handleAssignWorkflow(workflowId, assigneeName as string);
        return { success: true, message: `Workflow ${workflowIdentifier} assigned to ${assigneeName}.`};

      case 'add_note_to_workflow':
        handleAddNote(workflowId, note as string);
        return { success: true, message: `Note added to workflow ${workflowIdentifier}.`};

      case 'send_reminder':
        handleSendReminder(workflowId);
        return { success: true, message: `Reminder sent for workflow ${workflowIdentifier}.`};

      default:
        return { success: false, message: `Unknown tool: ${name}`};
    }
  };
  
  const handleSendMessage = async (input: string) => {
    if (isLoading || !input.trim()) return;

    const userMessage: ChatMessage = {
        id: `msg_${uuidv4()}`,
        role: 'user',
        content: input,
    };

    let currentMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(currentMessages);
    setIsLoading(true);

    const thinkingMessage: ChatMessage = {
        id: `msg_${uuidv4()}`,
        role: 'model',
        isThinking: true,
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
        const response = await runChat(currentMessages);
        
        const thinkingMsgId = thinkingMessage.id;
        currentMessages = currentMessages.filter(m => m.id !== thinkingMsgId);

        const functionCalls = response.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
            // For now, handle one function call at a time
            const toolCall = functionCalls[0];
            
            const toolCallMessage: ChatMessage = {
                id: `msg_${uuidv4()}`,
                role: 'model',
                toolCall: { id: toolCall.id, name: toolCall.name, args: toolCall.args }
            };
            currentMessages.push(toolCallMessage);
            setMessages(currentMessages);

            const toolResult = executeToolCall(toolCall);
            
            const toolResponseMessage: ChatMessage = {
                id: `msg_${uuidv4()}`,
                role: 'tool',
                toolResponse: {
                    id: toolCall.id,
                    name: toolCall.name,
                    response: toolResult,
                }
            };
            
            // Call API again with tool response to get final text
            const finalResponse = await runChat([...currentMessages, toolResponseMessage]);
            
            if(finalResponse.text) {
                 const modelResponse: ChatMessage = {
                    id: `msg_${uuidv4()}`,
                    role: 'model',
                    content: finalResponse.text,
                };
                setMessages(prev => [...prev, modelResponse]);
            }

        } else if (response.text) {
             const modelResponse: ChatMessage = {
                id: `msg_${uuidv4()}`,
                role: 'model',
                content: response.text,
            };
             setMessages([...currentMessages, modelResponse]);
        }
        
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage: ChatMessage = {
            id: `msg_${uuidv4()}`,
            role: 'model',
            content: "Sorry, I encountered an error. Please try again.",
        };
        setMessages(prev => [...prev.filter(m => !m.isThinking), errorMessage]);
    } finally {
        setIsLoading(false);
    }
};

  const handleClearScenario = () => {
    setScenarioWorkflows(null);
  };
  
  const handleSimulateEvent = (type: string, data: any) => {
      switch (type) {
          case 'new_invoice':
              handleNewInvoice(data);
              break;
          case 'payment_received':
              // Fix: Cast the `id` property from the `data` object to a string to match the expected type for `handlePaymentReceived`.
              handlePaymentReceived(data.id as string);
              break;
          case 'remittance_advice':
              // Fix: Cast the `text` property from the `data` object to a string to match the expected type for the `setRemittanceText` state setter.
              setRemittanceText(data.text as string);
              break;
          default:
              // Fix: Explicitly cast `type` to a string within the template literal to prevent potential type errors from strict linting rules.
              console.warn(`Unknown simulation event type: ${String(type)}`);
      }
  };

  const clientWorkflows = currentUser.role === 'Client' 
      ? workflows.filter(w => w.clientName === currentUser.clientName)
      : [];

  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen font-sans">
      <div className="h-screen flex flex-col">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 flex-shrink-0">
           <Header
            onOpenSettings={() => setIsSettingsOpen(true)}
            currentView={currentView}
            onSetView={setCurrentView}
            users={users}
            currentUser={currentUser}
            onSetCurrentUser={handleSetCurrentUser}
            isGlobalAutonomous={isGlobalAutonomous}
            onSetGlobalAutonomous={setIsGlobalAutonomous}
          />
        </div>
        <main className="container mx-auto px-4 md:px-6 lg:p-8 flex-1 min-h-0">
           {currentView === 'dashboard' ? (
            <Dashboard
                workflows={workflows}
                currentUser={currentUser}
                selectedWorkflow={selectedWorkflow}
                onSelectWorkflow={setSelectedWorkflowId}
                onUpdateWorkflows={handleUpdateWorkflows}
                onSimulateEvent={handleSimulateEvent}
                onAddNote={(note) => selectedWorkflowId && handleAddNote(selectedWorkflowId, note)}
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                scenarioWorkflows={scenarioWorkflows}
                onClearScenario={handleClearScenario}
                onToggleWorkflowAutonomy={handleToggleWorkflowAutonomy}
                remittanceText={remittanceText}
                onSetRemittanceText={setRemittanceText}
            />
          ) : currentView === 'analytics' ? (
            <Analytics workflows={workflows} users={users} />
          ) : (
            <PaymentPortal 
              user={currentUser}
              workflows={clientWorkflows}
            />
          )}
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}

export default App;
