// Fix: Implemented the main App component to resolve module not found and other related errors.
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { SettingsModal } from './components/SettingsModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { PaymentPortal } from './components/PaymentPortal';

import type { Workflow, User, Message, DunningPlan, Draft, AuditEntry } from './types';
import { initialWorkflows, initialUsers, dunningPlans as initialDunningPlans } from './mockData';
import { generateEmailDraft, adjustEmailDraftTone, getAnalyticsInsight } from './services/geminiService';

const App: React.FC = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
    const [users] = useState<User[]>(initialUsers);
    const [dunningPlans, setDunningPlans] = useState<DunningPlan[]>(initialDunningPlans);
    const [currentUser, setCurrentUser] = useState<User>(users[0]);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { id: uuidv4(), sender: 'bot', content: 'Welcome to FazeAR Agent! I can help you manage your accounts receivable. Select a workflow or ask me a question about the current state of your AR.' },
    ]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
    const [isAutonomousMode, setIsAutonomousMode] = useState(false);
    const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');
    const [scenarioWorkflows, setScenarioWorkflows] = useState<Workflow[] | null>(null);

    const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId) || null;

    const addAuditEntry = (workflowId: string, activity: string, details: string) => {
        const newEntry: AuditEntry = { timestamp: new Date().toISOString(), activity, details };
        setWorkflows(prev => prev.map(w => w.id === workflowId ? {
            ...w,
            auditTrail: [...w.auditTrail, newEntry]
        } : w));
    };

    const handleSelectWorkflow = (workflowId: string) => {
        setSelectedWorkflowId(workflowId);
        const workflow = workflows.find(w => w.id === workflowId);
        if (workflow) {
            const botMessage: Message = {
                id: uuidv4(),
                sender: 'bot',
                content: `Selected workflow for ${workflow.clientName}. What would you like to do? You can ask me to "draft a reminder email" or "propose a 5% settlement".`
            };
            setMessages(prev => [...prev, botMessage]);
            addAuditEntry(workflowId, 'Workflow Viewed', `User ${currentUser.name} selected the workflow.`);
        }
    };
    
    const handleSendMessage = async (prompt: string) => {
        const userMessage: Message = { id: uuidv4(), sender: 'user', content: prompt };
        setMessages(prev => [...prev, userMessage]);

        const loadingMessage: Message = { id: uuidv4(), sender: 'bot', content: '', isLoading: true };
        setMessages(prev => [...prev, loadingMessage]);

        if (prompt.toLowerCase().includes('draft') && prompt.toLowerCase().includes('email') && selectedWorkflow) {
             try {
                const draftData = await generateEmailDraft(selectedWorkflow);
                const draft: Draft = { ...draftData, type: 'draft', workflowId: selectedWorkflow.id };
                const draftMessage: Message = { id: uuidv4(), sender: 'bot', content: draft };
                setMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(draftMessage));
                addAuditEntry(selectedWorkflow.id, 'Email Draft Generated', `AI generated an email draft for ${selectedWorkflow.clientName}.`);
            } catch (error) {
                const errorMessage: Message = { id: uuidv4(), sender: 'bot', content: "Sorry, I couldn't generate a draft right now." };
                setMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(errorMessage));
            }
        } else {
            const insight = await getAnalyticsInsight(prompt, workflows, users);
            const botResponse: Message = { id: uuidv4(), sender: 'bot', content: insight };
            setMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(botResponse));
        }
    };

    const handleSendDraft = (draft: Draft) => {
        setMessages(prev => prev.map(m =>
            typeof m.content !== 'string' && m.content.workflowId === draft.workflowId
            ? { ...m, content: `Email sent to ${draft.recipient} with subject "${draft.subject}".` }
            : m
        ));
        addAuditEntry(draft.workflowId, 'Email Sent', `User ${currentUser.name} sent an email to ${draft.recipient}. Subject: ${draft.subject}`);
        setWorkflows(prev => prev.map(w => w.id === draft.workflowId ? {
            ...w,
            communicationHistory: [...w.communicationHistory, { stepName: `Manual Email Sent: ${draft.subject}`, timestamp: new Date().toISOString() }]
        } : w));
    };

    const handleAdjustDraftTone = async (draft: Draft, instruction: string) => {
        const originalMessageId = messages.find(m => typeof m.content !== 'string' && m.content.workflowId === draft.workflowId)?.id;
        if (!originalMessageId) return;

        setMessages(prev => prev.map(m => m.id === originalMessageId ? { ...m, isLoading: true } : m));
        
        try {
            const adjustedDraftData = await adjustEmailDraftTone(draft, instruction);
            const adjustedDraft: Draft = { ...adjustedDraftData, type: 'draft', workflowId: draft.workflowId };
            setMessages(prev => prev.map(m => m.id === originalMessageId ? { id: m.id, sender: 'bot', content: adjustedDraft, isLoading: false } : m));
            addAuditEntry(draft.workflowId, 'Email Draft Adjusted', `User ${currentUser.name} adjusted email tone with instruction: "${instruction}"`);
        } catch (error) {
            setMessages(prev => prev.map(m => m.id === originalMessageId ? { ...m, content: draft, isLoading: false } : m)); // Revert on error
        }
    };

    const handleAddTask = (workflowId: string, taskContent: string) => {
        const newTask = { id: uuidv4(), content: taskContent, assignee: currentUser.name, isCompleted: false };
        setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, tasks: [...w.tasks, newTask] } : w));
        addAuditEntry(workflowId, 'Task Added', `User ${currentUser.name} added task: "${taskContent}"`);
    };

    const handleToggleTask = (workflowId: string, taskId: string) => {
        let taskContent = '';
        let isCompleted = false;
        setWorkflows(prev => prev.map(w => {
            if (w.id === workflowId) {
                const updatedTasks = w.tasks.map(t => {
                    if (t.id === taskId) {
                        taskContent = t.content;
                        isCompleted = !t.isCompleted;
                        return { ...t, isCompleted };
                    }
                    return t;
                });
                return { ...w, tasks: updatedTasks };
            }
            return w;
        }));
        if (taskContent) {
            addAuditEntry(workflowId, 'Task Status Changed', `Task "${taskContent}" marked as ${isCompleted ? 'complete' : 'incomplete'}.`);
        }
    };

    const handleAddNote = (workflowId: string, noteContent: string) => {
        const newNote = { id: uuidv4(), content: noteContent, author: currentUser.name, timestamp: new Date().toISOString() };
        setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, notes: [...w.notes, newNote] } : w));
        addAuditEntry(workflowId, 'Note Added', `User ${currentUser.name} added a note.`);
    };

    const handleViewAuditTrail = (workflowId: string) => {
        setSelectedWorkflowId(workflowId);
        setIsAuditTrailOpen(true);
    };

    const handleProposeSettlement = (workflowId: string, discount: number) => {
        const workflow = workflows.find(w => w.id === workflowId);
        if (!workflow) return;

        const discountAmount = (workflow.amount * (discount / 100)).toFixed(2);
        const newAmount = (workflow.amount - parseFloat(discountAmount)).toFixed(2);

        const botMessage: Message = {
            id: uuidv4(),
            sender: 'bot',
            isAutonomous: true,
            content: `Understood. I will propose a ${discount}% discount to ${workflow.clientName}, for a new total of $${newAmount}. I'll draft an email and add a record to the communication history.`
        };
        setMessages(prev => [...prev, botMessage]);
        addAuditEntry(workflowId, 'Settlement Proposed', `User ${currentUser.name} authorized a ${discount}% settlement proposal.`);
        setWorkflows(prev => prev.map(w => w.id === workflowId ? {
            ...w,
            communicationHistory: [...w.communicationHistory, { stepName: `AI Proposed ${discount}% Settlement`, timestamp: new Date().toISOString() }]
        } : w));
    };

    const handlePaymentReceived = (workflowId: string) => {
        const workflow = workflows.find(w => w.id === workflowId);
        if (!workflow) return;
        setWorkflows(prev => prev.map(w => w.id === workflowId ? {
            ...w,
            status: 'Completed',
            paymentDate: new Date().toISOString().split('T')[0]
        } : w));
        addAuditEntry(workflowId, 'Payment Received', 'Payment confirmed via webhook.');
        const botMessage: Message = {
            id: uuidv4(),
            sender: 'bot',
            isAutonomous: true,
            content: `Payment received for ${workflow.clientName}. The workflow has been marked as 'Completed'.`
        };
        setMessages(prev => [...prev, botMessage]);
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
            auditTrail: [{ timestamp: new Date().toISOString(), activity: 'Workflow Created', details: 'Created automatically via QuickBooks webhook.' }],
            paymentUrl: `${window.location.origin}/pay?workflowId=${newWorkflowId}`
        };
        setWorkflows(prev => [newWorkflow, ...prev]);
        const botMessage: Message = {
            id: uuidv4(),
            sender: 'bot',
            isAutonomous: true,
            content: `New invoice detected from QuickBooks for ${invoiceData.clientName} for $${invoiceData.amount}. I have created a new workflow.`
        };
        setMessages(prev => [...prev, botMessage]);
    };

    const handleSetCurrentUser = (user: User) => {
        setCurrentUser(user);
        if (currentView === 'analytics' && (user.role !== 'Admin' && user.role !== 'Manager')) {
            setCurrentView('dashboard');
        }
    };

    if (window.location.pathname === '/pay') {
        return <PaymentPortal workflows={workflows} onPay={handlePaymentReceived} />;
    }

    return (
        <div className="bg-slate-900 text-slate-300 min-h-screen font-sans">
            <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
                <Header 
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    currentView={currentView}
                    onSetView={setCurrentView}
                    users={users}
                    currentUser={currentUser}
                    onSetCurrentUser={handleSetCurrentUser}
                />
                
                {currentView === 'dashboard' ? (
                    <Dashboard 
                        workflows={workflows}
                        currentUser={currentUser}
                        selectedWorkflowId={selectedWorkflowId}
                        onSelectWorkflow={handleSelectWorkflow}
                        selectedWorkflow={selectedWorkflow}
                        onAddTask={handleAddTask}
                        onToggleTask={handleToggleTask}
                        onAddNote={handleAddNote}
                        onViewAuditTrail={handleViewAuditTrail}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onSendDraft={handleSendDraft}
                        onAdjustDraftTone={handleAdjustDraftTone}
                        onProposeSettlement={handleProposeSettlement}
                        scenarioWorkflows={scenarioWorkflows}
                        onClearScenario={() => setScenarioWorkflows(null)}
                        onPaymentReceived={handlePaymentReceived}
                        onNewInvoice={handleNewInvoice}
                    />
                ) : (
                    <Analytics workflows={workflows} users={users} />
                )}

                <SettingsModal 
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    dunningPlans={dunningPlans}
                    onUpdateDunningPlans={setDunningPlans}
                    isAutonomousMode={isAutonomousMode}
                    onSetAutonomousMode={setIsAutonomousMode}
                    currentUser={currentUser}
                />
                <AuditTrailModal 
                    isOpen={isAuditTrailOpen}
                    onClose={() => setIsAuditTrailOpen(false)}
                    workflow={selectedWorkflow}
                />
            </div>
        </div>
    );
};

export default App;
