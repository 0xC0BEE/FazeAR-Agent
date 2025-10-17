
import React from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Communication } from '../types.ts';
import { MailIcon } from './icons/MailIcon.tsx';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon.tsx';

interface CommunicationsLogProps {
  communications: Communication[];
  onSend: (commId: string) => void;
}

export const CommunicationsLog: React.FC<CommunicationsLogProps> = ({ communications, onSend }) => {

  if (communications.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-6">
        <MailIcon className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="font-semibold text-white">Communications Log</h3>
        <p className="text-sm text-slate-400">AI-drafted emails will appear here, ready to be sent.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
        {communications.map(comm => (
            <div key={comm.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <div className="flex justify-between items-start text-xs mb-2">
                    <div>
                        <p className="text-slate-400">To: <span className="font-semibold text-slate-300">{comm.recipient}</span></p>
                        <p className="text-slate-400">Subject: <span className="font-semibold text-slate-300">{comm.subject}</span></p>
                    </div>
                    {comm.status === 'Draft' ? (
                         <button 
                            onClick={() => onSend(comm.id)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-1 rounded-md transition-colors"
                        >
                            <PaperAirplaneIcon className="w-3 h-3"/> Send
                        </button>
                    ) : (
                        <span className="px-2 py-0.5 font-semibold rounded-full bg-green-200 text-green-800">Sent</span>
                    )}
                </div>
                <div className="text-sm text-slate-300 bg-slate-800 p-2 rounded-md whitespace-pre-wrap">
                    {comm.body}
                </div>
            </div>
        ))}
    </div>
  );
};
