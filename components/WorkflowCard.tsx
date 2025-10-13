
import React from 'react';
import type { Workflow } from '../types';

// Helper functions that would normally be in a utils file
const getStatusClass = (status: Workflow['status']) => {
  switch (status) {
    case 'Overdue': return 'text-red-400';
    case 'Completed': return 'text-green-400';
    case 'In Progress': return 'text-yellow-400';
    default: return 'text-slate-400';
  }
};

const getDaysOverdue = (dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    // Adjust for timezone to avoid off-by-one day errors
    const due = new Date(Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()));
    const now = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    const timeDiff = now.getTime() - due.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
};

interface WorkflowCardProps {
  workflow: Workflow;
  isSelected: boolean;
  onSelect: (workflowId: string) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, isSelected, onSelect }) => {
  const days = getDaysOverdue(workflow.dueDate);

  let statusLabel: string;
  if (workflow.status === 'Overdue') {
      statusLabel = `${days} days overdue`;
  } else if (workflow.status === 'In Progress') {
      if (days > 0) {
        statusLabel = `${days} days overdue`;
      } else if (days === 0) {
        statusLabel = 'Due today';
      } else {
        statusLabel = `Due in ${-days} days`;
      }
  } else {
      statusLabel = workflow.status;
  }
  
  return (
    <button 
      onClick={() => onSelect(workflow.id)}
      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${isSelected ? 'bg-slate-700 border-blue-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-white">{workflow.clientName}</h3>
        <p className={`text-sm font-bold ${getStatusClass(workflow.status)}`}>${workflow.amount.toLocaleString()}</p>
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
        <p>Assignee: {workflow.assignee}</p>
        <p className={workflow.status === 'Overdue' || (workflow.status === 'In Progress' && days > 0) ? 'text-red-400' : ''}>
          {statusLabel}
        </p>
      </div>
    </button>
  );
};
