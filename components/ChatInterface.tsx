import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Tone, Workflow } from '../types.ts';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { MailIcon } from './icons/MailIcon.tsx';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/DropdownMenu.tsx';

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
    <div className="flex flex-col h-full bg-secondary/40 rounded-lg shadow-lg border">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">Your copilot for accounts receivable.</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={msg.id || index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <BotIcon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className={`max-w-md w-full ${msg.role === 'user' ? 'text-right' : ''}`}>
               <div className={`inline-block p-3 rounded-lg ${
                    msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
               }`}>
                 {msg.isThinking ? (
                     <div className="flex items-center gap-2">
                        <SpinnerIcon className="w-4 h-4 animate-spin"/>
                        <span>Thinking...</span>
                    </div>
                 ) : msg.toolCall ? (
                     <div className="text-xs">
                        <div className="flex items-center gap-2 font-semibold mb-1 text-muted-foreground">
                            <WrenchScrewdriverIcon className="w-4 h-4"/>
                            <span>Tool Call: {msg.toolCall.name}</span>
                        </div>
                        <pre className="bg-background/50 p-2 rounded-md text-left font-mono whitespace-pre-wrap">{JSON.stringify(msg.toolCall.args, null, 2)}</pre>
                     </div>
                 ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                 )}
               </div>
               {msg.role === 'model' && msg.content && !msg.isThinking && (
                 <div className="mt-1 text-right">
                    <Button 
                        variant="link"
                        disabled={!selectedWorkflow}
                        onClick={() => handleLog(msg.content ?? '')}
                        className="flex items-center gap-1 text-xs text-muted-foreground h-auto p-0"
                    >
                        <MailIcon className="w-3 h-3"/> Log Communication
                    </Button>
                 </div>
               )}
            </div>
             {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex-shrink-0">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <span>Tone: {tone}</span>
                <ChevronDownIcon className="w-3 h-3"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {tones.map(t => (
                <DropdownMenuItem key={t} onSelect={() => setTone(t)}>
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Ask a question or give a command..."
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="flex-shrink-0"
          >
            {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <PaperAirplaneIcon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};