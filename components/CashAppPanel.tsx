import React from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import type { Match } from '../types.ts';

interface CashAppPanelProps {
  remittanceText: string;
  onSetRemittanceText: (text: string) => void;
  onAnalyze: (text: string) => void;
  isLoading: boolean;
  onSimulate: () => void;
  pendingMatches: Match[] | null;
  onShowPendingMatches: () => void;
}

export const CashAppPanel: React.FC<CashAppPanelProps> = ({ 
    remittanceText, 
    onSetRemittanceText, 
    onAnalyze, 
    isLoading, 
    onSimulate,
    pendingMatches,
    onShowPendingMatches
}) => {

    const handleAnalyze = () => {
        if (remittanceText.trim()) {
            onAnalyze(remittanceText);
        }
    };
    
    return (
        <div className="flex flex-col h-full p-4">
            {pendingMatches && (
                <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-3 text-center mb-4">
                    <p className="text-sm font-semibold text-purple-200 mb-2">The AI agent has analyzed a remittance advice email.</p>
                    <button 
                        onClick={onShowPendingMatches}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-md text-xs"
                    >
                        Review {pendingMatches.length} Suggested Matches
                    </button>
                </div>
            )}
            <h3 className="text-base font-semibold text-white mb-2">Cash Application AI</h3>
            <p className="text-sm text-slate-400 mb-4">Paste remittance advice from an email or bank statement to automatically match payments to invoices.</p>
            <textarea
                value={remittanceText}
                onChange={(e) => onSetRemittanceText(e.target.value)}
                rows={8}
                placeholder="Paste remittance text here..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow"
                disabled={isLoading}
            />
            <div className="mt-4 space-y-2">
                 <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !remittanceText.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold p-2 rounded-lg transition-colors hover:bg-purple-700 disabled:bg-slate-600"
                >
                    {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <UploadIcon className="w-5 h-5" />}
                    Analyze & Match Payments
                </button>
                 <button
                    onClick={onSimulate}
                    disabled={isLoading}
                    className="w-full text-xs text-slate-400 hover:text-white transition-colors"
                >
                    Or, simulate with sample data
                </button>
            </div>
        </div>
    );
};