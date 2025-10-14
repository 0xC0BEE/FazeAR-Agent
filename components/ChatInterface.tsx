
import React, { useState, useRef, useEffect } from 'react';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { runChatQuery } from '../services/geminiService';
import type { Workflow, User, DunningPlan, ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
    workflows: Workflow[];
    currentUser: User;
    dunningPlans: DunningPlan[];
    selectedWorkflow: Workflow | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ workflows, currentUser, dunningPlans, selectedWorkflow }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        setMessages([
            {
                id: uuidv4(),
                role: 'model',
                content: `Hi ${currentUser.name}, I'm FazeAR. How can I help you with your accounts receivable today? You can ask me to summarize reports, find information, or analyze client data.`
            }
        ]);
    }, [currentUser]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { id: uuidv4(), role: 'user', content: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);
        
        const thinkingMessage: ChatMessage = { id: uuidv4(), role: 'model', content: '', isThinking: true };
        setMessages(prev => [...prev, thinkingMessage]);

        try {
            const history = [...messages, newUserMessage];
            const response = await runChatQuery(history, workflows, currentUser, dunningPlans);
            const modelResponse: ChatMessage = {
                id: uuidv4(),
                role: 'model',
                content: response.text,
            };
            setMessages(prev => [...prev.filter(m => !m.isThinking), modelResponse]);

        } catch (error) {
            console.error("Failed to get response from Gemini:", error);
            const errorMessage: ChatMessage = {
                id: uuidv4(),
                role: 'model',
                content: "Sorry, I'm having trouble connecting right now. Please try again later."
            };
            setMessages(prev => [...prev.filter(m => !m.isThinking), errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const quickPrompts = [
        "Summarize the aging report.",
        selectedWorkflow ? `What's the status of ${selectedWorkflow.clientName}?` : "Which client has the highest overdue balance?",
        "Who is the top performing collector?",
    ];

    return (
        <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Conversational Analytics</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <BotIcon className="w-5 h-5 text-purple-400" />
                            </div>
                        )}
                        <div className={`max-w-md p-3 rounded-lg ${msg.role === 'model' ? 'bg-slate-700' : 'bg-blue-600 text-white'}`}>
                            {msg.isThinking ? (
                                <div className="flex items-center gap-2">
                                    <SpinnerIcon className="w-4 h-4 animate-spin" />
                                    <span className="text-sm text-slate-400">Thinking...</span>
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
            <div className="p-4 border-t border-slate-700">
                 <div className="flex gap-2 mb-2">
                    {quickPrompts.map(prompt => (
                        <button 
                            key={prompt}
                            onClick={() => setInput(prompt)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
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
