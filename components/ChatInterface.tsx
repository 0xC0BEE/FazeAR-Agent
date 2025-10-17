
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Tone, Workflow } from '../types.ts';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { MailIcon } from './icons/MailIcon.tsx';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (input: string, tone: Tone) => void;
  selectedWorkflow: Workflow | null;
  onLogCommunication: (messageContent: string, workflow: Workflow) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, selectedWorkflow, onLogCommunication }) => {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState<Tone>('Default');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input, tone);
      setInput('');
    }
  };
  
  const handleLog = (content: string) => {
      if (selectedWorkflow && content) {
          onLogCommunication(content, selectedWorkflow);
      }
  };

  const tones: Tone[] = ['Default', 'Friendly', 'Formal', 'Firm'];

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        <p className="text-sm text-slate-400">Your copilot for accounts receivable.</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={msg.id || index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <BotIcon className="w-5 h-5 text-purple-400" />
              </div>
            )}
            <div className={`max-w-md w-full ${msg.role === 'user' ? 'text-right' : ''}`}>
               <div className={`inline-block p-3 rounded-lg ${
                    msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-700 text-slate-300'
               }`}>
                 {msg.isThinking ? (
                     <div className="flex items-center gap-2">
                        <SpinnerIcon className="w-4 h-4 animate-spin"/>
                        <span>Thinking...</span>
                    </div>
                 ) : msg.toolCall ? (
                     <div className="text-xs">
                        <div className="flex items-center gap-2 font-semibold mb-1 text-slate-400">
                            <WrenchScrewdriverIcon className="w-4 h-4"/>
                            <span>Tool Call: {msg.toolCall.name}</span>
                        </div>
                        <pre className="bg-slate-800 p-2 rounded-md text-left font-mono whitespace-pre-wrap">{JSON.stringify(msg.toolCall.args, null, 2)}</pre>
                     </div>
                 ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                 )}
               </div>
               {msg.role === 'model' && msg.content && !msg.isThinking && (
                 <div className="mt-1 text-right">
                    <button 
                        disabled={!selectedWorkflow}
                        onClick={() => handleLog(msg.content ?? '')}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <MailIcon className="w-3 h-3"/> Log Communication
                    </button>
                 </div>
               )}
            </div>
             {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-slate-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2">
           <div className="relative group">
                <button className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold px-3 py-1.5 rounded-md text-xs transition-colors">
                    <span>Tone: {tone}</span>
                    <ChevronDownIcon className="w-3 h-3"/>
                </button>
                <div className="absolute bottom-full mb-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                    {tones.map(t => (
                         <button 
                            key={t}
                            onClick={() => setTone(t)}
                            className={`w-full text-left px-2 py-1 text-xs rounded ${tone === t ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
                         >
                            {t}
                         </button>
                    ))}
                </div>
           </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Ask a question or give a command..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg transition-colors hover:bg-blue-700 disabled:bg-slate-600"
          >
            {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <PaperAirplaneIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
