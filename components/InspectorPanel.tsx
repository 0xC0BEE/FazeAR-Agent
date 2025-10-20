import React, { useState } from 'react';
import type { Workflow, User, Match, Settings } from '../types.ts';
import { NoteIcon } from './icons/NoteIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { ClipboardListIcon } from './icons/ClipboardListIcon.tsx';
import { CashAppPanel } from './CashAppPanel.tsx';
import { CommunicationsLog } from './CommunicationsLog.tsx';
import { MOCK_REMITTANCE_ADVICE } from '../mockData.ts';
import { CashAppConfirmationModal } from './CashAppConfirmationModal.tsx';
import { ExclamationIcon } from './icons/ExclamationIcon.tsx';
import { AuditTrailModal } from './AuditTrailModal.tsx';
import { DocumentIcon } from './icons/DocumentIcon.tsx';
import { PhoneIcon } from './icons/PhoneIcon.tsx';
import { ShareIcon } from './icons/ShareIcon.tsx';
import { Button } from './ui/Button.tsx';
import { Textarea } from './ui/Textarea.tsx';
import { Switch } from './ui/Switch.tsx';
import { Label } from './ui/Label.tsx';

type ActionTab = 'actions' | 'cash-app' | 'comms';

interface InspectorPanelProps {
  workflow: Workflow | null;
  users: User[];
  settings: Settings;
  onAnalyzeRemittance: (text: string) => Promise<Match[]>;
  onConfirmMatches: (matches: Match[]) => void;
  onDisputeWorkflow: (workflowId: string, reason: string) => void;
  onUpdateWorkflow: React.Dispatch<React.SetStateAction<Workflow[]>>;
  onAddNotification: (type: 'agent' | 'success' | 'error' | 'info', message: string) => void;
  onViewInvoice: (workflow: Workflow) => void;
  onInitiateCall: (workflow: Workflow) => void;
  pendingMatches: Match[] | null;
  onClearPendingMatches: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ 
    workflow, 
    settings,
    onAnalyzeRemittance, 
    onConfirmMatches, 
    onDisputeWorkflow, 
    onUpdateWorkflow, 
    onAddNotification,
    onViewInvoice,
    onInitiateCall,
    pendingMatches,
    onClearPendingMatches
}) => {
  const [actionTab, setActionTab] = useState<ActionTab>('actions');
  const [isAuditModalOpen, setAuditModalOpen] = useState(false);
  const [remittanceText, setRemittanceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [note, setNote] = useState('');

  // Reset state when workflow changes
  React.useEffect(() => {
    setActionTab('actions');
    setNote('');
  }, [workflow?.id]);

  if (!workflow) {
    return (
      <div className="flex flex-col h-full bg-card rounded-lg shadow-lg border items-center justify-center text-center p-6">
        <ClipboardListIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-card-foreground">Inspector Panel</h3>
        <p className="text-sm text-muted-foreground">Select a workflow from the tracker to view its details and take action.</p>
         {pendingMatches && (
            <div className="mt-6 bg-secondary border border-border rounded-lg p-3 text-center w-full">
                <p className="text-sm font-semibold text-secondary-foreground mb-2">The AI agent has analyzed a remittance advice email.</p>
                <Button 
                    onClick={() => {
                        setMatches(pendingMatches);
                        setConfirmModalOpen(true);
                        onClearPendingMatches();
                    }}
                    size="sm"
                >
                    Review {pendingMatches.length} Suggested Matches
                </Button>
            </div>
        )}
      </div>
    );
  }
  
  const handleToggleAutonomous = () => {
      onUpdateWorkflow(prev => prev.map(w => w.id === workflow.id ? { ...w, isAutonomous: !w.isAutonomous } : w));
      const status = !workflow.isAutonomous ? 'enabled' : 'disabled';
      onAddNotification('agent', `Autonomous mode ${status} for ${workflow.clientName}.`);
  };

  const handleSimulateRemittance = () => {
    setRemittanceText(MOCK_REMITTANCE_ADVICE);
  };
  
  const handleAnalyze = async () => {
    if (!remittanceText.trim()) return;
    setIsLoading(true);
    const result = await onAnalyzeRemittance(remittanceText);
    setIsLoading(false);
    if (result.length > 0) {
        setMatches(result);
        setConfirmModalOpen(true);
    } else {
        onAddNotification('error', 'No payment matches could be found from the provided text.');
    }
  };

  const handleShowPendingMatches = () => {
    if (pendingMatches) {
        setMatches(pendingMatches);
        setConfirmModalOpen(true);
        onClearPendingMatches();
    }
  };

  const handleConfirmAndClose = (confirmedMatches: Match[]) => {
    onConfirmMatches(confirmedMatches);
    setConfirmModalOpen(false);
    setRemittanceText('');
    setMatches([]);
  };
  
  const handleSendCommunication = (commId: string) => {
    const isGmailConnected = settings.integrations.find(i => i.id === 'gmail')?.connected;

    if (isGmailConnected) {
        onUpdateWorkflow(prev => prev.map(w => {
            if (w.id !== workflow.id) return w;
            
            const comm = w.communications.find(c => c.id === commId);
            const updatedComms = w.communications.map(c => c.id === commId ? { ...c, status: 'Sent' as const } : c);
            const newAuditEntry = {
                timestamp: new Date().toISOString(),
                activity: 'Email Sent via Gmail',
                details: `Sent "${comm?.subject}" to ${comm?.recipient}.`,
            };
            return { ...w, communications: updatedComms, auditTrail: [...w.auditTrail, newAuditEntry] };
        }));
        const comm = workflow.communications.find(c => c.id === commId);
        onAddNotification('success', `Email sent to ${comm?.recipient} via Gmail.`);
    } else {
        onAddNotification('info', 'Please connect Gmail in the Integrations Hub to send emails.');
    }
  };

  const handleAddNote = () => {
      if (!note.trim()) return;
      const newAuditEntry = {
          timestamp: new Date().toISOString(),
          activity: `Note added by ${'Alice (Admin)'}`, // Placeholder for current user
          details: note
      };
      onUpdateWorkflow(prev => prev.map(w => w.id === workflow.id ? {...w, auditTrail: [...w.auditTrail, newAuditEntry]} : w));
      setNote('');
      onAddNotification('success', 'Note added successfully.');
  }
  
  const handleSharePortalLink = () => {
    const portalUrl = `${window.location.origin}${window.location.pathname}?client_name=${encodeURIComponent(workflow.clientName)}`;
    navigator.clipboard.writeText(portalUrl).then(() => {
        onAddNotification('success', 'Client portal link copied to clipboard!');
    }, (err) => {
        console.error('Could not copy text: ', err);
        onAddNotification('error', 'Failed to copy link.');
    });
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg shadow-lg border">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <h3 className="text-lg font-semibold text-card-foreground truncate">{workflow.clientName}</h3>
        <p className="text-sm text-muted-foreground">Invoice <span className="font-mono">{workflow.externalId}</span></p>
      </div>

      {/* Action Hub Tabs */}
      <div className="border-b flex-shrink-0">
           <nav className="flex">
              <button onClick={() => setActionTab('actions')} className={`flex-1 py-2 text-xs font-semibold transition-colors ${actionTab === 'actions' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>Actions & Details</button>
              <button onClick={() => setActionTab('comms')} className={`flex-1 py-2 text-xs font-semibold transition-colors ${actionTab === 'comms' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>Comms Log</button>
              <button onClick={() => setActionTab('cash-app')} className={`flex-1 py-2 text-xs font-semibold transition-colors ${actionTab === 'cash-app' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>Cash App</button>
          </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto">
        {actionTab === 'actions' && (
            <div className="p-4 space-y-4">
                {/* Details */}
                <div className="text-sm space-y-3">
                     <div className="flex justify-between">
                        <p className="text-muted-foreground">Amount:</p> <p className="font-mono font-semibold text-foreground">${workflow.amount.toLocaleString()}</p>
                    </div>
                     <div className="flex justify-between">
                        <p className="text-muted-foreground">Due Date:</p> <p className="font-semibold text-foreground">{new Date(workflow.dueDate).toLocaleDateString()}</p>
                    </div>
                     <div className="flex justify-between">
                        <p className="text-muted-foreground">Status:</p> 
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${workflow.status === 'Overdue' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{workflow.status}</span>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Assignee:</p> <p className="font-semibold text-foreground">{workflow.assignee}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t">
                    <Button onClick={() => onViewInvoice(workflow)} variant="outline" className="w-full justify-start gap-2">
                        <DocumentIcon className="w-5 h-5"/> View Invoice
                    </Button>
                    <Button onClick={handleSharePortalLink} variant="outline" className="w-full justify-start gap-2">
                        <ShareIcon className="w-5 h-5"/> Share Portal Link
                    </Button>
                    <Button onClick={() => onInitiateCall(workflow)} variant="outline" className="w-full justify-start gap-2 text-green-500 border-green-500/50 hover:bg-green-500/10 hover:text-green-400">
                        <PhoneIcon className="w-5 h-5"/> AI Live Call
                    </Button>
                    <div className="flex items-center gap-2 bg-background border rounded-lg pl-3 pr-2 py-2 text-sm">
                        <Label htmlFor="workflow-autonomous" className="flex items-center gap-1.5 flex-grow cursor-pointer">
                            <BotIcon className={`w-5 h-5 transition-colors ${workflow.isAutonomous ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`font-semibold ${workflow.isAutonomous ? 'text-foreground' : 'text-muted-foreground'}`}>Autonomous</span>
                        </Label>
                         <Switch
                            id="workflow-autonomous"
                            checked={workflow.isAutonomous}
                            onCheckedChange={handleToggleAutonomous}
                          />
                    </div>
                    <Button onClick={() => onDisputeWorkflow(workflow.id, 'Disputed via UI')} variant="outline" className="w-full justify-start gap-2 text-amber-500 border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400">
                        <ExclamationIcon className="w-5 h-5"/> Dispute Invoice
                    </Button>
                </div>

                {/* Add Note */}
                <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="add-note" className="text-sm font-semibold text-foreground flex items-center gap-2"><NoteIcon className="w-4 h-4"/> Add Note</Label>
                    <Textarea id="add-note" value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Log a call, promise to pay, etc..."/>
                    <Button onClick={handleAddNote} className="w-full" disabled={!note.trim()}>Add Note</Button>
                </div>

                {/* Audit Trail Snippet */}
                <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-semibold text-foreground">Recent Activity</h4>
                     <ul className="space-y-3 text-xs">
                        {[...workflow.auditTrail].reverse().slice(0, 3).map(entry => (
                            <li key={entry.timestamp} className="border-l-2 pl-3">
                                <p className="font-semibold text-foreground">{entry.activity}</p>
                                <p className="text-muted-foreground truncate">{entry.details}</p>
                                <p className="text-muted-foreground/80 font-mono text-xs">{new Date(entry.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                    {workflow.auditTrail.length > 3 && (
                        <Button onClick={() => setAuditModalOpen(true)} variant="link" size="sm" className="w-full">View Full Audit Trail</Button>
                    )}
                </div>
            </div>
        )}
        
        {actionTab === 'comms' && (
             <CommunicationsLog communications={workflow.communications} onSend={handleSendCommunication} />
        )}
        
        {actionTab === 'cash-app' && (
           <CashAppPanel 
                remittanceText={remittanceText}
                onSetRemittanceText={setRemittanceText}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                onSimulate={handleSimulateRemittance}
                pendingMatches={pendingMatches}
                onShowPendingMatches={handleShowPendingMatches}
           />
        )}
      </div>
      
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        workflow={workflow}
      />
      <CashAppConfirmationModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        matches={matches}
        onConfirm={handleConfirmAndClose}
      />
    </div>
  );
};