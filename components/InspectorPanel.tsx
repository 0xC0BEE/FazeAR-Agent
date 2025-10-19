import React, { useState } from 'react';
import type { Workflow, User, Communication, AuditLogEntry, Match, Settings } from '../types.ts';
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
      <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 items-center justify-center text-center p-6">
        <ClipboardListIcon className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="font-semibold text-white">Inspector Panel</h3>
        <p className="text-sm text-slate-400">Select a workflow from the tracker to view its details and take action.</p>
         {pendingMatches && (
            <div className="mt-6 bg-purple-900/50 border border-purple-700 rounded-lg p-3 text-center w-full">
                <p className="text-sm font-semibold text-purple-200 mb-2">The AI agent has analyzed a remittance advice email.</p>
                <button 
                    onClick={() => {
                        setMatches(pendingMatches);
                        setConfirmModalOpen(true);
                        onClearPendingMatches();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-md text-xs"
                >
                    Review {pendingMatches.length} Suggested Matches
                </button>
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
      const newAuditEntry: AuditLogEntry = {
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
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white truncate">{workflow.clientName}</h3>
        <p className="text-sm text-slate-400">Invoice <span className="font-mono">{workflow.externalId}</span></p>
      </div>

      {/* Action Hub Tabs */}
      <div className="border-b border-slate-700 flex-shrink-0">
           <nav className="flex">
              <button onClick={() => setActionTab('actions')} className={`flex-1 py-2 text-xs font-semibold transition-colors ${actionTab === 'actions' ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>Actions & Details</button>
              <button onClick={() => setActionTab('comms')} className={`flex-1 py-2 text-xs font-semibold transition-colors ${actionTab === 'comms' ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>Comms Log</button>
              <button onClick={() => setActionTab('cash-app')} className={`flex-1 py-2 text-xs font-semibold transition-colors ${actionTab === 'cash-app' ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>Cash App</button>
          </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto">
        {actionTab === 'actions' && (
            <div className="p-4 space-y-4">
                {/* Details */}
                <div className="text-sm space-y-3">
                     <div className="flex justify-between">
                        <p className="text-slate-400">Amount:</p> <p className="font-mono font-semibold text-white">${workflow.amount.toLocaleString()}</p>
                    </div>
                     <div className="flex justify-between">
                        <p className="text-slate-400">Due Date:</p> <p className="font-semibold text-white">{new Date(workflow.dueDate).toLocaleDateString()}</p>
                    </div>
                     <div className="flex justify-between">
                        <p className="text-slate-400">Status:</p> 
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${workflow.status === 'Overdue' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>{workflow.status}</span>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-slate-400">Assignee:</p> <p className="font-semibold text-white">{workflow.assignee}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                    <button onClick={() => onViewInvoice(workflow)} className="w-full flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold p-2 rounded-lg text-sm transition-colors">
                        <DocumentIcon className="w-5 h-5"/> View Invoice
                    </button>
                    <button onClick={handleSharePortalLink} className="w-full flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold p-2 rounded-lg text-sm transition-colors">
                        <ShareIcon className="w-5 h-5"/> Share Portal Link
                    </button>
                    <button onClick={() => onInitiateCall(workflow)} className="w-full flex items-center gap-2 bg-green-600/20 border border-green-500/50 text-green-300 hover:bg-green-600/40 font-semibold p-2 rounded-lg text-sm transition-colors">
                        <PhoneIcon className="w-5 h-5"/> AI Live Call
                    </button>
                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-1 py-1 text-sm">
                        <div className="flex items-center gap-1.5 flex-grow">
                            <BotIcon className={`w-5 h-5 ${workflow.isAutonomous ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
                            <span className={`font-semibold ${workflow.isAutonomous ? 'text-white' : 'text-slate-400'}`}>Autonomous</span>
                        </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={workflow.isAutonomous} onChange={handleToggleAutonomous} className="sr-only peer"/>
                          <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                    <button onClick={() => onDisputeWorkflow(workflow.id, 'Disputed via UI')} className="w-full flex items-center gap-2 bg-amber-600/20 border border-amber-500/50 text-amber-300 hover:bg-amber-600/40 font-semibold p-2 rounded-lg text-sm transition-colors">
                        <ExclamationIcon className="w-5 h-5"/> Dispute Invoice
                    </button>
                </div>

                {/* Add Note */}
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                    <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><NoteIcon className="w-4 h-4"/> Add Note</h4>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm" placeholder="Log a call, promise to pay, etc..."/>
                    <button onClick={handleAddNote} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold p-2 rounded-lg text-sm transition-colors">Add Note</button>
                </div>

                {/* Audit Trail Snippet */}
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                    <h4 className="text-sm font-semibold text-slate-300">Recent Activity</h4>
                     <ul className="space-y-3 text-xs">
                        {[...workflow.auditTrail].reverse().slice(0, 3).map(entry => (
                            <li key={entry.timestamp} className="border-l-2 border-slate-700 pl-3">
                                <p className="font-semibold text-slate-300">{entry.activity}</p>
                                <p className="text-slate-400 truncate">{entry.details}</p>
                                <p className="text-slate-500 font-mono text-xs">{new Date(entry.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                    {workflow.auditTrail.length > 3 && (
                        <button onClick={() => setAuditModalOpen(true)} className="text-xs text-blue-400 hover:text-blue-300 w-full text-center">View Full Audit Trail</button>
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