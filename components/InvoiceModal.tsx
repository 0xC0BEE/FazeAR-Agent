import React from 'react';
import type { Workflow } from '../types.ts';
import { XIcon } from './icons/XIcon.tsx';
import { PrinterIcon } from './icons/PrinterIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, workflow }) => {
  if (!isOpen || !workflow) {
    return null;
  }

  const subtotal = workflow.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300 print:hidden" onClick={onClose}>
      <div 
        className="bg-white text-slate-800 rounded-lg shadow-2xl w-full max-w-3xl m-4 transform transition-transform duration-300 scale-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-slate-900">Invoice {workflow.externalId}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} title="Print or Save as PDF" className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <PrinterIcon className="w-6 h-6" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Printable Area */}
        <div id="invoice-printable-area" className="p-8 bg-white">
            <header className="flex justify-between items-start mb-10">
                <div>
                    <BotIcon className="w-12 h-12 text-slate-800"/>
                    <h1 className="text-2xl font-bold">FazeAR Inc.</h1>
                    <p className="text-sm text-slate-500">123 AI Lane, Future City, 90210</p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-bold uppercase text-slate-400">Invoice</h2>
                    <p className="font-mono"># {workflow.externalId}</p>
                </div>
            </header>
            
            <section className="grid grid-cols-2 gap-8 mb-10">
                 <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Bill To</h3>
                    <p className="font-bold text-slate-900">{workflow.clientName}</p>
                </div>
                 <div className="text-right">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Details</h3>
                    <p><span className="font-semibold">Date Created:</span> {new Date(workflow.createdDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Date Due:</span> {new Date(workflow.dueDate).toLocaleDateString()}</p>
                </div>
            </section>
            
            <section>
                 <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr className="border-b-2 border-slate-900">
                            <th className="py-2 px-4 text-left font-semibold uppercase tracking-wider text-slate-500">Description</th>
                            <th className="py-2 px-4 text-right font-semibold uppercase tracking-wider text-slate-500">Quantity</th>
                            <th className="py-2 px-4 text-right font-semibold uppercase tracking-wider text-slate-500">Unit Price</th>
                            <th className="py-2 px-4 text-right font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workflow.items.map((item, index) => (
                             <tr key={index} className="border-b border-slate-200">
                                <td className="py-3 px-4">{item.description}</td>
                                <td className="py-3 px-4 text-right font-mono">{item.quantity}</td>
                                <td className="py-3 px-4 text-right font-mono">${item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="py-3 px-4 text-right font-mono">${(item.quantity * item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            <section className="flex justify-end mt-8">
                <div className="w-full max-w-xs">
                    <div className="flex justify-between py-2 border-b border-slate-300">
                        <span className="font-semibold">Subtotal</span>
                        <span className="font-mono">${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                     <div className="flex justify-between py-2 border-b border-slate-300">
                        <span className="font-semibold">Taxes</span>
                        <span className="font-mono">$0.00</span>
                    </div>
                    <div className="flex justify-between py-3 bg-slate-100 font-bold text-lg">
                        <span>Total Due</span>
                        <span className="font-mono">${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            </section>

             <footer className="mt-12 text-center text-xs text-slate-500">
                <p>Thank you for your business! Please make payments to FazeAR Inc.</p>
            </footer>
        </div>
      </div>
       <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                .fixed.inset-0 {
                    position: absolute;
                }
                #invoice-printable-area, #invoice-printable-area * {
                    visibility: visible;
                }
                #invoice-printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                 .bg-white {
                    background-color: transparent !important;
                }
                .text-slate-800 { color: #1e293b !important; }
                .text-slate-900 { color: #0f172a !important; }
                .text-slate-500 { color: #64748b !important; }
                .text-slate-400 { color: #94a3b8 !important; }
                .border-slate-200 { border-color: #e2e8f0 !important; }
                .border-slate-900 { border-color: #0f172a !important; }
                .bg-slate-50 { background-color: #f8fafc !important; }
            }
       `}</style>
    </div>
  );
};