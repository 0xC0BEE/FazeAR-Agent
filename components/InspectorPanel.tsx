import React, { useState, useEffect } from 'react';
import type { Workflow, DunningPlan, Note, Task, User } from '../types';
import { BotIcon } from './icons/BotIcon';
import { getNextActionSuggestion, draftEmail } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MailIcon } from './icons/MailIcon';
import { NoteIcon } from './icons/NoteIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ClockIcon } from './icons/ClockIcon';
import { XIcon } from './icons/XIcon';
import { v4 as uuidv4 } from 'uuid';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface InspectorPanelProps {
    workflow: Workflow | null;
    dunningPlans: DunningPlan[];
    workflows: Workflow[];
    onUpdateWorkflows: (workflows: Workflow[]) => void;
    currentUser: User;
    isAutonomousMode: boolean;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ workflow, dunningPlans, workflows, onUpdateWorkflows, currentUser, isAutonomousMode }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'tasks'>('overview');
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
    const [isDraftingEmail, setIsDraftingEmail] = useState(false);
    const [emailDraft, setEmailDraft] = useState<{ subject: string, body: string} | null>(null);
    const [noteInput, setNoteInput] = useState('');

    useEffect(() => {
        // When the workflow changes, reset the state of the panel.
        if (workflow) {
            setActiveTab('overview');
            setSuggestion(null);
            setEmailDraft(null);
        }
    }, [workflow]);
    
    const handleGetSuggestion = async () => {
        if (!workflow) return;
        setIsLoadingSuggestion(true);
        setSuggestion(null);
        try {
            const res = await getNextActionSuggestion(workflow, dunningPlans);
            setSuggestion(res.text);
        } catch (err) {
            console.error(err);
            setSuggestion("Error fetching suggestion.");
        } finally {
            setIsLoadingSuggestion(false);
        }
    };

    const handleAddNote = () => {
        if (!workflow || !noteInput.trim()) return;
        const newNote: Note = {
            id: uuidv4(),
            content: noteInput,
            author: currentUser.name,
            timestamp: new Date().toISOString(),
        };
        const updatedWorkflows = workflows.map(w => 
            w.id === workflow.id ? { ...w, notes: [newNote, ...w.notes] } : w
        );
        onUpdateWorkflows(updatedWorkflows);
        setNoteInput('');
    };
    
    const handleToggleTask = (taskId: string) => {
        if (!workflow) return;
        const updatedWorkflows = workflows.map(w => {
            if (w.id === workflow.id) {
                return {
                    ...w,
                    tasks: w.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
                };
            }
            return w;
        });
        onUpdateWorkflows(updatedWorkflows);
    };

    const handleDraftEmail = async () => {
        if (!workflow) return;
        setIsDraftingEmail(true);
        setEmailDraft(null);
        try {
            const templateMatch = suggestion?.match(/'([^']*)'/);
            const templateName = templateMatch ? templateMatch[1] : "Follow-up";
            
            const response = await draftEmail(workflow, templateName);
            const text = response.text;
            const subject = text.match(/Subject: (.*)/)?.[1] || `${workflow.clientName} - Invoice Overdue`;
            const body = text.split('\n\n').slice(1).join('\n\n');
            setEmailDraft({ subject, body });

        } catch (error) {
            console.error("Failed to draft email", error);
        } finally {
            setIsDraftingEmail(false);
        }
    }
    
    if (!workflow) {
        return (
            <div className="h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 flex items-center justify-center text-slate-400">
                <p>Select a workflow to see details.</p>
            </div>
        );
    }
    
    const dunningPlan = dunningPlans.find(p => p.name === workflow.dunningPlanName);

    return (
        <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex-shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white">{workflow.clientName}</h2>
                        <p className="text-sm text-slate-400">Assignee: {workflow.assignee}</p>
                    </div>
                    <div className="text-right">
                         <p className={`text-xl font-bold ${workflow.status === 'Overdue' ? 'text-red-400' : 'text-yellow-400'}`}>${workflow.amount.toLocaleString()}</p>
                         <p className="text-sm text-slate-400">Due: {new Date(workflow.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</p>
                    </div>
                </div>
            </div>
            
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <BotIcon isAutonomous={isAutonomousMode} className="w-8 h-8 text-purple-400 flex-shrink-0"/>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-purple-300">AI ASSISTANT</p>
                        {suggestion ? (
                           <p className="text-sm text-white font-semibold">{suggestion}</p>
                        ) : (
                           <p className="text-sm text-slate-400">Ready for instructions.</p>
                        )}
                    </div>
                    {!suggestion && (
                        <button onClick={handleGetSuggestion} disabled={isLoadingSuggestion} className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-1.5 rounded-md text-xs transition-colors disabled:opacity-50">
                            {isLoadingSuggestion ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <LightbulbIcon className="w-4 h-4" />}
                            <span>Suggest Action</span>
                        </button>
                    )}
                    {suggestion && suggestion.toLowerCase().includes('email') && (
                        <button onClick={handleDraftEmail} disabled={isDraftingEmail} className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-1.5 rounded-md text-xs transition-colors disabled:opacity-50">
                            {isDraftingEmail ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <MailIcon className="w-4 h-4" />}
                            <span>Draft Email</span>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="border-b border-slate-700 flex-shrink-0">
                <nav className="flex space-x-2 px-4">
                    <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-1.5 px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}><ClockIcon className="w-4 h-4"/>Overview</button>
                    <button onClick={() => setActiveTab('notes')} className={`flex items-center gap-1.5 px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'notes' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}><NoteIcon className="w-4 h-4"/>Notes ({workflow.notes.length})</button>
                    <button onClick={() => setActiveTab('tasks')} className={`flex items-center gap-1.5 px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'tasks' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}><ClipboardListIcon className="w-4 h-4"/>Tasks ({workflow.tasks.length})</button>
                </nav>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'overview' && dunningPlan && (
                    <div className="space-y-4">
                        <h4 className="text-md font-semibold text-white">Dunning Plan: {dunningPlan.name}</h4>
                        {dunningPlan.steps.map((step, index) => {
                            const isCompleted = workflow.communicationHistory.some(h => h.stepName.includes(step.template));
                            return (
                                <div key={index} className={`flex items-center gap-3 p-3 rounded-md ${isCompleted ? 'bg-green-900/50' : 'bg-slate-800'}`}>
                                    <div className="text-center w-12">
                                        <p className="font-bold text-lg text-white">{step.day}</p>
                                        <p className="text-xs text-slate-400">Day</p>
                                    </div>
                                    <div className="w-px bg-slate-600 self-stretch mx-2"></div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-200">{step.action === 'EMAIL' ? 'Send Email' : 'Make Call'}</p>
                                        <p className="text-sm text-slate-400">Template: {step.template}</p>
                                    </div>
                                    {isCompleted && <span className="text-xs font-bold text-green-400">COMPLETED</span>}
                                </div>
                            )
                        })}
                    </div>
                )}
                {activeTab === 'notes' && (
                    <div className="space-y-3">
                         <div className="flex gap-2 pb-2">
                            <input
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Add a new note..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button onClick={handleAddNote} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-1.5 rounded-md text-sm transition-colors">Add</button>
                        </div>
                        {workflow.notes.map(note => (
                            <div key={note.id} className="bg-slate-800 p-3 rounded-md text-sm">
                                <p className="text-slate-300">{note.content}</p>
                                <p className="text-xs text-slate-500 mt-1">- {note.author}, {new Date(note.timestamp).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
                 {activeTab === 'tasks' && (
                    <div className="space-y-2">
                        {workflow.tasks.map(task => (
                             <div key={task.id} className="flex items-center gap-3 bg-slate-800 p-2 rounded-md">
                                <input type="checkbox" checked={task.isCompleted} onChange={() => handleToggleTask(task.id)} className="form-checkbox h-4 w-4 bg-slate-900 border-slate-600 text-blue-600 rounded focus:ring-blue-500" />
                                <p className={`text-sm ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-300'}`}>{task.content}</p>
                             </div>
                        ))}
                    </div>
                )}
            </div>
            
            {emailDraft && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setEmailDraft(null)}>
                    <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl m-4 border border-slate-700" onClick={e => e.stopPropagation()}>
                        <div className="p-4 flex justify-between items-center border-b border-slate-700">
                            <h2 className="text-lg font-semibold text-white">Draft Email</h2>
                            <button onClick={() => setEmailDraft(null)} className="text-slate-400 hover:text-white"><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" defaultValue={emailDraft.subject} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm font-semibold"/>
                            <textarea defaultValue={emailDraft.body} rows={10} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm whitespace-pre-wrap font-mono"/>
                        </div>
                         <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right space-x-2">
                             <button onClick={() => setEmailDraft(null)} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-md text-sm">Close</button>
                             <button onClick={() => {alert("Email sent (simulated)!"); setEmailDraft(null);}} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md text-sm">Send Email</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};