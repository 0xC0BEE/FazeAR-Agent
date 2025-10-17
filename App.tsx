
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { SettingsModal } from './components/SettingsModal';
import { PaymentPortal } from './components/PaymentPortal';
import { IntegrationsHub } from './components/IntegrationsHub';
import { KnowledgeBase } from './components/KnowledgeBase';
import { DisputesHub } from './components/DisputesHub';
import { DisputeModal } from './components/DisputeModal';
import { CashAppConfirmationModal } from './components/CashAppConfirmationModal';
import { NotificationToaster } from './components/NotificationToaster';

import { generateResponse, analyzeRemittance } from './services/geminiService';
import { MOCK_USERS, MOCK_WORKFLOWS, MOCK_SETTINGS, MOCK_REMITTANCE_ADVICE } from './mockData';

import type { 
    User, 
    Workflow, 
    Settings, 
    ChatMessage, 
    Tone, 
    Notification,
    Communication,
    DisputeStatus
} from './types';

type View = 'dashboard' | 'analytics' | 'integrations' | 'portal' | 'knowledge' | 'disputes';

const App: React.FC = () => {
    // STATE MANAGEMENT
    const [users] = useState<User[]>(MOCK_USERS);
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
    const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
    const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    
    // Global Autonomous Mode
    const [isGlobalAutonomous, setGlobalAutonomous] = useState(false);

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatLoading, setChatLoading] = useState(false);

    // Communications State
    const [communications, setCommunications] = useState<Communication[]>([]);

    // Analytics "What-If" Scenario State
    const [scenarioWorkflows, setScenarioWorkflows] = useState<Workflow[] | null>(null);

    // Cash App State
    const [remittanceText, setRemittanceText] = useState('');
    const [isAnalyzingCashApp, setIsAnalyzingCashApp] = useState(false);
    const [cashAppMatches, setCashAppMatches] = useState<any[] | null>(null);

    // Disputes State
    const [disputingWorkflow, setDisputingWorkflow] = useState<Workflow | null>(null);

    // Notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // --- HELPER FUNCTIONS ---
    const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
        const newNotification: Notification = { id: uuidv4(), message, type };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const addAuditEntry = useCallback((workflowId: string, activity: string, details: string) => {
        setWorkflows(prev => prev.map(w => 
            w.id === workflowId 
            ? { ...w, auditTrail: [{ timestamp: new Date().toISOString(), activity, details }, ...w.auditTrail] }
            : w
        ));
    }, []);

    // --- EVENT HANDLERS ---
    const handleSetCurrentUser = (user: User) => {
        setCurrentUser(user);
        if (user.role === 'Client') {
            setCurrentView('portal');
        } else if (currentView === 'portal') {
            setCurrentView('dashboard');
        }
    };

    const handleUpdateWorkflow = (workflowId: string, updates: Partial<Workflow>) => {
        const originalWorkflow = workflows.find(w => w.id === workflowId);
        if (!originalWorkflow) return;

        let details = 'Workflow updated. ';
        if (updates.assignee && updates.assignee !== originalWorkflow.assignee) {
            details += `Assignee changed from ${originalWorkflow.assignee} to ${updates.assignee}. `;
        }
        if (updates.isAutonomous !== undefined && updates.isAutonomous !== originalWorkflow.isAutonomous) {
            details += `Autonomous mode ${updates.isAutonomous ? 'enabled' : 'disabled'}.`;
        }

        setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, ...updates } : w));
        addAuditEntry(workflowId, 'Manual Update', details);
    };

    const handleAddNote = (workflowId: string, note: string, author: string) => {
        addAuditEntry(workflowId, 'Note Added', `${note} - by ${author}`);
        addNotification(`Note added to ${workflows.find(w => w.id === workflowId)?.clientName}`, 'success');
    };
    
    const handleDisputeWorkflow = (workflow: Workflow) => {
        setDisputingWorkflow(workflow);
    };

    const handleConfirmDispute = (workflowId: string, reason: string) => {
        setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, status: 'Disputed', disputeStatus: 'New', disputeReason: reason } : w));
        addAuditEntry(workflowId, 'Invoice Disputed', `Reason: ${reason}`);
        addNotification(`Invoice for ${workflows.find(w => w.id === workflowId)?.clientName} has been disputed.`, 'info');
        setDisputingWorkflow(null);
    };

    const handleUpdateDisputeStatus = (workflowId: string, newStatus: DisputeStatus) => {
        const workflow = workflows.find(w => w.id === workflowId);
        if (!workflow) return;
        
        setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, disputeStatus: newStatus } : w));
        addAuditEntry(workflowId, 'Dispute Status Updated', `Status changed from ${workflow.disputeStatus} to ${newStatus}.`);
    };

    // Fix: Handler to update settings state with partial updates.
    const handleUpdateSettings = useCallback((updates: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    }, []);

    const handleSendMessage = async (input: string, tone: Tone) => {
        setChatLoading(true);
        const userMessage: ChatMessage = { id: uuidv4(), role: 'user', content: input };
        const thinkingMessage: ChatMessage = { id: uuidv4(), role: 'model', isThinking: true };
        setChatMessages(prev => [...prev, userMessage, thinkingMessage]);
        
        try {
            const response = await generateResponse(input, tone, workflows, users);

            let toolCallMessage: ChatMessage | null = null;
            if (response.functionCalls && response.functionCalls.length > 0) {
                const fc = response.functionCalls[0];
                toolCallMessage = {
                    id: uuidv4(),
                    role: 'model',
                    toolCall: { name: fc.name, args: fc.args }
                };
                // Here you would execute the function call
            }

            const modelMessage: ChatMessage = {
                id: uuidv4(),
                role: 'model',
                content: response.text
            };

            setChatMessages(prev => {
                const newMessages = prev.filter(m => !m.isThinking);
                if (toolCallMessage) {
                    newMessages.push(toolCallMessage);
                }
                if (modelMessage.content) {
                    newMessages.push(modelMessage);
                }
                return newMessages;
            });
            
        } catch (error) {
            console.error("Error generating response:", error);
            const errorMessage: ChatMessage = {
                id: uuidv4(),
                role: 'model',
                content: "Sorry, I encountered an error. Please check your API key and try again."
            };
            setChatMessages(prev => [...prev.filter(m => !m.isThinking), errorMessage]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleLogCommunication = (messageContent: string, workflow: Workflow) => {
        const newComm: Communication = {
            id: uuidv4(),
            recipient: `${workflow.clientName} Accounts Payable`,
            subject: `Regarding Invoice ${workflow.externalId}`,
            body: messageContent,
            status: 'Draft',
            workflowId: workflow.id,
        };
        setCommunications(prev => [newComm, ...prev]);
        addNotification(`Email drafted for ${workflow.clientName}. Check Comms Log.`, 'success');
    };

    const handleSendCommunication = (commId: string) => {
        setCommunications(prev => prev.map(c => c.id === commId ? { ...c, status: 'Sent' } : c));
        const comm = communications.find(c => c.id === commId);
        if (comm) {
             addAuditEntry(comm.workflowId, 'Manual Communication', `Email sent to ${comm.recipient}. Subject: ${comm.subject}`);
             addNotification(`Email sent to ${comm.recipient}.`, 'success');
        }
    };
    
    const handleAnalyzeRemittance = async (text: string) => {
        setIsAnalyzingCashApp(true);
        try {
            const response = await analyzeRemittance(text, workflows);
            const matches = JSON.parse(response.text);
            setCashAppMatches(matches);
        } catch (error) {
            console.error("Error analyzing remittance:", error);
            addNotification("Failed to analyze remittance advice.", "error");
        } finally {
            setIsAnalyzingCashApp(false);
        }
    };

    const handleConfirmCashApp = (matches: any[]) => {
        let updatedWorkflows = [...workflows];
        const matchedIds = new Set<string>();

        matches.forEach(match => {
            if (match.status === 'matched' && match.workflowId) {
                const workflow = updatedWorkflows.find(w => w.id === match.workflowId);
                if (workflow && !matchedIds.has(workflow.id)) {
                    updatedWorkflows = updatedWorkflows.map(w => 
                        w.id === match.workflowId ? {
                            ...w,
                            status: 'Completed',
                            paymentDate: new Date().toISOString().split('T')[0]
                        } : w
                    );
                    addAuditEntry(match.workflowId, 'Payment Applied', `Payment of $${match.amountPaid.toLocaleString()} applied via Cash App AI.`);
                    matchedIds.add(workflow.id);
                }
            }
        });
        setWorkflows(updatedWorkflows);
        setCashAppMatches(null);
        addNotification(`${matchedIds.size} payments successfully applied.`, 'success');
    };
    
    // --- AUTONOMOUS AGENT SIMULATION ---
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (isGlobalAutonomous) {
            addNotification("Global autonomous mode activated.", "agent");
            interval = setInterval(() => {
                const overdueAndAutonomous = workflows.find(
                    w => (w.isAutonomous || isGlobalAutonomous) && w.status === 'Overdue' && Math.random() > 0.8
                );
                if (overdueAndAutonomous) {
                    addNotification(`Agent sent automated reminder for ${overdueAndAutonomous.clientName}.`, 'agent');
                    addAuditEntry(overdueAndAutonomous.id, 'Automated Reminder', 'Sent "First Reminder" email based on dunning plan.');
                }
            }, 5000);
        } else if (interval) {
            addNotification("Global autonomous mode deactivated.", "info");
        }

        return () => clearInterval(interval);
    }, [isGlobalAutonomous, workflows, addNotification, addAuditEntry]);

    const clientWorkflows = workflows.filter(w => w.clientName === currentUser.clientName);
    
    if (!process.env.API_KEY) {
        return (
             <div className="bg-slate-900 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-2xl p-6 border border-red-500/50 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Configuration Error</h1>
                    <p className="text-slate-300">
                        The Gemini API key is not configured. Please set the <code className="bg-slate-700 p-1 rounded font-mono text-sm">API_KEY</code> environment variable to use this application.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-900 text-slate-300 font-sans min-h-screen">
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <Header 
                    onOpenSettings={() => setSettingsOpen(true)}
                    currentView={currentView}
                    onSetView={setCurrentView}
                    users={users}
                    currentUser={currentUser}
                    onSetCurrentUser={handleSetCurrentUser}
                    isGlobalAutonomous={isGlobalAutonomous}
                    onSetGlobalAutonomous={setGlobalAutonomous}
                />
                
                {currentView === 'dashboard' && (
                    <Dashboard 
                        workflows={workflows}
                        currentUser={currentUser}
                        users={users}
                        onUpdateWorkflow={handleUpdateWorkflow}
                        onAddNote={handleAddNote}
                        chatMessages={chatMessages}
                        isChatLoading={isChatLoading}
                        onSendMessage={handleSendMessage}
                        onLogCommunication={handleLogCommunication}
                        communications={communications}
                        onSendCommunication={handleSendCommunication}
                        remittanceText={remittanceText}
                        onSetRemittanceText={setRemittanceText}
                        isAnalyzingCashApp={isAnalyzingCashApp}
                        onAnalyzeRemittance={handleAnalyzeRemittance}
                        onSimulateRemittance={() => setRemittanceText(MOCK_REMITTANCE_ADVICE)}
                        onDisputeWorkflow={handleDisputeWorkflow}
                    />
                )}
                {currentView === 'analytics' && <Analytics workflows={workflows} users={users} scenarioWorkflows={scenarioWorkflows} onClearScenario={() => setScenarioWorkflows(null)} />}
                {/* Fix: Passed correct handler for updating settings. */}
                {currentView === 'integrations' && <IntegrationsHub settings={settings} onUpdateSettings={handleUpdateSettings} />}
                {currentView === 'knowledge' && <KnowledgeBase />}
                {currentView === 'disputes' && <DisputesHub disputedWorkflows={workflows.filter(w => w.status === 'Disputed')} onUpdateDisputeStatus={handleUpdateDisputeStatus} />}
                {currentView === 'portal' && <PaymentPortal user={currentUser} workflows={clientWorkflows} />}
            </div>
            
            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setSettingsOpen(false)}
                settings={settings}
                // Fix: Passed correct handler for updating settings.
                onUpdateSettings={handleUpdateSettings}
            />
            
            <DisputeModal 
                isOpen={!!disputingWorkflow}
                onClose={() => setDisputingWorkflow(null)}
                workflow={disputingWorkflow}
                onConfirm={handleConfirmDispute}
            />

            <CashAppConfirmationModal
                isOpen={!!cashAppMatches}
                onClose={() => setCashAppMatches(null)}
                matches={cashAppMatches || []}
                onConfirm={handleConfirmCashApp}
            />

            <NotificationToaster 
                notifications={notifications}
                onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />
        </div>
    );
};

export default App;
