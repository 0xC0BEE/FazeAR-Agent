

import React from 'react';
import type { Workflow } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';

interface WorkflowCardProps {
  workflow: Workflow;
  isSelected: boolean;
  onSelect: (workflowId: string) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, isSelected, onSelect }) => {
  const isOverdue = workflow.status === 'Overdue';
  const hasDisputes = workflow.disputes && workflow.disputes.length > 0;
  
  // Calculate days overdue or until due
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dueDate = new Date(workflow.dueDate);
  // Need to adjust for timezone offset when creating date from string to avoid off-by-one errors
  const utcDueDate = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());
  utcDueDate.setUTCHours(0,0,0,0);

  const timeDiff = utcDueDate.getTime() - today.getTime();
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  let dueDateText;
  if (dayDiff < 0) {
    dueDateText = `${Math.abs(dayDiff)} days overdue`;
  } else if (dayDiff === 0) {
    dueDateText = `Due today`;
  } else {
    dueDateText = `Due in ${dayDiff} days`;
  }

  return (
    <button
      onClick={() => onSelect(workflow.id)}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? 'bg-slate-700/50 border-blue-500 shadow-lg'
          : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 hover:bg-slate-700/30'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-white">{workflow.clientName}</p>
          <p className="text-sm text-slate-400 font-mono">${workflow.amount.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
            {hasDisputes && (
                 <div className="px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 bg-amber-500/20 text-amber-400" title="Has open disputes">
                    <ExclamationIcon className="w-3.5 h-3.5" />
                 </div>
            )}
            <div
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${
                isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}
            >
              {workflow.status}
            </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
         <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4" />
            <span>{new Date(workflow.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
         </div>
         <div className={`flex items-center gap-1.5 font-semibold ${isOverdue ? 'text-red-400' : ''}`}>
            <ClockIcon className="w-4 h-4" />
            <span>{dueDateText}</span>
         </div>
      </div>
    </button>
  );
};