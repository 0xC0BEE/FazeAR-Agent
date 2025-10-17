
import React from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Settings, Integration } from '../types.ts';
import { QuickBooksIcon } from './icons/QuickBooksIcon.tsx';
import { StripeIcon } from './icons/StripeIcon.tsx';
import { GmailIcon } from './icons/GmailIcon.tsx';
import { LinkIcon } from './icons/LinkIcon.tsx';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';

interface IntegrationsHubProps {
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
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
        <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 flex flex-col p-6">
            <div className="flex items-center gap-4 mb-4">
                {getIcon()}
                <div>
                    <h3 className="text-xl font-bold text-white">{integration.name}</h3>
                    {integration.connected ? (
                        <div className="flex items-center gap-1.5 text-sm text-green-400">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Connected</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <LinkIcon className="w-4 h-4" />
                            <span>Not Connected</span>
                        </div>
                    )}
                </div>
            </div>
            <p className="text-sm text-slate-400 flex-grow">{integration.description}</p>
            <div className="mt-6">
                <button
                    onClick={() => onToggle(integration.id)}
                    className={`w-full font-semibold px-4 py-2 rounded-md text-sm transition-colors ${
                        integration.connected
                            ? 'bg-slate-700 hover:bg-red-800/50 hover:border-red-600 text-slate-300 hover:text-white border border-transparent'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
            </div>
        </div>
    );
};


export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({ settings, onUpdateSettings }) => {

    const handleIntegrationToggle = (id: Integration['id']) => {
        const updatedIntegrations = settings.integrations.map(int => 
            int.id === id ? { ...int, connected: !int.connected } : int
        );
        onUpdateSettings({ integrations: updatedIntegrations });
    };

  return (
    <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Integrations Hub</h2>
            <p className="text-slate-400 mt-2">Connect your tools to unlock the full power of the FazeAR agent.</p>
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
    </div>
  );
};
