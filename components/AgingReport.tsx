import React from 'react';
import type { Workflow } from '../types.ts';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/Table.tsx";

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
        <div className="bg-card rounded-lg shadow-lg p-4 md:p-6 border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Invoice Aging Report</h3>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aging Bucket</TableHead>
                            <TableHead className="text-right"># Invoices</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">% of Total AR</TableHead>
                            <TableHead className="min-w-[150px]">Distribution</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {buckets.map((bucket, index) => {
                            const percentage = totalReceivable > 0 ? (bucket.amount / totalReceivable) * 100 : 0;
                            return (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{bucket.label}</TableCell>
                                    <TableCell className="text-right">{bucket.count}</TableCell>
                                    <TableCell className="text-right font-mono">${bucket.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono">{percentage.toFixed(1)}%</TableCell>
                                    <TableCell>
                                        <div className="w-full bg-muted rounded-full h-2.5">
                                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                     <TableFooter>
                        <TableRow>
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right">{outstandingWorkflows.length}</TableCell>
                            <TableCell className="text-right font-mono">${totalReceivable.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">100.0%</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    );
};