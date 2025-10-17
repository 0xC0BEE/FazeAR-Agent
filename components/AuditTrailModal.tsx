
import React from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Workflow } from '../types.ts';
import { XIcon } from './icons/XIcon.tsx';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose, workflow }) => {
  if (!isOpen || !workflow) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl m-4 border border-slate-700 transform transition-transform duration-300 scale-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Audit Trail for {workflow.clientName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {workflow.auditTrail.length === 0 ? (
            <p className="text-slate-400 text-center">No audit trail records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Timestamp</th>
                    <th scope="col" className="px-6 py-3">Activity</th>
                    <th scope="col" className="px-6 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {[...workflow.auditTrail].reverse().map((entry, index) => (
                    <tr key={index} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4">{entry.activity}</td>
                      <td className="px-6 py-4 whitespace-pre-wrap">{entry.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
