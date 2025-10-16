
import React, { useState } from 'react';
import type { DunningPlan, User } from '../types.ts';
import { XIcon } from './icons/XIcon.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dunningPlans: DunningPlan[];
  onUpdateDunningPlans: (plans: DunningPlan[]) => void;
  isAutonomousMode: boolean;
  onSetAutonomousMode: (enabled: boolean) => void;
  currentUser: User;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, dunningPlans, onUpdateDunningPlans, isAutonomousMode, onSetAutonomousMode, currentUser 
}) => {
  const [selectedPlan, setSelectedPlan] = useState<DunningPlan>(dunningPlans[0]);
  const canControlAutonomy = currentUser.role === 'Admin' || currentUser.role === 'Manager';

  if (!isOpen) {
    return null;
  }
  
  const handleSelectPlan = (planName: string) => {
      const plan = dunningPlans.find(p => p.name === planName);
      if (plan) setSelectedPlan(plan);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl m-4 border border-slate-700 transform transition-transform duration-300 scale-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
             <h3 className="text-md font-semibold text-white mb-2">Agent Settings</h3>
             <p className="text-sm text-slate-400 mb-4">Control the agent's automated behaviors.</p>
             <div className="bg-slate-700/50 p-3 rounded-lg">
                <label htmlFor="autonomous-toggle" className="flex justify-between items-center cursor-pointer">
                    <div>
                        <span className={`font-semibold ${canControlAutonomy ? 'text-white' : 'text-slate-500'}`}>Autonomous Mode</span>
                         <p className={`text-xs ${canControlAutonomy ? 'text-slate-400' : 'text-slate-500'}`}>Let the agent run daily checks automatically.</p>
                    </div>
                    <div className="relative">
                        <input 
                            id="autonomous-toggle" 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={isAutonomousMode}
                            onChange={(e) => onSetAutonomousMode(e.target.checked)}
                            disabled={!canControlAutonomy}
                        />
                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                    </div>
                </label>
                {!canControlAutonomy && <p className="text-xs text-amber-400 mt-2">Only Managers and Admins can change this setting.</p>}
             </div>
             
             <h3 className="text-md font-semibold text-white mb-2 mt-6">Dunning Plans</h3>
             <p className="text-sm text-slate-400 mb-4">Manage communication sequences.</p>
             <div className="space-y-2">
                 {dunningPlans.map(plan => (
                     <button
                        key={plan.name}
                        onClick={() => handleSelectPlan(plan.name)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedPlan.name === plan.name ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                     >
                        {plan.name}
                     </button>
                 ))}
             </div>
          </div>
          <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <h4 className="text-md font-semibold text-white mb-4">Steps for "{selectedPlan.name}" Plan</h4>
              <div className="space-y-3">
                  {selectedPlan.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-slate-800 rounded-md">
                          <div className="text-center">
                              <p className="font-bold text-lg text-white">{step.day}</p>
                              <p className="text-xs text-slate-400">Day</p>
                          </div>
                          <div className="w-px bg-slate-600 self-stretch"></div>
                          <div>
                              <p className="font-semibold text-slate-200">{step.action === 'EMAIL' ? 'Send Email' : 'Make Call'}</p>
                              <p className="text-sm text-slate-400">Template: {step.template}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </div>
         <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right">
            <button 
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};