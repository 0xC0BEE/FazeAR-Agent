import React, { useState, useEffect } from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Settings, DunningPlan, DunningStep } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import { XIcon } from './icons/XIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { CheckIcon } from './icons/CheckIcon.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
    const [editablePlans, setEditablePlans] = useState<DunningPlan[]>([]);
    const [isAddingPlan, setIsAddingPlan] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');
    const [editingPlan, setEditingPlan] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Deep copy to prevent mutation of original state
            setEditablePlans(JSON.parse(JSON.stringify(settings.dunningPlans)));
            setIsAddingPlan(false);
            setNewPlanName('');
            setEditingPlan(null);
        }
    }, [isOpen, settings.dunningPlans]);
    
    if (!isOpen) return null;

    const handleSaveChanges = () => {
        onUpdateSettings({ dunningPlans: editablePlans });
        onClose();
    };

    // Plan handlers
    const handleAddNewPlan = () => {
        if (!newPlanName.trim()) return;
        const newPlan: DunningPlan = {
            id: `plan_${uuidv4()}`,
            name: newPlanName.trim(),
            steps: [],
        };
        setEditablePlans(prev => [...prev, newPlan]);
        setNewPlanName('');
        setIsAddingPlan(false);
    };

    const handleDeletePlan = (planId: string) => {
        setEditablePlans(prev => prev.filter(p => p.id !== planId));
    };

    const handleUpdatePlanName = () => {
        if (!editingPlan || !editingPlan.name.trim()) return;
        setEditablePlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, name: editingPlan.name.trim() } : p));
        setEditingPlan(null);
    };

    // Step handlers
    const handleAddStep = (planId: string) => {
        const newStep: DunningStep = {
            id: `step_${uuidv4()}`,
            day: 0,
            template: 'New Template',
        };
        setEditablePlans(prev => prev.map(p => p.id === planId ? { ...p, steps: [...p.steps, newStep] } : p));
    };

    const handleUpdateStep = (planId: string, stepId: string, field: 'day' | 'template', value: string | number) => {
        setEditablePlans(prev => prev.map(p => {
            if (p.id === planId) {
                const updatedSteps = p.steps.map(s => s.id === stepId ? { ...s, [field]: value } : s);
                // Sort by day after update
                updatedSteps.sort((a,b) => a.day - b.day);
                return { ...p, steps: updatedSteps };
            }
            return p;
        }));
    };

    const handleDeleteStep = (planId: string, stepId: string) => {
        setEditablePlans(prev => prev.map(p => {
            if (p.id === planId) {
                return { ...p, steps: p.steps.filter(s => s.id !== stepId) };
            }
            return p;
        }));
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl m-4 border border-slate-700 transform transition-transform duration-300 scale-100 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="border-b border-slate-700">
                    <nav className="flex space-x-2 px-4">
                        <div className={`px-1 py-2 text-sm font-semibold text-white border-b-2 border-blue-500`}>
                            Dunning Plans
                        </div>
                    </nav>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                   <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-semibold text-white">Manage your automated follow-up sequences.</h3>
                            {!isAddingPlan && (
                                <button onClick={() => setIsAddingPlan(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs h-auto py-1.5 px-3 rounded-md font-semibold flex items-center">
                                    <PlusIcon className="w-4 h-4" />
                                    New Plan
                                </button>
                            )}
                        </div>
                         {isAddingPlan && (
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 flex gap-2">
                                <input
                                    type="text"
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                    placeholder="New plan name..."
                                    className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
                                />
                                <button onClick={handleAddNewPlan} className="bg-green-600 hover:bg-green-700 text-white text-xs h-auto py-1.5 px-3 rounded-md font-semibold">Add</button>
                                <button onClick={() => setIsAddingPlan(false)} className="bg-slate-600 hover:bg-slate-500 text-white text-xs h-auto py-1.5 px-3 rounded-md font-semibold">Cancel</button>
                            </div>
                        )}
                        <div className="space-y-3">
                            {editablePlans.map(plan => (
                                <div key={plan.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    <div className="flex justify-between items-center mb-3">
                                        {editingPlan?.id === plan.id ? (
                                            <div className="flex-grow flex gap-2 items-center">
                                                <input 
                                                    type="text"
                                                    value={editingPlan.name}
                                                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                                                    className="w-full bg-slate-700 border-slate-600 h-8 px-2 rounded-md"
                                                />
                                                 <button onClick={handleUpdatePlanName} className="text-green-400 hover:text-white h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-700"><CheckIcon className="w-4 h-4"/></button>
                                                 <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-700"><XIcon className="w-4 h-4"/></button>
                                            </div>
                                        ) : (
                                            <p className="font-semibold text-slate-200">{plan.name}</p>
                                        )}
                                       
                                        {editingPlan?.id !== plan.id && (
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingPlan({id: plan.id, name: plan.name})} className="text-slate-400 hover:text-white h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-700"><PencilIcon className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeletePlan(plan.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-700"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 text-xs">
                                         {plan.steps.map(step => (
                                            <div key={step.id} className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-md">
                                                <span className="font-semibold text-slate-400">Day</span>
                                                <input 
                                                    type="number"
                                                    value={step.day}
                                                    onChange={(e) => handleUpdateStep(plan.id, step.id, 'day', parseInt(e.target.value) || 0)}
                                                    className="w-16 bg-slate-700 text-center rounded-md p-1 h-auto border-transparent focus:border-blue-500 focus:ring-0"
                                                />
                                                <span className="font-semibold text-slate-400">Template:</span>
                                                <input 
                                                    type="text"
                                                    value={step.template}
                                                    onChange={(e) => handleUpdateStep(plan.id, step.id, 'template', e.target.value)}
                                                    className="w-full bg-slate-700 rounded-md p-1 h-auto border-transparent focus:border-blue-500 focus:ring-0"
                                                />
                                                <button onClick={() => handleDeleteStep(plan.id, step.id)} className="text-slate-500 hover:text-red-400 h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-700"><TrashIcon className="w-4 h-4"/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => handleAddStep(plan.id)} className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-semibold h-auto p-0 gap-1 flex items-center">
                                        <PlusIcon className="w-3 h-3"/> Add Step
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-2">
                    <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm">
                        Cancel
                    </button>
                     <button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};