
import React from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Workflow, User } from '../types.ts';
import { AgingReport } from './AgingReport.tsx';
import { CollectorPerformance } from './CollectorPerformance.tsx';
import { AIInsights } from './AIInsights.tsx';
import { CashFlowChart } from './CashFlowChart.tsx';

interface AnalyticsProps {
  workflows: Workflow[];
  users: User[];
  scenarioWorkflows: Workflow[] | null;
  onClearScenario: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ workflows, users, scenarioWorkflows, onClearScenario }) => {
  return (
    <main className="flex flex-col gap-6">
      <AIInsights />
      <div className="space-y-6">
        <CashFlowChart 
            workflows={workflows} 
            scenarioWorkflows={scenarioWorkflows} 
            onClearScenario={onClearScenario} 
        />
        <AgingReport workflows={workflows} />
        <CollectorPerformance workflows={workflows} users={users} />
      </div>
    </main>
  );
};
