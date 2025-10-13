
import React, { useState } from 'react';
import type { Workflow, User } from '../types';
import { NoteIcon } from './icons/NoteIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { MailIcon } from './icons/MailIcon';
import { PercentIcon } from './icons/PercentIcon';

interface InspectorPanelProps {
  workflow: Workflow | null;
  onAddTask: (workflowId: string, taskContent: string) => void;
  onToggleTask: (workflowId: string, taskId: string) => void;
  onAddNote: (workflowId: string, noteContent: string) => void;
  onViewAuditTrail: (workflowId: string) => void;
  currentUser: User;
  onProposeSettlement: (workflowId: string, discount: number) => void;
}

const getStatusClass = (status: Workflow['status']) => {
  switch (status) {
    case 'Overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'In Progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ workflow, onAddTask, onToggleTask, onAddNote, onViewAuditTrail, currentUser, onProposeSettlement }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'history' | 'negotiate'>('notes');
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [discount, setDiscount] = useState(5);

  const handleAddNote = () => {
    if (newNote.trim() && workflow) {
      onAddNote(workflow.id, newNote.trim());
      setNewNote('');
    }
  };

  const handleAddTask = () => {
    if (newTask.trim() && workflow) {
      onAddTask(workflow.id, newTask.trim());
      setNewTask('');
    }
  };

  const handlePropose = () => {
    if (workflow) {
      onProposeSettlement(workflow.id, discount);
    }
  };

  if (!workflow) {
    return (
      <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 items-center justify-center text-slate-400 p-4 text-center">
        <DocumentIcon className="w-12 h-12 mb-4 text-slate-600" />
        <h3 className="text-lg font-semibold text-white">Select a Workflow</h3>
        <p className="text-sm">Choose a workflow from the list to see its details.</p>
      </div>
    );
  }
  
  const canNegotiate = (currentUser.role === 'Admin' || currentUser.role === 'Manager') && workflow.status === 'Overdue';

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-white">{workflow.clientName}</h2>
                <p className="text-sm text-slate-400">Due: {new Date(workflow.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</p>
            </div>
            <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusClass(workflow.status)}`}>
                {workflow.status}
            </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
            <div>
                <p className="text-sm text-slate-400">Amount</p>
                <p className="text-2xl font-bold text-white">${workflow.amount.toLocaleString()}</p>
            </div>
            <div>
                <p className="text-sm text-slate-400">Dunning Plan</p>
                <p className="font-semibold text-white text-right">{workflow.dunningPlanName}</p>
            </div>
        </div>
        <div className="mt-2 text-right">
             <a href={workflow.paymentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                View Payment Portal &rarr;
            </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 flex-shrink-0">
        <nav className="flex space-x-2 px-4">
          <button onClick={() => setActiveTab('notes')} className={`px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'notes' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}>Notes</button>
          <button onClick={() => setActiveTab('tasks')} className={`px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'tasks' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}>Tasks</button>
          <button onClick={() => setActiveTab('history')} className={`px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'history' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}>History</button>
          {canNegotiate && (
            <button onClick={() => setActiveTab('negotiate')} className={`px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'negotiate' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}>Negotiate</button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-white flex items-center gap-2"><NoteIcon className="w-5 h-5"/> Notes</h3>
            {workflow.notes.length > 0 ? (
                [...workflow.notes].reverse().map(note => (
                <div key={note.id} className="bg-slate-700/50 p-3 rounded-md text-sm">
                  <p className="text-slate-300 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-slate-500 mt-2 text-right">
                    &mdash; {note.author} on {new Date(note.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : <p className="text-sm text-slate-400 text-center py-4">No notes yet.</p>}
             <div className="mt-4">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a new note..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                />
                <button onClick={handleAddNote} className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1.5 rounded-md text-sm transition-colors">Add Note</button>
            </div>
          </div>
        )}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
             <h3 className="text-md font-semibold text-white flex items-center gap-2"><ClipboardListIcon className="w-5 h-5"/> Tasks</h3>
             {workflow.tasks.length > 0 ? (
                workflow.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 bg-slate-700/50 p-2.5 rounded-md">
                        <button onClick={() => onToggleTask(workflow.id, task.id)} className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center ${task.isCompleted ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                            {task.isCompleted && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                        </button>
                        <p className={`text-sm ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{task.content}</p>
                    </div>
                ))
            ) : <p className="text-sm text-slate-400 text-center py-4">No tasks yet.</p>}
             <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button onClick={handleAddTask} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-1.5 rounded-md text-sm transition-colors">Add</button>
            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="space-y-3">
             <h3 className="text-md font-semibold text-white flex items-center gap-2"><MailIcon className="w-5 h-5"/> Communication History</h3>
             {workflow.communicationHistory.length > 0 ? (
                [...workflow.communicationHistory].reverse().map((item, index) => (
                    <div key={index} className="bg-slate-700/50 p-3 rounded-md text-sm">
                        <p className="font-semibold text-slate-300">{item.stepName}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                ))
            ) : <p className="text-sm text-slate-400 text-center py-4">No communication history.</p>}

            <button
                onClick={() => onViewAuditTrail(workflow.id)}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-md text-sm transition-colors border border-slate-600"
            >
                <ShieldIcon className="w-4 h-4" /> View Full Audit Trail
            </button>
          </div>
        )}
        {activeTab === 'negotiate' && canNegotiate && (
            <div>
                <h3 className="text-md font-semibold text-white flex items-center gap-2"><PercentIcon className="w-5 h-5"/> Propose Settlement</h3>
                <p className="text-sm text-slate-400 mt-1">Authorize the agent to propose a one-time discount to settle the overdue balance.</p>
                <div className="mt-4 bg-slate-700/50 p-4 rounded-lg">
                    <label htmlFor="discount" className="block text-sm font-medium text-slate-300">Discount Percentage</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                            type="number"
                            name="discount"
                            id="discount"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., 5"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            min="1"
                            max="50"
                        />
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-slate-400 sm:text-sm">%</span>
                        </div>
                    </div>
                    <button
                        onClick={handlePropose}
                        className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md text-sm transition-colors"
                    >
                        Ask Agent to Propose {discount}% Discount
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};