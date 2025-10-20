import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon.tsx';

export const AIInsights: React.FC = () => {
  return (
    <div className="bg-card rounded-lg shadow-lg p-4 md:p-6 border">
      <div className="flex items-start gap-4">
        <SparklesIcon className="w-8 h-8 text-primary flex-shrink-0 mt-1"/>
        <div>
            <h3 className="text-lg font-semibold text-card-foreground">
                Conversational Analytics
            </h3>
            <p className="text-sm text-muted-foreground">Ask the agent questions about your data in the chat.</p>
            <div className="mt-3 text-xs text-muted-foreground/80 italic space-y-1">
                <p>"Summarize the aging report for me."</p>
                <p>"Who is the top performing collector by amount collected?"</p>
                <p>"Which client has the highest overdue balance?"</p>
            </div>
        </div>
      </div>
    </div>
  );
};