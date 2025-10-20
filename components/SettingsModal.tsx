import React, { useState, useEffect } from 'react';
import type { Settings, DunningPlan, DunningStep } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { CheckIcon } from './icons/CheckIcon.tsx';
import { XIcon } from './icons/XIcon.tsx';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter,
    DialogClose
} from './ui/Dialog.tsx';
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                
                <div className="border-b">
                    <nav className="flex space-x-2 px-0">
                        <div className={`px-1 py-2 text-sm font-semibold text-primary border-b-2 border-primary`}>
                            Dunning Plans
                        </div>
                    </nav>
                </div>

                <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
                   <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-semibold text-foreground">Manage your automated follow-up sequences.</h3>
                            {!isAddingPlan && (
                                <Button size="sm" onClick={() => setIsAddingPlan(true)}>
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    New Plan
                                </Button>
                            )}
                        </div>
                         {isAddingPlan && (
                            <div className="bg-muted p-3 rounded-lg border flex gap-2">
                                <Input
                                    type="text"
                                    value={newPlanName}
                                    onChange={(e) => setNewPlanName(e.target.value)}
                                    placeholder="New plan name..."
                                />
                                <Button onClick={handleAddNewPlan} size="sm" variant="secondary">Add</Button>
                                <Button onClick={() => setIsAddingPlan(false)} size="sm" variant="ghost">Cancel</Button>
                            </div>
                        )}
                        <div className="space-y-3">
                            {editablePlans.map(plan => (
                                <div key={plan.id} className="bg-muted/50 p-3 rounded-lg border">
                                    <div className="flex justify-between items-center mb-3">
                                        {editingPlan?.id === plan.id ? (
                                            <div className="flex-grow flex gap-2 items-center">
                                                <Input 
                                                    type="text"
                                                    value={editingPlan.name}
                                                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value })}
                                                    className="h-8"
                                                />
                                                 <Button onClick={handleUpdatePlanName} variant="ghost" size="icon"><CheckIcon className="w-4 h-4 text-green-500"/></Button>
                                                 <Button onClick={() => setEditingPlan(null)} variant="ghost" size="icon"><XIcon className="w-4 h-4"/></Button>
                                            </div>
                                        ) : (
                                            <p className="font-semibold text-foreground">{plan.name}</p>
                                        )}
                                       
                                        {editingPlan?.id !== plan.id && (
                                            <div className="flex gap-2">
                                                <Button onClick={() => setEditingPlan({id: plan.id, name: plan.name})} variant="ghost" size="icon"><PencilIcon className="w-4 h-4"/></Button>
                                                <Button onClick={() => handleDeletePlan(plan.id)} variant="ghost" size="icon" className="hover:text-destructive"><TrashIcon className="w-4 h-4"/></Button>
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
                                                    className="w-16 text-center p-1 h-auto"
                                                />
                                                <span className="font-semibold text-muted-foreground">Template:</span>
                                                <Input
                                                    type="text"
                                                    value={step.template}
                                                    onChange={(e) => handleUpdateStep(plan.id, step.id, 'template', e.target.value)}
                                                    className="p-1 h-auto"
                                                />
                                                <Button onClick={() => handleDeleteStep(plan.id, step.id)} variant="ghost" size="icon" className="w-7 h-7 hover:text-destructive"><TrashIcon className="w-4 h-4"/></Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={() => handleAddStep(plan.id)} variant="link" size="sm" className="mt-2 h-auto p-0 gap-1 flex items-center">
                                        <PlusIcon className="w-3 h-3"/> Add Step
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                     <Button onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};