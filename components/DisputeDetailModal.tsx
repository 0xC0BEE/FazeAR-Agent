import React, { useState, useEffect } from 'react';
import type { Workflow, ResolutionSuggestion } from '../types.ts';
import { XIcon } from './icons/XIcon.tsx';
import { ExclamationIcon } from './icons/ExclamationIcon.tsx';
import { LightbulbIcon } from './icons/LightbulbIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { getDisputeResolutionSuggestions } from '../services/geminiService.ts';

interface DisputeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
  onExecuteAction: (workflow: Workflow, actionPrompt: string, actionTitle: string) => void;
}

export const DisputeDetailModal: React.FC<DisputeDetailModalProps> = ({ isOpen, onClose, workflow, onExecuteAction }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResolutionSuggestion | null>(null);

  useEffect(() => {
    if (isOpen && workflow) {
      setIsLoading(true);
      setAnalysis(null);
      getDisputeResolutionSuggestions(workflow)
        .then(setAnalysis)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, workflow]);

  if (!isOpen || !workflow) {
    return null;
  }
  
  const handleActionClick = (prompt: string, title: string) => {
      onExecuteAction(workflow, prompt, title);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl m-4 border border-slate-700 transform transition-transform duration-300 scale-100 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Dispute Resolution Assistant</h2>
            <p className="text-sm text-slate-400">
              {workflow.clientName} - Invoice <span className="font-mono">{workflow.externalId}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <SpinnerIcon className="w-8 h-8 animate-spin text-purple-400 mb-4" />
                <h3 className="font-semibold text-white">AI Analyzing Case...</h3>
                <p className="text-sm text-slate-400">The agent is reviewing the dispute details and history.</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-base font-semibold text-slate-200 mb-2">AI Case Summary</h3>
                    <p className="text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-700 whitespace-pre-wrap">{analysis.summary}</p>
                </div>
                 <div>
                    <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
                        <LightbulbIcon className="w-5 h-5 text-amber-400"/>
                        Suggested Actions
                    </h3>
                    <div className="space-y-2">
                        {analysis.suggestions.map((suggestion, index) => (
                            <button 
                                key={index}
                                onClick={() => handleActionClick(suggestion.prompt, suggestion.title)}
                                className="w-full text-left bg-slate-700 hover:bg-slate-600 p-3 rounded-lg transition-colors"
                            >
                               <p className="font-semibold text-sm text-blue-300">{suggestion.title}</p>
                            </button>
                        ))}
                         {analysis.suggestions.length === 0 && (
                            <p className="text-sm text-slate-500 italic text-center">No specific actions could be suggested at this time.</p>
                         )}
                    </div>
                </div>
            </div>
          )}
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