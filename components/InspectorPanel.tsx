import React, { useState } from 'react';
import type { Workflow, User } from '../types';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { DollarIcon } from './icons/DollarIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { NoteIcon } from './icons/NoteIcon';
import { PlusIcon } from './icons/PlusIcon';
import { AuditTrailModal } from './AuditTrailModal';
import { ExclamationIcon } from './icons/ExclamationIcon';

interface InspectorPanelProps {
  workflow: Workflow | null;
  users: User[];
  onUpdateWorkflow: (workflowId: string, updates: Partial<Workflow>) => void;
  onAddNote: (note: string) => void;
  onDisputeWorkflow: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ workflow, users, onUpdateWorkflow, onAddNote, onDisputeWorkflow }) => {
  const [note, setNote] = useState('');
  const [isAuditModalOpen, setAuditModalOpen] = useState(false);
  
  const handleAddNote = () => {
      if (note.trim() && workflow) {
          onAddNote(note);
          setNote('');
      }
  };

  if (!workflow) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6">
        <ClipboardListIcon className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="font-semibold text-white">Select a Workflow</h3>
        <p className="text-sm text-slate-400">Choose a workflow from the tracker to view its details, manage its status, and interact with it.</p>
      </div>
    );
  }
  
  const collectors = users.filter(u => u.role === 'Collector' || u.role === 'Manager' || u.role === 'Admin');

  return (
    <div className="flex flex-col h-full">
        <div className="p-4 flex-shrink-0">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-semibold text-white">{workflow.clientName}</h2>
                    <p className="text-sm text-slate-400 font-mono">ID: {workflow.externalId}</p>
                </div>
                 <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-1 py-1 text-sm">
                    <div className="flex items-center gap-1.5">
                        <BotIcon className={`w-5 h-5 ${workflow.isAutonomous ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
                        <span className={`font-semibold ${workflow.isAutonomous ? 'text-white' : 'text-slate-400'}`}>Autonomous</span>
                    </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={workflow.isAutonomous}
                        onChange={(e) => onUpdateWorkflow(workflow.id, { isAutonomous: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
            </div>
        </div>
      
        <div className="flex-1 px-4 overflow-y-auto">
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                        <DollarIcon className="w-5 h-5 text-slate-500 flex-shrink-0"/>
                        <div>
                            <p className="text-slate-400">Amount</p>
                            <p className="font-semibold text-white font-mono">${workflow.amount.toLocaleString()}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-slate-500 flex-shrink-0"/>
                        <div>
                            <p className="text-slate-400">Due Date</p>
                            <p className="font-semibold text-white">{new Date(workflow.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <UserIcon className="w-5 h-5 text-slate-500 flex-shrink-0"/>
                        <div>
                            <p className="text-slate-400">Assignee</p>
                             <select 
                                value={workflow.assignee}
                                onChange={(e) => onUpdateWorkflow(workflow.id, { assignee: e.target.value })}
                                className="bg-slate-700/50 border-slate-600 border rounded-md px-1 text-white font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                {collectors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <ClipboardListIcon className="w-5 h-5 text-slate-500 flex-shrink-0"/>
                        <div>
                            <p className="text-slate-400">Dunning Plan</p>
                            <p className="font-semibold text-white">{workflow.dunningPlan}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="note" className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-1">
                        <NoteIcon className="w-4 h-4" />
                        Add a Note
                    </label>
                    <textarea 
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Log a call, payment promise, etc."
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleAddNote}
                        disabled={!note.trim()}
                        className="mt-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md text-xs transition-colors disabled:bg-slate-600"
                    >
                        <PlusIcon className="w-4 h-4"/>
                        Add Note
                    </button>
                </div>
                <div className="border-t border-slate-700 pt-4">
                     <h3 className="text-sm font-semibold text-slate-300 mb-2">Recent Activity</h3>
                     <div className="space-y-2 text-xs">
                        {workflow.auditTrail.slice(0, 3).map((entry, index) => (
                           <div key={index}>
                             <p className="font-semibold text-slate-400">
                               {new Date(entry.timestamp).toLocaleString()} - <span className="text-slate-300">{entry.activity}</span>
                             </p>
                             <p className="text-slate-500 pl-2">{entry.details}</p>
                           </div>
                        ))}
                     </div>
                     {workflow.auditTrail.length > 3 && (
                        <button onClick={() => setAuditModalOpen(true)} className="text-xs text-blue-400 hover:underline mt-2">View Full Audit Trail</button>
                     )}
                </div>
                {workflow.status !== 'Disputed' && (
                <div className="border-t border-slate-700 pt-4 mt-4">
                    <button 
                        onClick={onDisputeWorkflow}
                        className="w-full flex items-center justify-center gap-2 bg-amber-600/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 font-semibold px-3 py-1.5 rounded-md text-sm transition-colors"
                    >
                        <ExclamationIcon className="w-4 h-4" />
                        Dispute Invoice
                    </button>
                </div>
                )}
            </div>
        </div>
         <AuditTrailModal 
            isOpen={isAuditModalOpen}
            onClose={() => setAuditModalOpen(false)}
            workflow={workflow}
        />
    </div>
  );
};