

import React from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Workflow, User } from '../types.ts';
import { UserIcon } from './icons/UserIcon.tsx';

interface CollectorPerformanceProps {
    workflows: Workflow[];
    users: User[];
}

interface PerformanceStats {
    totalAssigned: number;
    amountCollected: number;
    openWorkflows: number;
    avgDaysToCollect: number | null;
}

export const CollectorPerformance: React.FC<CollectorPerformanceProps> = ({ workflows, users }) => {

    const calculateStats = (userName: string): PerformanceStats => {
        const userWorkflows = workflows.filter(w => w.assignee === userName);
        
        const totalAssigned = userWorkflows
            .filter(w => w.status !== 'Completed')
            .reduce((sum, w) => sum + w.amount, 0);

        const collectedWorkflows = userWorkflows.filter(w => w.status === 'Completed' && w.paymentDate);

        const amountCollected = collectedWorkflows.reduce((sum, w) => sum + w.amount, 0);

        const openWorkflows = userWorkflows.filter(w => w.status !== 'Completed').length;
        
        let totalDays = 0;
        collectedWorkflows.forEach(w => {
            const createDate = new Date(w.createdDate);
            const payDate = new Date(w.paymentDate!);
            const diffTime = Math.abs(payDate.getTime() - createDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalDays += diffDays;
        });

        const avgDaysToCollect = collectedWorkflows.length > 0 
            ? Math.round(totalDays / collectedWorkflows.length) 
            : null;

        return { totalAssigned, amountCollected, openWorkflows, avgDaysToCollect };
    };

    const collectors = users.filter(u => u.role === 'Collector' || u.role === 'Manager');

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg p-4 md:p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Collector Performance Report</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Collector</th>
                            <th scope="col" className="px-6 py-3 text-right">Open Workflows</th>
                            <th scope="col" className="px-6 py-3 text-right">Assigned AR</th>
                            <th scope="col" className="px-6 py-3 text-right">Collected (All Time)</th>
                            <th scope="col" className="px-6 py-3 text-right">Avg. Days to Collect</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collectors.map((collector) => {
                            const stats = calculateStats(collector.name);
                            return (
                                <tr key={collector.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-slate-400" />
                                            {collector.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">{stats.openWorkflows}</td>
                                    <td className="px-6 py-4 text-right font-mono">${stats.totalAssigned.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-mono">${stats.amountCollected.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        {stats.avgDaysToCollect !== null ? `${stats.avgDaysToCollect} days` : 'N/A'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
