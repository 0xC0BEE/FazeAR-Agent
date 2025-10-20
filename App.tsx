


import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { NotificationToaster } from './components/NotificationToaster.tsx';
import { MOCK_USERS, MOCK_WORKFLOWS, MOCK_SETTINGS } from './mockData.ts';
// Fix: Import the centralized 'View' type.
import type { User, Workflow, ChatMessage, Settings, Notification as NotificationType, Tone, Match, DisputeStatus, View } from './types.ts';
import { generateChatResponse, analyzeRemittanceAdvice, runAnalyticsQuery, generateWhatIfScenario, initializeAi } from './services/geminiService.ts';
import { Analytics } from './components/Analytics.tsx';
import { IntegrationsHub } from './components/IntegrationsHub.tsx';
import { PaymentPortal } from './components/PaymentPortal.tsx';
import { KnowledgeBase } from './components/KnowledgeBase.tsx';
import { DisputesHub } from './components/DisputesHub.tsx';
import { InvoiceModal } from './components/InvoiceModal.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { LiveCallModal } from './components/LiveCallModal.tsx';
import { DisputeDetailModal } from './components/DisputeDetailModal.tsx';


// Fix: Removed local 'View' type definition. It's now imported from types.ts.

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [users] = useState<User[]>(MOCK_USERS);
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
    const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
    const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [view, setView] = useState<View>('dashboard');
    
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: uuidv4(), role: 'model', content: "Hello! I'm the FazeAR AI assistant. How can I help you manage your accounts receivable today?" }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isGlobalAutonomous, setGlobalAutonomous] = useState(false);
    
    const [scenarioWorkflows, setScenarioWorkflows] = useState<Workflow[] | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Workflow | null>(null);
    const [callingWorkflow, setCallingWorkflow] = useState<Workflow | null>(null);
    const [viewingDispute, setViewingDispute] = useState<Workflow | null>(null);
    const [pendingMatches, setPendingMatches] = useState<Match[] | null>(null);

    useEffect(() => {
        // Check for client portal link first
        const urlParams = new URLSearchParams(window.location.search);
        const clientName = urlParams.get('client_name');
        if (clientName) {
            const clientUser = MOCK_USERS.find(u => u.role === 'Client' && u.clientName === clientName);
            if (clientUser) {
                setCurrentUser(clientUser);
                // No API key needed for client portal view
                setApiKey('CLIENT_PORTAL_MODE'); 
                return;
            }
        }

        const storedKey = sessionStorage.getItem('gemini-api-key');
        if (storedKey) {
            setApiKey(storedKey);
        }
    }, []);

    useEffect(() => {
        if (apiKey && apiKey !== 'CLIENT_PORTAL_MODE') {
            initializeAi(apiKey);
        }
    }, [apiKey]);

    // Autonomous agent simulation
    useEffect(() => {
        // Fix: Changed NodeJS.Timeout to number, which is the correct type for setInterval in a browser environment.
        let interval: number | undefined;
        if (isGlobalAutonomous) {
            interval = setInterval(() => {
                const autonomousWorkflows = workflows.filter(w => w.isAutonomous || isGlobalAutonomous);
                const overdue = autonomousWorkflows.find(w => w.status === 'Overdue' && w.communications.every(c => c.status === 'Sent'));

                if (overdue) {
                     const plan = settings.dunningPlans.find(p => p.id === overdue.dunningPlanId);
                     if (plan) {
                        const dueDate = new Date(overdue.dueDate);
                        const today = new Date();
                        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
                        
                        const nextStep = plan.steps.find(s => s.day <= daysOverdue && !overdue.communications.some(c => c.subject.includes(s.template)));

                        if (nextStep) {
                            addNotification('agent', `Agent is drafting a "${nextStep.template}" for ${overdue.clientName}.`);
                            
                            const newComm = {
                                id: uuidv4(),
                                recipient: `${overdue.clientName.replace(/\s/g, '.').toLowerCase()}@example.com`,
                                subject: `Invoice ${overdue.externalId}: ${nextStep.template}`,
                                body: `Hi team,\n\nThis is a friendly reminder that invoice ${overdue.externalId} for $${overdue.amount.toLocaleString()} was due on ${overdue.dueDate}.\n\nPlease let us know when we can expect payment.\n\nBest,\n${currentUser.name}`,
                                status: 'Draft' as const,
                                timestamp: new Date().toISOString()
                            };

                            setWorkflows(prev => prev.map(w => w.id === overdue.id ? {...w, communications: [...w.communications, newComm]} : w));
                        }
                     }
                }
            }, 7000);
        }
        return () => clearInterval(interval);
    }, [isGlobalAutonomous, workflows, settings.dunningPlans, currentUser.name]);
    
    const addNotification = (type: NotificationType['type'], message: string) => {
        const newNotification: NotificationType = { id: uuidv4(), type, message };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    const handleUpdateSettings = (updatedSettings: Partial<Settings>) => {
        setSettings(prev => ({...prev, ...updatedSettings}));
        addNotification('success', 'Settings updated successfully.');
    };

    const handleSendMessage = async (input: string, tone: Tone) => {
        setIsChatLoading(true);
        const userMessage: ChatMessage = { id: uuidv4(), role: 'user', content: input };
        setChatMessages(prev => [...prev, userMessage]);

        const thinkingMessage: ChatMessage = { id: uuidv4(), role: 'model', content: null, isThinking: true };
        setChatMessages(prev => [...prev, thinkingMessage]);
        
        try {
            if (input.toLowerCase().includes('what if') || input.toLowerCase().includes('impact on cash flow')) {
                const scenarioResult = await generateWhatIfScenario(input, workflows);
                setScenarioWorkflows(scenarioResult);
                const agentMessage: ChatMessage = { id: uuidv4(), role: 'model', content: "I've run the scenario. You can see the impact on the cash flow forecast on the Analytics page."};
                setChatMessages(prev => prev.filter(m => !m.isThinking).concat(agentMessage));
                setView('analytics');
                addNotification('info', '"What-if" scenario has been applied.');

            } else if (input.toLowerCase().includes('report') || input.toLowerCase().includes('who is') || input.toLowerCase().includes('which client')) {
                 const analyticsResult = await runAnalyticsQuery(input, workflows, users);
                 const agentMessage: ChatMessage = { id: uuidv4(), role: 'model', content: analyticsResult };
                 setChatMessages(prev => prev.filter(m => !m.isThinking).concat(agentMessage));
            } else {
                const response = await generateChatResponse(input, tone, workflows);
                
                 setChatMessages(prev => {
                    const newMessages = prev.filter(m => !m.isThinking);
                    if (response.toolCall) {
                        newMessages.push({
                            id: uuidv4(),
                            role: 'model',
                            content: "Okay, I can do that.",
                            toolCall: response.toolCall,
                        });
                        handleToolCall(response.toolCall.name, response.toolCall.args);
                    } else if (response.text) {
                         newMessages.push({
                            id: uuidv4(),
                            role: 'model',
                            content: response.text
                        });
                    } else {
                        newMessages.push({
                            id: uuidv4(),
                            role: 'model',
                            content: "I'm not sure how to respond to that."
                        });
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { id: uuidv4(), role: 'model', content: "Sorry, I encountered an error. Please try again." };
            setChatMessages(prev => prev.filter(m => !m.isThinking).concat(errorMessage));
        } finally {
            setIsChatLoading(false);
        }
    };
    
    const handleToolCall = (name: string, args: any) => {
        let success = false;
        let details = '';

        const findWorkflow = (clientName: string) => workflows.find(w => w.clientName.toLowerCase().includes(clientName.toLowerCase()));

        switch (name) {
            case 'assign_workflow':
                const { clientName, assigneeName } = args;
                const workflowToAssign = findWorkflow(clientName);
                const assignee = users.find(u => u.name.toLowerCase().includes(assigneeName.toLowerCase()));
                if (workflowToAssign && assignee) {
                    setWorkflows(prev => prev.map(w => w.id === workflowToAssign.id ? { ...w, assignee: assignee.name } : w));
                    details = `Assigned ${workflowToAssign.clientName} to ${assignee.name}.`;
                    success = true;
                } else {
                    details = `Could not find workflow for "${clientName}" or assignee "${assigneeName}".`;
                }
                break;
            case 'add_note_to_workflow':
                const { clientName: noteClientName, note } = args;
                const workflowForNote = findWorkflow(noteClientName);
                if (workflowForNote) {
                    const newAuditEntry = {
                        timestamp: new Date().toISOString(),
                        activity: `Note Added by ${currentUser.name}`,
                        details: note,
                    };
                    setWorkflows(prev => prev.map(w => w.id === workflowForNote.id ? {...w, auditTrail: [...w.auditTrail, newAuditEntry]} : w));
                    details = `Added note to ${workflowForNote.clientName}.`;
                    success = true;
                } else {
                     details = `Could not find workflow for "${noteClientName}".`;
                }
                break;
            case 'dispute_invoice':
                const { clientName: disputeClientName, reason } = args;
                const workflowToDispute = findWorkflow(disputeClientName);
                if (workflowToDispute) {
                    handleDisputeWorkflow(workflowToDispute.id, reason);
                    details = `Disputed invoice for ${workflowToDispute.clientName}. Reason: ${reason}`;
                    success = true;
                } else {
                    details = `Could not find workflow for "${disputeClientName}".`;
                }
                break;
            case 'view_invoice':
                const { clientName: viewClientName } = args;
                const workflowToView = findWorkflow(viewClientName);
                if (workflowToView) {
                    setViewingInvoice(workflowToView);
                    details = `Showing invoice for ${workflowToView.clientName}.`;
                    success = true;
                } else {
                    details = `Could not find workflow for "${viewClientName}".`;
                }
                break;
            default:
                details = `Unknown tool: ${name}`;
                break;
        }
        
        if (success) {
            addNotification('success', details);
        } else {
            addNotification('error', `Tool call failed: ${details}`);
        }
    };
    
    const handleLogCommunication = (messageContent: string, workflow: Workflow) => {
        const newComm = {
            id: uuidv4(),
            recipient: `${workflow.clientName.replace(/\s/g, '.').toLowerCase()}@example.com`,
            subject: `Regarding Invoice ${workflow.externalId}`,
            body: messageContent,
            status: 'Draft' as const,
            timestamp: new Date().toISOString()
        };
        setWorkflows(prev => prev.map(w => w.id === workflow.id ? {...w, communications: [...w.communications, newComm]} : w));
        addNotification('success', `Communication draft logged for ${workflow.clientName}.`);
    };

    const handleAnalyzeRemittance = async (text: string) => {
        setIsChatLoading(true);
        try {
            const matches = await analyzeRemittanceAdvice(text, workflows);
            return matches;
        } catch (error) {
            console.error('Error analyzing remittance:', error);
            addNotification('error', 'Failed to analyze remittance advice.');
            return [];
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleConfirmMatches = (matches: Match[]) => {
        const matchedWorkflowIds = matches.filter(m => m.workflowId).map(m => m.workflowId);
        
        setWorkflows(prev => prev.map(w => {
            if (matchedWorkflowIds.includes(w.id)) {
                const paymentDate = new Date().toISOString();
                const newAuditEntry = {
                    timestamp: paymentDate,
                    activity: 'Payment Applied',
                    details: 'Matched via Cash Application AI.',
                };
                return {
                    ...w,
                    status: 'Completed',
                    paymentDate: paymentDate,
                    auditTrail: [...w.auditTrail, newAuditEntry]
                };
            }
            return w;
        }));
        addNotification('success', `${matchedWorkflowIds.length} payments successfully applied.`);
    };
    
    const handleDisputeWorkflow = (workflowId: string, reason: string) => {
        const newAuditEntry = {
            timestamp: new Date().toISOString(),
            activity: `Invoice Disputed by ${currentUser.name}`,
            details: `Reason: ${reason}`,
        };
        setWorkflows(prev => prev.map(w => w.id === workflowId ? {
            ...w,
            status: 'Disputed',
            disputeStatus: 'New',
            disputeReason: reason,
            auditTrail: [...w.auditTrail, newAuditEntry]
        } : w));
        addNotification('info', 'Invoice has been moved to the Disputes Hub.');
    };

    const handleClientDispute = (workflowId: string, reason: string, clientName: string) => {
        const newAuditEntry = {
            timestamp: new Date().toISOString(),
            activity: 'Dispute Initiated by Client',
            details: `Submitted via Client Portal. Reason: ${reason}`,
        };
        setWorkflows(prev => prev.map(w => w.id === workflowId ? {
            ...w,
            status: 'Disputed',
            disputeStatus: 'New',
            disputeReason: reason,
            auditTrail: [...w.auditTrail, newAuditEntry]
        } : w));
        addNotification('info', `New dispute submitted by ${clientName} for invoice. See Disputes Hub.`);
    };
    
    const handleUpdateDisputeStatus = (workflowId: string, newStatus: DisputeStatus) => {
        const newAuditEntry = {
            timestamp: new Date().toISOString(),
            activity: 'Dispute Status Updated',
            details: `Status changed to "${newStatus}" by ${currentUser.name}.`
        };
        setWorkflows(prev => prev.map(w => w.id === workflowId ? {
            ...w,
            disputeStatus: newStatus,
            auditTrail: [...w.auditTrail, newAuditEntry],
            ...(newStatus === 'Resolved' && { status: w.amount > 0 ? 'In Progress' : 'Completed' })
        } : w));
        addNotification('info', `Dispute status updated to "${newStatus}".`);
    };

    const handleDisputeAction = async (workflow: Workflow, actionPrompt: string, actionTitle: string) => {
        addNotification('agent', `Agent is handling: "${actionTitle}"`);
        const response = await generateChatResponse(actionPrompt, 'Default', workflows);
        if (response.text) {
            handleLogCommunication(response.text, workflow);
            setViewingDispute(null); // Close modal on action
        } else {
            addNotification('error', 'AI could not complete the action.');
        }
    };

    const handleSaveApiKey = (key: string) => {
        sessionStorage.setItem('gemini-api-key', key);
        setApiKey(key);
    };

    const handleAutomatedRemittanceAnalysis = async (text: string) => {
        addNotification('agent', `Agent detected new remittance advice and is analyzing it...`);
        try {
            const matches = await analyzeRemittanceAdvice(text, workflows);
            if (matches && matches.length > 0) {
                setPendingMatches(matches);
                addNotification('success', `Agent found ${matches.length} potential payment matches. Review them in the 'Cash App' panel.`);
            } else {
                addNotification('info', `Agent analyzed remittance advice but found no matches.`);
            }
        } catch (error) {
            console.error('Error during automated remittance analysis:', error);
            addNotification('error', 'Agent failed to analyze remittance advice.');
        }
    };

    const handleSimulatedEvent = (type: string, data: any) => {
        const eventTitle = type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        switch (type) {
            case 'new_invoice':
                addNotification('info', `Simulated Event: ${eventTitle}`);
                const newWorkflow: Workflow = {
                    id: uuidv4(),
                    clientName: data.clientName,
                    amount: data.amount,
                    dueDate: data.dueDate,
                    externalId: data.externalId,
                    status: 'In Progress',
                    assignee: 'Unassigned',
                    isAutonomous: false,
                    auditTrail: [{ timestamp: new Date().toISOString(), activity: 'Invoice Created', details: 'Simulated from QuickBooks integration.' }],
                    communications: [],
                    dunningPlanId: 'plan_standard_v1',
                    disputeStatus: null,
                    disputeReason: null,
                    createdDate: new Date().toISOString().split('T')[0],
                    paymentDate: null,
                    items: [{ description: 'Simulated Service Item', quantity: 1, price: data.amount }]
                };
                setWorkflows(prev => [newWorkflow, ...prev]);
                break;
            case 'payment_received':
                addNotification('info', `Simulated Event: ${eventTitle}`);
                 const newAuditEntry = {
                    timestamp: new Date().toISOString(),
                    activity: 'Payment Received',
                    details: 'Simulated from Stripe integration.',
                };
                setWorkflows(prev => prev.map(w => w.id === data.id ? { ...w, status: 'Completed', paymentDate: new Date().toISOString(), auditTrail: [...w.auditTrail, newAuditEntry] } : w));
                break;
            case 'remittance_advice':
                handleAutomatedRemittanceAnalysis(data.text);
                break;
        }
    };

    if (!apiKey) {
        return <ApiKeyModal onSave={handleSaveApiKey} />;
    }

    const clientWorkflows = currentUser.role === 'Client' ? workflows.filter(w => w.clientName === currentUser.clientName) : [];

    const currentView = () => {
        if (currentUser.role === 'Client') return <PaymentPortal user={currentUser} workflows={clientWorkflows} onDispute={handleClientDispute} />;
        
        switch (view) {
            case 'dashboard':
                return <Dashboard
                    workflows={workflows}
                    currentUser={currentUser}
                    messages={chatMessages}
                    isLoading={isChatLoading}
                    settings={settings}
                    onSendMessage={handleSendMessage}
                    onLogCommunication={handleLogCommunication}
                    onAnalyzeRemittance={handleAnalyzeRemittance}
                    onConfirmMatches={handleConfirmMatches}
                    onDisputeWorkflow={handleDisputeWorkflow}
                    onUpdateWorkflow={setWorkflows}
                    onAddNotification={addNotification}
                    onViewInvoice={(workflow) => setViewingInvoice(workflow)}
                    onInitiateCall={(workflow) => setCallingWorkflow(workflow)}
                    pendingMatches={pendingMatches}
                    onClearPendingMatches={() => setPendingMatches(null)}
                    // Fix: Pass users prop to Dashboard component.
                    users={users}
                />
            case 'analytics':
                return <Analytics 
                    workflows={workflows} 
                    users={users} 
                    scenarioWorkflows={scenarioWorkflows} 
                    onClearScenario={() => setScenarioWorkflows(null)}
                />;
            case 'integrations':
                return <IntegrationsHub 
                    settings={settings} 
                    onUpdateSettings={handleUpdateSettings}
                    workflows={workflows}
                    onSimulateEvent={handleSimulatedEvent}
                />;
            case 'knowledge':
                return <KnowledgeBase />;
            case 'disputes':
                 return <DisputesHub 
                    disputedWorkflows={workflows.filter(w => w.status === 'Disputed')}
                    onUpdateDisputeStatus={handleUpdateDisputeStatus}
                    onOpenDispute={(workflow) => setViewingDispute(workflow)}
                 />;
            default:
                return <Dashboard
                     workflows={workflows}
                     currentUser={currentUser}
                     messages={chatMessages}
                     isLoading={isChatLoading}
                     settings={settings}
                     onSendMessage={handleSendMessage}
                     onLogCommunication={handleLogCommunication}
                     onAnalyzeRemittance={handleAnalyzeRemittance}
                     onConfirmMatches={handleConfirmMatches}
                     onDisputeWorkflow={handleDisputeWorkflow}
                     onUpdateWorkflow={setWorkflows}
                     onAddNotification={addNotification}
                     onViewInvoice={(workflow) => setViewingInvoice(workflow)}
                     onInitiateCall={(workflow) => setCallingWorkflow(workflow)}
                     pendingMatches={pendingMatches}
                     onClearPendingMatches={() => setPendingMatches(null)}
                     // Fix: Pass users prop to Dashboard component.
                     users={users}
                 />;
        }
    }

    return (
        <div className="bg-background text-foreground h-screen flex flex-col">
            <header className="flex-shrink-0 p-4 sm:p-6 lg:p-8 pb-0">
                 <Header 
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    currentView={view}
                    onSetView={setView}
                    users={users}
                    currentUser={currentUser}
                    onSetCurrentUser={setCurrentUser}
                    isGlobalAutonomous={isGlobalAutonomous}
                    onSetGlobalAutonomous={setGlobalAutonomous}
                />
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-6 overflow-hidden flex flex-col">
                <div className="max-w-screen-2xl mx-auto w-full flex-1">
                    {currentView()}
                </div>
            </main>
            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
            />
            <NotificationToaster 
                notifications={notifications}
                onDismiss={dismissNotification}
            />
            <InvoiceModal
                isOpen={!!viewingInvoice}
                onClose={() => setViewingInvoice(null)}
                workflow={viewingInvoice}
            />
            <LiveCallModal
                isOpen={!!callingWorkflow}
                onClose={() => setCallingWorkflow(null)}
                workflow={callingWorkflow}
                onAddNote={(note) => {
                    if (callingWorkflow) {
                         const newAuditEntry = {
                            timestamp: new Date().toISOString(),
                            activity: `Note Added by ${currentUser.name}`,
                            details: `AI Call Summary:\n\n${note}`,
                        };
                        setWorkflows(prev => prev.map(w => w.id === callingWorkflow.id ? {...w, auditTrail: [...w.auditTrail, newAuditEntry]} : w));
                        addNotification('success', 'Call summary added to notes.');
                    }
                }}
            />
            <DisputeDetailModal
                isOpen={!!viewingDispute}
                onClose={() => setViewingDispute(null)}
                workflow={viewingDispute}
                onExecuteAction={handleDisputeAction}
            />
        </div>
    );
};

export default App;