import React, { useState, useEffect } from 'react';
import type { Workflow } from '../types';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { PencilIcon } from './icons/PencilIcon';
import { MailIcon } from './icons/MailIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';
import { AuditTrailModal } from './AuditTrailModal';

interface InspectorPanelProps {
  workflow: Workflow | null;
  onAddNote: (note: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ workflow, onAddNote }) => {
  const [note, setNote] = useState('');
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'disputes'>('notes');

  useEffect(() => {
    setNote('');
    setActiveTab('notes'); // Reset to notes tab on workflow change
  }, [workflow]);

  if (!workflow) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 h-full p-6 text-center">
        <ClipboardListIcon className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-white">Select a Workflow</h3>
        <p className="text-sm text-slate-400">Choose a workflow from the tracker to view its details and take action.</p>
      </div>
    );
  }

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote(note);
      setNote('');
    }
  };
  
  const handleGenerateLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?workflowId=${workflow.id}`;
    navigator.clipboard.writeText(url).then(() => {
        alert(`Payment link copied to clipboard!`);
    });
  };

  const hasDisputes = workflow.disputes && workflow.disputes.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 min-h-0">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-white truncate">Inspector: {workflow.clientName}</h2>
        <p className="text-sm text-slate-400 font-mono">ID: {workflow.id}</p>
      </div>
      
      <div className="border-b border-slate-700 flex-shrink-0">
        <nav className="flex space-x-2 px-4">
            <button onClick={() => setActiveTab('notes')} className={`px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'notes' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}>
                Notes
            </button>
            {hasDisputes && (
                 <button onClick={() => setActiveTab('disputes')} className={`flex items-center gap-1.5 px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'disputes' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}>
                    Disputes <span className="bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{workflow.disputes?.length}</span>
                </button>
            )}
        </nav>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === 'notes' && (
            <>
                {/* Workflow Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-800 p-3 rounded-md">
                        <p className="text-xs text-slate-400">Amount</p>
                        <p className="font-semibold text-white text-lg">${workflow.amount.toLocaleString()}</p>
                    </div>
                     <div className="bg-slate-800 p-3 rounded-md">
                        <p className="text-xs text-slate-400">Due Date</p>
                        <p className="font-semibold text-white">{new Date(workflow.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-md">
                        <p className="text-xs text-slate-400">Assignee</p>
                        <p className="font-semibold text-white">{workflow.assignee}</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-md">
                        <p className="text-xs text-slate-400">Dunning Plan</p>
                        <p className="font-semibold text-white">{workflow.dunningPlan}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={handleGenerateLink}
                        className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-2 rounded-md text-sm transition-colors"
                    >
                        <MailIcon className="w-4 h-4" />
                        <span>Send Payment Link</span>
                    </button>
                    <button 
                        onClick={() => setIsAuditTrailOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-2 rounded-md text-sm transition-colors"
                    >
                        <DocumentIcon className="w-4 h-4" />
                        <span>View Audit Trail</span>
                    </button>
                </div>

                {/* Add Note */}
                <div>
                    <label htmlFor="note-input" className="text-sm font-medium text-slate-300 mb-1 block">Add Note</label>
                    <textarea
                        id="note-input"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder={`e.g., "Client confirmed payment will be sent on Friday."`}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                     <button
                        onClick={handleAddNote}
                        disabled={!note.trim()}
                        className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-md text-sm transition-colors disabled:bg-slate-600"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span>Add Note via Agent</span>
                    </button>
                </div>
            </>
        )}
        {activeTab === 'disputes' && (
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-white">Open Disputes</h3>
                {workflow.disputes?.map(d => (
                    <div key={d.id} className="bg-slate-800 p-3 rounded-lg border border-amber-500/30">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-amber-400">Disputed Amount: ${d.amount.toLocaleString()}</p>
                                <p className="text-xs text-slate-400">Reason: {d.reason}</p>
                             </div>
                             <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">{d.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Logged on: {new Date(d.dateCreated).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        )}
      </div>

      <AuditTrailModal 
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        workflow={workflow}
      />
    </div>
  );
};