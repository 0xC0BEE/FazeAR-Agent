
import React, { useState } from 'react';
import type { Workflow } from '../types.ts';
import { UploadIcon } from './icons/UploadIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';
import { CheckIcon } from './icons/CheckIcon.tsx';
import { analyzeCashApplication } from '../services/geminiService.ts';
import { CashAppConfirmationModal } from './CashAppConfirmationModal.tsx';

interface CashAppPanelProps {
  workflows: Workflow[];
  onUpdateWorkflows: (workflows: Workflow[]) => void;
}

interface Match {
  clientName: string;
  invoiceId: string;
  amountPaid: number;
  workflowId: string | null;
  status: 'matched' | 'partial' | 'unmatched';
}

export const CashAppPanel: React.FC<CashAppPanelProps> = ({ workflows, onUpdateWorkflows }) => {
  const [remittanceText, setRemittanceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!remittanceText.trim()) return;
    setIsLoading(true);
    setMatches([]);
    try {
      const response = await analyzeCashApplication(remittanceText);
      const parsedData = JSON.parse(response.text);

      const newMatches = parsedData.map((item: any) => {
        const foundWorkflow = workflows.find(w =>
          (w.id.includes(item.invoiceId) || item.invoiceId.includes(w.id.slice(-6)))
          && w.clientName.toLowerCase().includes(item.clientName.toLowerCase())
          && w.status !== 'Completed'
        );
        
        let status: Match['status'] = 'unmatched';
        if(foundWorkflow) {
           status = foundWorkflow.amount === item.amountPaid ? 'matched' : 'partial';
        }

        return {
          ...item,
          workflowId: foundWorkflow?.id || null,
          status,
        };
      });

      setMatches(newMatches);
      if (newMatches.length > 0) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to analyze remittance info:', error);
      alert('Could not parse the provided information. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirm = (confirmedMatches: Match[]) => {
      const workflowIdsToUpdate = confirmedMatches.filter(m => m.workflowId && m.status === 'matched').map(m => m.workflowId);
      const updated = workflows.map(w => {
          if (workflowIdsToUpdate.includes(w.id)) {
              return {
                  ...w,
                  status: 'Completed' as 'Completed',
                  paymentDate: new Date().toISOString().split('T')[0],
                  auditTrail: [...w.auditTrail, { timestamp: new Date().toISOString(), activity: 'Payment Matched', details: 'Matched via Cash Application panel.' }]
              };
          }
          return w;
      });
      onUpdateWorkflows(updated);
      setIsModalOpen(false);
      setRemittanceText('');
      setMatches([]);
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <UploadIcon className="w-5 h-5 text-slate-400" />
        <h3 className="font-semibold text-white">Cash Application</h3>
      </div>
      <p className="text-xs text-slate-400 mb-3">Paste remittance details from a bank statement or email to automatically match payments.</p>
      <textarea
        value={remittanceText}
        onChange={(e) => setRemittanceText(e.target.value)}
        placeholder={`e.g.\nPayment from Quantum Solutions\nInv: ...c7f5, Amt: $15234.50\nCheck #: 10592`}
        rows={4}
        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mb-3 font-mono"
        disabled={isLoading}
      />
      <button
        onClick={handleAnalyze}
        disabled={isLoading || !remittanceText.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-md text-sm transition-colors disabled:bg-slate-600 flex items-center justify-center gap-2"
      >
        {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <CheckIcon className="w-5 h-5" />}
        Analyze & Match
      </button>
      
      <CashAppConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        matches={matches}
        onConfirm={handleConfirm}
      />
    </div>
  );
};