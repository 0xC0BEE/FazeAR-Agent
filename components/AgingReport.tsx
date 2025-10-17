
import React from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Workflow } from '../types.ts';

interface AgingReportProps {
    workflows: Workflow[];
}

interface AgingBucket {
    label: string;
    count: number;
    amount: number;
}

export const AgingReport: React.FC<AgingReportProps> = ({ workflows }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

    const buckets: AgingBucket[] = [
        { label: "Current", count: 0, amount: 0 },
        { label: "1-30 Days Overdue", count: 0, amount: 0 },
        { label: "31-60 Days Overdue", count: 0, amount: 0 },
        { label: "61-90 Days Overdue", count: 0, amount: 0 },
        { label: "90+ Days Overdue", count: 0, amount: 0 },
    ];

    const outstandingWorkflows = workflows.filter(w => w.status !== 'Completed');
    const totalReceivable = outstandingWorkflows.reduce((acc, w) => acc + w.amount, 0);

    outstandingWorkflows.forEach(w => {
        const dueDate = new Date(w.dueDate);
        const utcDueDate = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());
        utcDueDate.setHours(0,0,0,0);
        
        const timeDiff = today.getTime() - utcDueDate.getTime();
        const daysOverdue = Math.floor(timeDiff / (1000 * 3600 * 24));

        let bucketIndex = 0;
        if (daysOverdue <= 0) {
            bucketIndex = 0; // Current
        } else if (daysOverdue <= 30) {
            bucketIndex = 1; // 1-30
        } else if (daysOverdue <= 60) {
            bucketIndex = 2; // 31-60
        } else if (daysOverdue <= 90) {
            bucketIndex = 3; // 61-90
        } else {
            bucketIndex = 4; // 90+
        }
        
        buckets[bucketIndex].count++;
        buckets[bucketIndex].amount += w.amount;
    });

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg p-4 md:p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Invoice Aging Report</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Aging Bucket</th>
                            <th scope="col" className="px-6 py-3 text-right"># Invoices</th>
                            <th scope="col" className="px-6 py-3 text-right">Amount</th>
                            <th scope="col" className="px-6 py-3 text-right">% of Total AR</th>
                            <th scope="col" className="px-6 py-3 min-w-[150px]">Distribution</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buckets.map((bucket, index) => {
                            const percentage = totalReceivable > 0 ? (bucket.amount / totalReceivable) * 100 : 0;
                            return (
                                <tr key={index} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">{bucket.label}</td>
                                    <td className="px-6 py-4 text-right">{bucket.count}</td>
                                    <td className="px-6 py-4 text-right font-mono">${bucket.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-mono">{percentage.toFixed(1)}%</td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                     <tfoot className="font-semibold text-white">
                        <tr className="border-t-2 border-slate-600">
                            <td className="px-6 py-3">Total</td>
                            <td className="px-6 py-3 text-right">{outstandingWorkflows.length}</td>
                            <td className="px-6 py-3 text-right font-mono">${totalReceivable.toLocaleString()}</td>
                            <td className="px-6 py-3 text-right font-mono">100.0%</td>
                            <td className="px-6 py-3"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
