import React, { useState, useRef, useEffect } from 'react';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import type { Workflow, User, ChatMessage } from '../types';

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
        selectedWorkflow ? `What's the status of ${selectedWorkflow.clientName}?` : "Run a cash flow scenario where Innovate Corp pays 30 days late.",
        "Who is the top performing collector?",
    ];

    return (
        <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && !msg.toolCall && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <BotIcon className="w-5 h-5 text-purple-400" />
                            </div>
                        )}
                        <div className={`max-w-md p-3 rounded-lg ${msg.role === 'model' ? (msg.toolCall || msg.toolResponse ? 'bg-slate-800 border border-slate-600' : 'bg-slate-700') : 'bg-blue-600 text-white'}`}>
                            {msg.isThinking ? (
                                <div className="flex items-center gap-2">
                                    <SpinnerIcon className="w-4 h-4 animate-spin" />
                                    <span className="text-sm text-slate-400">Thinking...</span>
                                </div>
                            ) : msg.content ? (
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            ) : msg.toolCall ? (
                                <div className="text-xs text-slate-400 font-mono">
                                    <p className="font-semibold text-slate-300">Tool Call:</p>
                                    <p>{msg.toolCall.name}({JSON.stringify(msg.toolCall.args)})</p>
                                </div>
                            ) : null}
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