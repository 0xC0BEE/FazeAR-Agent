import React from 'react';
import type { Workflow } from '../types.ts';
import { XIcon } from './icons/XIcon.tsx';

interface CashFlowChartProps {
  workflows: Workflow[];
  scenarioWorkflows: Workflow[] | null;
  onClearScenario: () => void;
}

const getMonthName = (monthIndex: number) => {
  const date = new Date();
  date.setMonth(monthIndex);
  return date.toLocaleString('default', { month: 'short' });
};

const calculateForecast = (workflows: Workflow[], currentMonth: number, currentYear: number) => {
    const forecastData = [
        { month: getMonthName(currentMonth), amount: 0 },
        { month: getMonthName(currentMonth + 1), amount: 0 },
        { month: getMonthName(currentMonth + 2), amount: 0 },
    ];

    workflows.forEach(w => {
        if (w.status !== 'Completed') {
            const dueDate = new Date(w.dueDate);
            // Adjust for timezone to avoid off-by-one day errors
            const dueMonth = dueDate.getUTCMonth();
            const dueYear = dueDate.getUTCFullYear();
            
            let monthDiff = (dueYear - currentYear) * 12 + (dueMonth - currentMonth);

            if (monthDiff >= 0 && monthDiff < 3) {
                 forecastData[monthDiff].amount += w.amount;
            }
        }
    });

    return forecastData;
};

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ workflows, scenarioWorkflows, onClearScenario }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const baseForecast = calculateForecast(workflows, currentMonth, currentYear);
  const scenarioForecast = scenarioWorkflows ? calculateForecast(scenarioWorkflows, currentMonth, currentYear) : null;

  const allAmounts = [...baseForecast.map(d => d.amount)];
  if (scenarioForecast) {
    allAmounts.push(...scenarioForecast.map(d => d.amount));
  }
  const maxAmount = Math.max(...allAmounts, 1); // Avoid division by zero

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 md:p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">90-Day Cash Flow Forecast</h3>
        <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                <span>Current</span>
            </div>
            {scenarioForecast && (
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                    <span>Scenario</span>
                </div>
            )}
        </div>
      </div>
       {scenarioWorkflows && (
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-3 flex justify-between items-center mb-4 text-sm">
              <p className="font-semibold text-purple-200">Showing "What-If" Scenario</p>
              <button 
                onClick={onClearScenario}
                className="flex items-center gap-1 text-xs font-semibold text-purple-200 hover:text-white bg-purple-800/50 hover:bg-purple-700 px-2 py-1 rounded-md transition-colors"
              >
                <XIcon className="w-3 h-3" />
                Clear
              </button>
          </div>
      )}
      <div className="flex justify-between items-end h-48 space-x-4">
        {baseForecast.map((data, index) => (
          <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
             <div className="flex items-center gap-1 text-sm font-bold text-white mb-1">
                <span>${data.amount.toLocaleString()}</span>
                {scenarioForecast && data.amount !== scenarioForecast[index].amount && (
                    <span className="text-purple-400">(${scenarioForecast[index].amount.toLocaleString()})</span>
                )}
            </div>
            <div className="w-full flex items-end gap-1 h-full">
              <div
                className="w-full bg-blue-500 rounded-t-md hover:bg-blue-400 transition-all"
                style={{ height: `${(data.amount / maxAmount) * 100}%` }}
                title={`Current: $${data.amount.toLocaleString()}`}
              ></div>
              {scenarioForecast && (
                 <div
                    className="w-full bg-purple-500 rounded-t-md hover:bg-purple-400 transition-all"
                    style={{ height: `${(scenarioForecast[index].amount / maxAmount) * 100}%` }}
                    title={`Scenario: $${scenarioForecast[index].amount.toLocaleString()}`}
                 ></div>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-2">{data.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
};