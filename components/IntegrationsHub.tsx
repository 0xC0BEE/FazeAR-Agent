import React from 'react';
import type { Settings, Integration, Workflow } from '../types.ts';
import { QuickBooksIcon } from './icons/QuickBooksIcon.tsx';
import { StripeIcon } from './icons/StripeIcon.tsx';
import { GmailIcon } from './icons/GmailIcon.tsx';
import { LinkIcon } from './icons/LinkIcon.tsx';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';
import { WebhookListener } from './WebhookListener.tsx';
import { Button } from './ui/Button.tsx';
import { BotIcon } from './icons/BotIcon.tsx';

interface IntegrationsHubProps {
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  workflows: Workflow[];
  onSimulateEvent: (type: string, data: any) => void;
}

const IntegrationCard: React.FC<{ integration: Integration, onToggle: (id: Integration['id']) => void }> = ({ integration, onToggle }) => {
    const getIcon = () => {
        switch (integration.id) {
            case 'quickbooks': return <QuickBooksIcon className="w-10 h-10" />;
            case 'stripe': return <StripeIcon className="w-10 h-10" />;
            case 'gmail': return <GmailIcon className="w-10 h-10" />;
            default: return null;
        }
    };

    return (
        <div className="bg-card rounded-lg shadow-lg border flex flex-col p-6">
            <div className="flex items-center gap-4 mb-4">
                {getIcon()}
                <div>
                    <h3 className="text-xl font-bold text-card-foreground">{integration.name}</h3>
                    {integration.connected ? (
                        <div className="flex items-center gap-1.5 text-sm text-green-500">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Connected</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <LinkIcon className="w-4 h-4" />
                            <span>Not Connected</span>
                        </div>
                    )}
                </div>
            </div>
            <p className="text-sm text-muted-foreground flex-grow">{integration.description}</p>
            {integration.connected && integration.id === 'gmail' && (
                <div className="mt-4 text-xs text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded-md flex items-center gap-2">
                    <BotIcon className="w-4 h-4 flex-shrink-0" />
                    <span>Automated remittance scanning is active.</span>
                </div>
            )}
            <div className="mt-6">
                <Button
                    onClick={() => onToggle(integration.id)}
                    variant={integration.connected ? 'destructive' : 'default'}
                    className="w-full"
                >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                </Button>
            </div>
        </div>
    );
};


export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({ settings, onUpdateSettings, workflows, onSimulateEvent }) => {

    const handleIntegrationToggle = (id: Integration['id']) => {
        const updatedIntegrations = settings.integrations.map(int => 
            int.id === id ? { ...int, connected: !int.connected } : int
        );
        onUpdateSettings({ integrations: updatedIntegrations });
    };

  return (
    <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Integrations Hub</h2>
            <p className="text-muted-foreground mt-2">Connect your tools to unlock the full power of the FazeAR agent.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.integrations.map(integration => (
                <IntegrationCard 
                    key={integration.id}
                    integration={integration}
                    onToggle={handleIntegrationToggle}
                />
            ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
             <WebhookListener 
                workflows={workflows}
                onSimulateEvent={onSimulateEvent}
             />
        </div>
    </div>
  );
};