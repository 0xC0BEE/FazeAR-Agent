import React from 'react';
import type { Workflow, User } from '../types.ts';
import { UserIcon } from './icons/UserIcon.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/Table.tsx";

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
        <div className="bg-card rounded-lg shadow-lg p-4 md:p-6 border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Collector Performance Report</h3>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Collector</TableHead>
                            <TableHead className="text-right">Open Workflows</TableHead>
                            <TableHead className="text-right">Assigned AR</TableHead>
                            <TableHead className="text-right">Collected (All Time)</TableHead>
                            <TableHead className="text-right">Avg. Days to Collect</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {collectors.map((collector) => {
                            const stats = calculateStats(collector.name);
                            return (
                                <TableRow key={collector.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-muted-foreground" />
                                            {collector.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{stats.openWorkflows}</TableCell>
                                    <TableCell className="text-right font-mono">${stats.totalAssigned.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono">${stats.amountCollected.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        {stats.avgDaysToCollect !== null ? `${stats.avgDaysToCollect} days` : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};