
import React from 'react';
import type { Workflow } from '../types.ts';
import { CalendarIcon } from './icons/CalendarIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { DollarIcon } from './icons/DollarIcon.tsx';
import { ExclamationIcon } from './icons/ExclamationIcon.tsx';

interface WorkflowCardProps {
  workflow: Workflow;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, isSelected, onSelect }) => {
  const isOverdue = workflow.status === 'Overdue';
  
  const cardBg = isSelected
    ? 'bg-blue-600/30 border-blue-500'
    : 'bg-slate-900/50 border-slate-700 hover:border-slate-500';

  const statusColor = isOverdue ? 'text-red-400' : 'text-amber-400';
  const statusBg = isOverdue ? 'bg-red-900/50' : 'bg-amber-900/50';

  return (
    <button
      onClick={() => onSelect(workflow.id)}
      className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${cardBg}`}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-bold text-base ${isSelected ? 'text-white' : 'text-slate-200'}`}>{workflow.clientName}</h3>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusBg} ${statusColor}`}>
           {isOverdue && <ExclamationIcon className="w-3 h-3"/>}
           <span>{workflow.status}</span>
        </div>
      </div>
      <div className="mt-2 space-y-1.5 text-sm text-slate-400">
        <div className="flex items-center gap-2">
            <DollarIcon className="w-4 h-4 text-slate-500" />
            <span className="font-mono">${workflow.amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-500" />
          <span>Due: {new Date(workflow.dueDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-slate-500" />
          <span>{workflow.assignee}</span>
        </div>
      </div>
    </button>
  );
};