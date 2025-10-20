import React, { useState, useEffect } from 'react';
import type { Workflow, ResolutionSuggestion } from '../types.ts';
import { getDisputeResolutionSuggestions } from '../services/geminiService.ts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/Dialog.tsx';
import { Button } from './ui/Button.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { LightbulbIcon } from './icons/LightbulbIcon.tsx';

interface DisputeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
  onExecuteAction: (workflow: Workflow, actionPrompt: string, actionTitle: string) => void;
}

export const DisputeDetailModal: React.FC<DisputeDetailModalProps> = ({ isOpen, onClose, workflow, onExecuteAction }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<ResolutionSuggestion | null>(null);

  useEffect(() => {
    if (isOpen && workflow) {
      setIsLoading(true);
      setSuggestion(null);
      getDisputeResolutionSuggestions(workflow)
        .then(setSuggestion)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, workflow]);

  if (!isOpen || !workflow) {
    return null;
  }
  
  const handleActionClick = (title: string, prompt: string) => {
      onExecuteAction(workflow, prompt, title);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dispute Resolution Assistant</DialogTitle>
          <DialogDescription>
            AI-powered insights for Invoice #{workflow.externalId} ({workflow.clientName})
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
            {isLoading && (
                 <div className="flex flex-col items-center justify-center h-48">
                    <SpinnerIcon className="w-8 h-8 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Analyzing dispute details...</p>
                </div>
            )}
            {suggestion && (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">AI Case Summary</h4>
                        <p className="text-sm bg-muted p-3 rounded-lg border">{suggestion.summary}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                           <LightbulbIcon className="w-5 h-5 text-amber-400" />
                           Suggested Actions
                        </h4>
                        <div className="space-y-2">
                            {suggestion.suggestions.map((s, index) => (
                                <Button 
                                    key={index}
                                    variant="outline"
                                    className="w-full justify-start text-left h-auto py-2"
                                    onClick={() => handleActionClick(s.title, s.prompt)}
                                >
                                    {s.title}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
