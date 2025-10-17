import React, { useState, useEffect } from 'react';
import type { Settings, DunningPlan, DunningStep } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import { XIcon } from './icons/XIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { CheckIcon } from './icons/CheckIcon.tsx';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';

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
            <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl m-4 border flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <XIcon className="w-5 h-5" />
                    </Button>
                </div>
                
                <div className="border-b">
                    <nav className="flex space-x-2 px-4">
                        <div className={`px-1 py-2 text-sm font-semibold text-foreground border-b-2 border-primary`}>
                            Dunning Plans
                        </div>
                    </nav>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                   <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-semibold text-foreground">Manage your automated follow-up sequences.</h3>
                            {!isAddingPlan && (
                                <Button size="sm" onClick={() => setIsAddingPlan(true)} className="gap-1 text-xs">
                                    <PlusIcon className="w-4 h-4" />
                                    New Plan
                                </Button>
                            )}
                        </div>
                         {isAddingPlan && (
                            <div className="bg-secondary/50 p-3 rounded-lg border flex gap-2">
                                <Input
                                    type="text"
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                    placeholder="New plan name..."
                                />
                                <Button size="sm" onClick={handleAddNewPlan} className="bg-green-600 hover:bg-green-700">Add</Button>
                                <Button size="sm" variant="secondary" onClick={() => setIsAddingPlan(false)}>Cancel</Button>
                            </div>
                        )}
                        <div className="space-y-3">
                            {editablePlans.map(plan => (
                                <div key={plan.id} className="bg-secondary/50 p-3 rounded-lg border">
                                    <div className="flex justify-between items-center mb-3">
                                        {editingPlan?.id === plan.id ? (
                                            <div className="flex-grow flex gap-2 items-center">
                                                <Input 
                                                    type="text"
                                                    value={editingPlan.name}
                                                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                                                    className="h-8"
                                                />
                                                 <Button variant="ghost" size="icon" onClick={handleUpdatePlanName} className="h-8 w-8 text-green-400"><CheckIcon className="w-4 h-4"/></Button>
                                                 <Button variant="ghost" size="icon" onClick={() => setEditingPlan(null)} className="h-8 w-8"><XIcon className="w-4 h-4"/></Button>
                                            </div>
                                        ) : (
                                            <p className="font-semibold text-card-foreground">{plan.name}</p>
                                        )}
                                       
                                        {editingPlan?.id !== plan.id && (
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => setEditingPlan({id: plan.id, name: plan.name})} className="h-8 w-8"><PencilIcon className="w-4 h-4"/></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive"><TrashIcon className="w-4 h-4"/></Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 text-xs">
                                         {plan.steps.map(step => (
                                            <div key={step.id} className="flex items-center gap-2 bg-background p-1.5 rounded-md">
                                                <span className="font-semibold text-muted-foreground">Day</span>
                                                <Input 
                                                    type="number"
                                                    value={step.day}
                                                    onChange={(e) => handleUpdateStep(plan.id, step.id, 'day', parseInt(e.target.value) || 0)}
                                                    className="w-16 text-center h-7 px-1"
                                                />
                                                <span className="font-semibold text-muted-foreground">Template:</span>
                                                <Input 
                                                    type="text"
                                                    value={step.template}
                                                    onChange={(e) => handleUpdateStep(plan.id, step.id, 'template', e.target.value)}
                                                    className="h-7 px-2"
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteStep(plan.id, step.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive"><TrashIcon className="w-4 h-4"/></Button>
                                            </div>
                                        ))}
                                    </div>
                                     <Button variant="link" size="sm" onClick={() => handleAddStep(plan.id)} className="mt-2 text-primary/80 h-auto p-0 gap-1 flex items-center text-xs">
                                        <PlusIcon className="w-3 h-3"/> Add Step
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-secondary/30 border-t flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                     <Button onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};