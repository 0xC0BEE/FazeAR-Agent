import React from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Communication } from '../types.ts';
import { MailIcon } from './icons/MailIcon.tsx';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon.tsx';
import { Button } from './ui/Button.tsx';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';

interface CommunicationsLogProps {
  communications: Communication[];
  onSend: (commId: string) => void;
}

export const CommunicationsLog: React.FC<CommunicationsLogProps> = ({ communications, onSend }) => {

  if (communications.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6">
        <MailIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-card-foreground">Communications Log</h3>
        <p className="text-sm text-muted-foreground">AI-drafted emails will appear here, ready for review.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
        {[...communications].reverse().map(comm => (
            <div key={comm.id} className="bg-muted/50 p-3 rounded-lg border">
                <div className="flex justify-between items-start text-xs mb-2">
                    <div>
                        <p className="text-muted-foreground">To: <span className="font-semibold text-foreground">{comm.recipient}</span></p>
                        <p className="text-muted-foreground">Subject: <span className="font-semibold text-foreground">{comm.subject}</span></p>
                    </div>
                    {comm.status === 'Draft' ? (
                         <Button
                            onClick={() => onSend(comm.id)}
                            size="sm"
                            className="gap-1"
                        >
                            <PaperAirplaneIcon className="w-3 h-3"/> Send
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                           <CheckCircleIcon className="w-4 h-4"/>
                           <span>Sent</span>
                        </div>
                    )}
                </div>
                <div className="text-sm text-foreground bg-background p-2 rounded-md whitespace-pre-wrap">
                    {comm.body}
                </div>
            </div>
        ))}
    </div>
  );
};