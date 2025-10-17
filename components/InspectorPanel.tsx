import React, { useState } from 'react';
import type { Workflow } from '../types.ts';
import { ClipboardListIcon } from './icons/ClipboardListIcon.tsx';
import { DollarIcon } from './icons/DollarIcon.tsx';
import { CalendarIcon } from './icons/CalendarIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { NoteIcon } from './icons/NoteIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';

interface InspectorPanelProps {
  workflow: Workflow | null;
  onAddNote: (note: string) => void;
  onToggleWorkflowAutonomy: (workflowId: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ workflow, onAddNote, onToggleWorkflowAutonomy }) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || !workflow) return;
    
    setIsSubmitting(true);
    // Simulate async action
    setTimeout(() => {
        onAddNote(note);
        setNote('');
        setIsSubmitting(false);
    }, 500);
  };

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 p-6 text-center">
        <ClipboardListIcon className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-white">Select a Workflow</h3>
        <p className="text-slate-400">Choose a workflow from the tracker to view its details.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex justify-between items-center">
             <div>
                <h2 className="text-lg font-semibold text-white">Inspector: {workflow.clientName}</h2>
                <p className="text-sm text-slate-400">Invoice ID: {workflow.externalId}</p>
             </div>
             <div className="flex items-center gap-2 text-sm">
                <BotIcon className={`w-5 h-5 ${workflow.isAutonomous ? 'text-purple-400' : 'text-slate-500'}`} />
                 <span className={`font-semibold ${workflow.isAutonomous ? 'text-white' : 'text-slate-400'}`}>Autonomous</span>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={workflow.isAutonomous}
                        onChange={() => onToggleWorkflowAutonomy(workflow.id)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
             </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                <DollarIcon className="w-6 h-6 text-green-400"/>
                <div>
                    <p className="text-slate-400">Amount</p>
                    <p className="text-white font-semibold text-base">${workflow.amount.toLocaleString()}</p>
                </div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-red-400"/>
                <div>
                    <p className="text-slate-400">Due Date</p>
                    <p className="text-white font-semibold text-base">{new Date(workflow.dueDate).toLocaleDateString()}</p>
                </div>
            </div>
             <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                <UserIcon className="w-6 h-6 text-blue-400"/>
                <div>
                    <p className="text-slate-400">Assignee</p>
                    <p className="text-white font-semibold text-base">{workflow.assignee}</p>
                </div>
            </div>
             <div className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                <ClipboardListIcon className="w-6 h-6 text-purple-400"/>
                <div>
                    <p className="text-slate-400">Dunning Plan</p>
                    <p className="text-white font-semibold text-base">{workflow.dunningPlan}</p>
                </div>
            </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
            <NoteIcon className="w-5 h-5" />
            Audit Trail & Notes
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {workflow.auditTrail.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No notes or activities recorded yet.</p>
            ) : (
                [...workflow.auditTrail].reverse().map((entry, index) => {
                    const isAutonomous = entry.activity === 'Autonomous Action';
                    return (
                        <div key={index} className="bg-slate-900/50 p-2 rounded-md">
                            <p className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                               {isAutonomous && <BotIcon className="w-3.5 h-3.5 text-purple-400" />}
                               <span>{new Date(entry.timestamp).toLocaleString()} - <span className="font-semibold text-slate-300">{entry.activity}</span></span>
                            </p>
                            <p className="text-sm text-slate-200 whitespace-pre-wrap pl-1">{entry.details}</p>
                        </div>
                    );
                })
            )}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleAddNote} className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a new note or log an activity..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !note.trim()}
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
};
