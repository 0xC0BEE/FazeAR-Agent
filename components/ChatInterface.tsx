import React, { useState, useRef, useEffect } from 'react';
import { BotIcon } from './icons/BotIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon.tsx';
import type { Workflow, User, ChatMessage } from '../types.ts';

interface ChatInterfaceProps {
    currentUser: User;
    selectedWorkflow: Workflow | null;
    messages: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (input: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUser, selectedWorkflow, messages, isLoading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSendMessage(input);
        setInput('');
    };
    
    const quickPrompts = [
        "Summarize the aging report.",
        selectedWorkflow ? `Send a reminder for invoice ${selectedWorkflow.externalId}.` : "Assign Quantum Dynamics to Sarah Lee.",
        "Add a note to Apex Industries: 'Client promised payment next week.'",
    ];

    return (
        <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                    if (msg.role === 'tool') return null; // Don't render tool responses
                    return (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                    <BotIcon className="w-5 h-5 text-purple-400" />
                                </div>
                            )}
                            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'model' ? (msg.toolCall ? 'bg-slate-800/70 border border-slate-700' : 'bg-slate-700') : 'bg-blue-600 text-white'}`}>
                                {msg.isThinking ? (
                                    <div className="flex items-center gap-2">
                                        <SpinnerIcon className="w-4 h-4 animate-spin" />
                                        <span className="text-sm text-slate-400">Thinking...</span>
                                    </div>
                                ) : msg.content ? (
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                ) : msg.toolCall ? (
                                    <div className="text-xs text-slate-400 font-mono">
                                        <div className="flex items-center gap-2 mb-1">
                                            <WrenchScrewdriverIcon className="w-4 h-4 text-slate-500" />
                                            <p className="font-semibold text-slate-300">Tool Call:</p>
                                        </div>
                                        <div className="bg-slate-900/50 p-2 rounded border border-slate-600">
                                            <p className="text-purple-400">{msg.toolCall.name}(<span className="text-amber-400">{JSON.stringify(msg.toolCall.args)}</span>)</p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="w-5 h-5 text-slate-400" />
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-700">
                 <div className="flex gap-2 mb-2">
                    {quickPrompts.map(prompt => (
                        <button 
                            key={prompt}
                            onClick={() => onSendMessage(prompt)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask the agent anything..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};