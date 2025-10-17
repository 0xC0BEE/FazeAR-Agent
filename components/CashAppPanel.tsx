import React from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface CashAppPanelProps {
  remittanceText: string;
  onSetRemittanceText: (text: string) => void;
  onAnalyze: (text: string) => void;
  isLoading: boolean;
  onSimulate: () => void;
}

export const CashAppPanel: React.FC<CashAppPanelProps> = ({ 
    remittanceText, 
    onSetRemittanceText, 
    onAnalyze, 
    isLoading, 
    onSimulate 
}) => {

    const handleAnalyze = () => {
        if (remittanceText.trim()) {
            onAnalyze(remittanceText);
        }
    };
    
    return (
        <div className="flex flex-col h-full p-4">
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