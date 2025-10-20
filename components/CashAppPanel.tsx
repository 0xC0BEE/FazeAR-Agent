import React from 'react';
import type { Match } from '../types.ts';
import { Button } from './ui/Button.tsx';
import { Textarea } from './ui/Textarea.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { UploadIcon } from './icons/UploadIcon.tsx';

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
        <div className="flex flex-col h-full p-4 bg-card text-card-foreground">
            {pendingMatches && (
                <div className="bg-secondary border border-border rounded-lg p-3 text-center mb-4">
                    <p className="text-sm font-semibold text-secondary-foreground mb-2">The AI agent has analyzed a remittance advice email.</p>
                    <Button 
                        onClick={onShowPendingMatches}
                        variant="secondary"
                        size="sm"
                    >
                        Review {pendingMatches.length} Suggested Matches
                    </Button>
                </div>
            )}
            <h3 className="text-base font-semibold mb-2">Cash Application AI</h3>
            <p className="text-sm text-muted-foreground mb-4">Paste remittance advice from an email or bank statement to automatically match payments to invoices.</p>
            <Textarea
                value={remittanceText}
                onChange={(e) => onSetRemittanceText(e.target.value)}
                rows={8}
                placeholder="Paste remittance text here..."
                className="flex-grow"
                disabled={isLoading}
            />
            <div className="mt-4 space-y-2">
                 <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || !remittanceText.trim()}
                    className="w-full"
                >
                    {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <UploadIcon className="w-5 h-5" />}
                    <span className="ml-2">Analyze & Match Payments</span>
                </Button>
                 <Button
                    onClick={onSimulate}
                    disabled={isLoading}
                    variant="link"
                    className="w-full text-xs"
                >
                    Or, simulate with sample data
                </Button>
            </div>
        </div>
    );
};
