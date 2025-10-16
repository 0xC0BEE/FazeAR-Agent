import React from 'react';
import type { Workflow, User } from '../types.ts';
import { AgingReport } from './AgingReport.tsx';
import { CollectorPerformance } from './CollectorPerformance.tsx';
import { AIInsights } from './AIInsights.tsx';

interface AnalyticsProps {
  workflows: Workflow[];
  users: User[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ workflows, users }) => {
  return (
    <main className="flex flex-col gap-6">
      <AIInsights />
      <div className="space-y-6">
        <AgingReport workflows={workflows} />
        <CollectorPerformance workflows={workflows} users={users} />
      </div>
    </main>
  );
};