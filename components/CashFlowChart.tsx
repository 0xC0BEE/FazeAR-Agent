import React, { useMemo } from 'react';
import type { Workflow } from '../types.ts';
import { Button } from './ui/Button.tsx';
import { XIcon } from './icons/XIcon.tsx';

interface CashFlowChartProps {
  workflows: Workflow[];
  scenarioWorkflows: Workflow[] | null;
  onClearScenario: () => void;
}

const getMonthlyData = (workflows: Workflow[], scenarioWorkflows: Workflow[] | null) => {
    const today = new Date();
    const months: { name: string; actual: number; scenario: number }[] = [];
  
    for (let i = -2; i <= 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        name: date.toLocaleString('default', { month: 'short' }),
        actual: 0,
        scenario: 0,
      });
    }

    const processWorkflows = (data: Workflow[], key: 'actual' | 'scenario') => {
        data.forEach(w => {
            if (w.status === 'Completed' && w.paymentDate) {
                const paymentDate = new Date(w.paymentDate);
                const monthIndex = paymentDate.getMonth() - today.getMonth() + 2 + (paymentDate.getFullYear() - today.getFullYear()) * 12;
                if (monthIndex >= 0 && monthIndex < months.length) {
                    months[monthIndex][key] += w.amount;
                }
            } else { // Forecasted for open invoices
                const dueDate = new Date(w.dueDate);
                const monthIndex = dueDate.getMonth() - today.getMonth() + 2 + (dueDate.getFullYear() - today.getFullYear()) * 12;
                 if (monthIndex >= 0 && monthIndex < months.length) {
                    months[monthIndex][key] += w.amount;
                }
            }
        });
    }
    
    processWorkflows(workflows, 'actual');
    if (scenarioWorkflows) {
        processWorkflows(scenarioWorkflows, 'scenario');
    } else {
        processWorkflows(workflows, 'scenario');
    }
  
    return months;
};


export const CashFlowChart: React.FC<CashFlowChartProps> = ({ workflows, scenarioWorkflows, onClearScenario }) => {

  const combinedData = useMemo(() => getMonthlyData(workflows, scenarioWorkflows), [workflows, scenarioWorkflows]);

  const maxValue = useMemo(() => {
    return Math.max(...combinedData.map(d => Math.max(d.actual, d.scenario)));
  }, [combinedData]);

  return (
    <div className="bg-card rounded-lg shadow-lg p-4 md:p-6 border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Cash Flow Forecast</h3>
          <p className="text-sm text-muted-foreground">Actual vs. Projected Incoming Cash (next 3 months)</p>
        </div>
         {scenarioWorkflows && (
          <Button onClick={onClearScenario} size="sm" variant="ghost" className="gap-1.5 text-xs">
            <XIcon className="w-4 h-4"/>
            Clear Scenario
          </Button>
        )}
      </div>

      <div className="h-64 w-full flex justify-around items-end gap-4 pr-4">
        {combinedData.map((entry, index) => (
          <div key={index} className="flex-1 flex flex-col items-center h-full">
            <div className="flex-1 flex items-end justify-center w-full gap-2">
                <div className="w-1/2 h-full flex items-end">
                    <div 
                        className="w-full bg-primary rounded-t-sm"
                        style={{ height: `${(entry.actual / Math.max(maxValue, 1)) * 100}%` }}
                        title={`Actual: $${entry.actual.toLocaleString()}`}
                    ></div>
                </div>
                 <div className="w-1/2 h-full flex items-end">
                    <div 
                        className={`w-full bg-secondary rounded-t-sm transition-all duration-300 ${scenarioWorkflows ? '' : 'opacity-0'}`}
                        style={{ height: `${(entry.scenario / Math.max(maxValue, 1)) * 100}%` }}
                        title={`Scenario: $${entry.scenario.toLocaleString()}`}
                    ></div>
                </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">{entry.name}</div>
          </div>
        ))}
      </div>
       <div className="mt-4 flex justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
                <span>Actual/Forecast</span>
            </div>
             <div className={`flex items-center gap-2 transition-opacity ${scenarioWorkflows ? 'opacity-100' : 'opacity-50'}`}>
                <div className="w-3 h-3 rounded-sm bg-secondary"></div>
                <span>'What-If' Scenario</span>
            </div>
        </div>
    </div>
  );
};