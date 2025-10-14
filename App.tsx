import React, { useState, useEffect } from 'react';
import { initialUsers, initialWorkflows, dunningPlans as initialDunningPlans } from './mockData';
import type { User, Workflow, DunningPlan } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { Analytics } from './components/Analytics';
import { PaymentPortal } from './components/PaymentPortal';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [isPaymentPage, setIsPaymentPage] = useState(false);

  // Core application state
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [dunningPlans, setDunningPlans] = useState<DunningPlan[]>(initialDunningPlans);
  const [isAutonomousMode, setAutonomousMode] = useState(false);

  // UI state
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(initialWorkflows.filter(w => w.status !== 'Completed')[0]?.id || null);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  
  useEffect(() => {
    // Simple routing for payment portal
    if (window.location.pathname === '/pay') {
      setIsPaymentPage(true);
    } else {
      setIsPaymentPage(false);
    }
  }, []);

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'Collector') {
      setCurrentView('dashboard');
    }
  };

  const handleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
  };
  
  const handleUpdateWorkflows = (updatedWorkflows: Workflow[]) => {
      setWorkflows(updatedWorkflows);
  }
  
  const handlePaymentReceived = (workflowId: string) => {
      setWorkflows(prevWorkflows => {
          const newWorkflows = prevWorkflows.map(w => {
              if (w.id === workflowId) {
                  return { 
                      ...w, 
                      status: 'Completed' as 'Completed',
                      paymentDate: new Date().toISOString().split('T')[0],
                      auditTrail: [
                        ...w.auditTrail,
                        {
                            timestamp: new Date().toISOString(),
                            activity: 'Payment Received',
                            details: 'Payment processed via simulated Stripe webhook.'
                        }
                      ]
                  };
              }
              return w;
          });
          
          if (selectedWorkflowId === workflowId) {
            const nextWorkflow = newWorkflows.find(w => w.status !== 'Completed' && w.id !== workflowId);
            setSelectedWorkflowId(nextWorkflow ? nextWorkflow.id : null);
          }

          return newWorkflows;
      });
  };

  const handleNewInvoice = (invoiceData: any) => {
      const newWorkflowId = `wf-${uuidv4()}`;
      const newWorkflow: Workflow = {
          id: newWorkflowId,
          clientName: invoiceData.clientName,
          amount: invoiceData.amount,
          createdDate: new Date().toISOString().split('T')[0],
          dueDate: invoiceData.dueDate,
          status: 'In Progress',
          assignee: users.find(u => u.role === 'Collector')?.name || users[0].name,
          dunningPlanName: 'Standard',
          notes: [],
          tasks: [],
          communicationHistory: [],
          auditTrail: [{
              timestamp: new Date().toISOString(),
              activity: 'Workflow Created',
              details: 'Created from simulated QuickBooks webhook.'
          }],
          paymentUrl: `${window.location.origin}/pay?workflowId=${newWorkflowId}`
      };
      setWorkflows(prev => [newWorkflow, ...prev]);
      alert(`New invoice for ${invoiceData.clientName} created!`);
  };


  if (isPaymentPage) {
    return <PaymentPortal workflows={workflows} onPay={handlePaymentReceived} />;
  }

  return (
    <div className="bg-slate-900 text-slate-300 h-full font-sans flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <Header
          onOpenSettings={() => setSettingsOpen(true)}
          currentView={currentView}
          onSetView={setCurrentView}
          users={users}
          currentUser={currentUser}
          onSetCurrentUser={handleSetCurrentUser}
        />
        <div className="flex-1 min-h-0">
            {currentView === 'dashboard' ? (
              <Dashboard
                workflows={workflows}
                currentUser={currentUser}
                selectedWorkflowId={selectedWorkflowId}
                onSelectWorkflow={handleSelectWorkflow}
                onUpdateWorkflows={handleUpdateWorkflows}
                isAutonomousMode={isAutonomousMode}
                dunningPlans={dunningPlans}
                onPaymentReceived={handlePaymentReceived}
                onNewInvoice={handleNewInvoice}
              />
            ) : (
              <Analytics workflows={workflows} users={users} />
            )}
        </div>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        dunningPlans={dunningPlans}
        onUpdateDunningPlans={setDunningPlans}
        isAutonomousMode={isAutonomousMode}
        onSetAutonomousMode={setAutonomousMode}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;