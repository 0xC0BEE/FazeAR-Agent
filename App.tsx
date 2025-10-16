
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Analytics } from './components/Analytics.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { runChat } from './services/geminiService.ts';
import type { User, Workflow, DunningPlan, ChatMessage } from './types.ts';
import { USERS, WORKFLOWS, DUNNING_PLANS } from './mockData.ts';

function App() {
  const [users] = useState<User[]>(USERS);
  const [currentUser, setCurrentUser] = useState<User>(USERS[2]); // Default to Collector
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOWS);
  const [dunningPlans] = useState<DunningPlan[]>(DUNNING_PLANS);
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uuidv4(), role: 'model', content: "Hello! I'm your FazeAR Agent. How can I help you manage your accounts receivable today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [scenarioWorkflows, setScenarioWorkflows] = useState<Workflow[] | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAutonomousMode, setAutonomousMode] = useState(false);

  useEffect(() => {
    // Select the first overdue workflow on load for demonstration
    const firstOverdue = workflows.find(w => w.status === 'Overdue');
    if (firstOverdue) {
      setSelectedWorkflowId(firstOverdue.id);
    }
  }, []);

  const handleSendMessage = async (input: string) => {
    const userMessage: ChatMessage = { id: uuidv4(), role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Basic "what-if" scenario parsing
      if (input.toLowerCase().includes('scenario') && input.toLowerCase().includes('pays') && input.toLowerCase().includes('late')) {
        const clientNameMatch = input.match(/(?:where|what if|scenario)\s(.*?)\spays/i);
        const daysLateMatch = input.match(/(\d+)\s+days?\s+late/i);
        
        if (clientNameMatch && clientNameMatch[1] && daysLateMatch && daysLateMatch[1]) {
            const clientName = clientNameMatch[1].trim();
            const daysLate = parseInt(daysLateMatch[1], 10);
            const newScenario = workflows.map(w => {
                if (w.clientName.toLowerCase() === clientName.toLowerCase()) {
                    const newDueDate = new Date(w.dueDate);
                    newDueDate.setDate(newDueDate.getDate() + daysLate);
                    return { ...w, dueDate: newDueDate.toISOString().split('T')[0] };
                }
                return w;
            });
            setScenarioWorkflows(newScenario);
            const botMessage: ChatMessage = { id: uuidv4(), role: 'model', content: `Ok, I've run the scenario where ${clientName} pays ${daysLate} days late. The cash flow forecast has been updated.` };
            setMessages([...updatedMessages, botMessage]);
            setIsLoading(false);
            return;
        }
      }

      // Fallback to Gemini
      const response = await runChat(updatedMessages, workflows, users);
      const botMessage: ChatMessage = { id: uuidv4(), role: 'model', content: response.text };
      setMessages([...updatedMessages, botMessage]);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = { id: uuidv4(), role: 'model', content: "Sorry, I encountered an error. Please try again." };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateWorkflows = (updatedWorkflows: Workflow[]) => {
      setWorkflows(updatedWorkflows);
  };

  const handlePaymentReceived = (workflowId: string) => {
      const updated = workflows.map(w => {
          if (w.id === workflowId) {
              return {
                  ...w,
                  status: 'Completed' as 'Completed',
                  paymentDate: new Date().toISOString().split('T')[0],
                  auditTrail: [...w.auditTrail, { timestamp: new Date().toISOString(), activity: 'Payment Received', details: 'Simulated payment via webhook.' }]
              };
          }
          return w;
      });
      setWorkflows(updated);
  };
  
  const handleNewInvoice = (data: any) => {
      const newWorkflow: Workflow = {
          id: `wf-${uuidv4().slice(0, 8)}`,
          externalId: data.externalId,
          clientName: data.clientName,
          amount: data.amount,
          dueDate: data.dueDate,
          createdDate: new Date().toISOString().split('T')[0],
          status: 'In Progress',
          assignee: 'David Chen', // Default assignee
          dunningPlan: 'Standard',
          currentStep: 0,
          auditTrail: [{ timestamp: new Date().toISOString(), activity: 'Workflow Created', details: 'Created from new invoice webhook.' }]
      };
      setWorkflows(prev => [newWorkflow, ...prev]);
  };
  
  const handleAddNote = (note: string) => {
      if (!selectedWorkflowId) return;
      const updated = workflows.map(w => {
          if (w.id === selectedWorkflowId) {
              const newEntry = { timestamp: new Date().toISOString(), activity: `Note Added by ${currentUser.name}`, details: note };
              return { ...w, auditTrail: [...w.auditTrail, newEntry] };
          }
          return w;
      });
      setWorkflows(updated);
  };

  const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId) || null;

  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentView={currentView}
          onSetView={setCurrentView}
          users={users}
          currentUser={currentUser}
          onSetCurrentUser={setCurrentUser}
        />
        <main className="flex-1 min-h-0">
          {currentView === 'dashboard' ? (
            <Dashboard
              workflows={workflows}
              currentUser={currentUser}
              selectedWorkflow={selectedWorkflow}
              onSelectWorkflow={setSelectedWorkflowId}
              onUpdateWorkflows={handleUpdateWorkflows}
              onPaymentReceived={handlePaymentReceived}
              onNewInvoice={handleNewInvoice}
              onAddNote={handleAddNote}
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              scenarioWorkflows={scenarioWorkflows}
              onClearScenario={() => setScenarioWorkflows(null)}
            />
          ) : (
            <Analytics workflows={workflows} users={users} />
          )}
        </main>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        dunningPlans={dunningPlans}
        onUpdateDunningPlans={() => {}} // Placeholder
        isAutonomousMode={isAutonomousMode}
        onSetAutonomousMode={setAutonomousMode}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;