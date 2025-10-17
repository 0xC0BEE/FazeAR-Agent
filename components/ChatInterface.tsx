import React, { useState, useRef, useEffect } from 'react';
// Fix: Corrected import path for types.ts to be explicit.
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
  const [isToneMenuOpen, setIsToneMenuOpen] = useState(false);
  const toneMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toneMenuRef.current && !toneMenuRef.current.contains(event.target as Node)) {
        setIsToneMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toneMenuRef]);


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
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors h-auto p-0"
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
          <div className="relative" ref={toneMenuRef}>
            <button
              onClick={() => setIsToneMenuOpen(prev => !prev)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-800 text-slate-300 hover:bg-slate-700 h-9 px-3 gap-1.5 text-xs"
            >
              <span>Tone: {tone}</span>
              <ChevronDownIcon className="w-3 h-3"/>
            </button>
            {isToneMenuOpen && (
              <div className="absolute bottom-full mb-2 w-32 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-10 border border-slate-700">
                <div className="py-1">
                  {tones.map(t => (
                    <a
                      href="#"
                      key={t}
                      onClick={(e) => {
                        e.preventDefault();
                        setTone(t);
                        setIsToneMenuOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                    >{t}</a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Ask a question or give a command..."
            className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-600 flex-shrink-0 h-10 w-10"
          >
            {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <PaperAirplaneIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
