
import React, { useState, useRef, useEffect } from 'react';
import type { Message, Draft } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PencilIcon } from './icons/PencilIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (prompt: string) => void;
  onSendDraft: (draft: Draft) => void;
  onAdjustDraftTone: (draft: Draft, instruction: string) => void;
}

const DraftMessage: React.FC<{ draft: Draft; onSend: () => void; onAdjust: (instruction: string) => void }> = ({ draft, onSend, onAdjust }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [instruction, setInstruction] = useState('');

    const handleAdjust = () => {
        if (instruction.trim()) {
            onAdjust(instruction);
            setInstruction('');
            setIsEditing(false);
        }
    };

    return (
        <div className="bg-slate-700/50 p-3 rounded-lg text-sm border border-slate-600">
            <p className="text-xs text-slate-400 font-semibold mb-1">DRAFT EMAIL</p>
            <p className="text-slate-400"><span className="font-semibold text-slate-300">To:</span> {draft.recipient}</p>
            <p className="text-slate-400 mb-2"><span className="font-semibold text-slate-300">Subject:</span> {draft.subject}</p>
            <div className="bg-slate-800/50 p-2 rounded-md whitespace-pre-wrap text-slate-300 mb-3">{draft.body}</div>
            <div className="flex gap-2 items-center">
                <button onClick={() => setIsEditing(!isEditing)} className="flex-1 text-xs font-semibold text-purple-300 hover:text-white bg-purple-900/50 hover:bg-purple-800 px-2 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1">
                    <PencilIcon className="w-3.5 h-3.5" /> Adjust Tone
                </button>
                <button onClick={onSend} className="flex-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-md transition-colors">Send Email</button>
            </div>
            {isEditing && (
                <div className="mt-2 flex gap-2">
                    <input 
                        type="text"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="e.g., 'Make it more firm'"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                     <button onClick={handleAdjust} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold px-3 rounded-md text-xs transition-colors">Adjust</button>
                </div>
            )}
        </div>
    );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, onSendDraft, onAdjustDraftTone }) => {
  const [prompt, setPrompt] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSendMessage(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-400" />
            AI Assistant
        </h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
             {message.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <BotIcon className="w-5 h-5 text-purple-400" isAutonomous={message.isAutonomous}/>
                </div>
             )}
            <div className={`max-w-md rounded-lg p-3 ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {message.isLoading ? (
                    <div className="flex items-center gap-2">
                        <SpinnerIcon className="w-4 h-4 animate-spin"/>
                        <span>Thinking...</span>
                    </div>
                ) : typeof message.content === 'string' ? (
                    <p className="text-sm">{message.content}</p>
                ) : (
                    <DraftMessage 
                        draft={message.content} 
                        onSend={() => onSendDraft(message.content as Draft)}
                        onAdjust={(instruction) => onAdjustDraftTone(message.content as Draft, instruction)}
                    />
                )}
            </div>
             {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                </div>
             )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ask the agent a question..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
