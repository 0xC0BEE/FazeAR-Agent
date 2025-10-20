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
  
  const getStatusInfo = () => {
      switch (workflow.status) {
          case 'Overdue':
              return {
                  text: 'Overdue',
                  color: 'text-destructive',
                  bg: 'bg-destructive/10',
                  icon: <ExclamationIcon className="w-3 h-3"/>
              };
          case 'Disputed':
              return {
                  text: 'Disputed',
                  color: 'text-amber-600 dark:text-amber-400',
                  bg: 'bg-amber-500/10',
                  icon: <ExclamationIcon className="w-3 h-3"/>
              };
          default:
              return {
                  text: 'In Progress',
                  color: 'text-muted-foreground',
                  bg: 'bg-muted',
                  icon: null
              };
      }
  }

  const statusInfo = getStatusInfo();
  
  const cardClasses = `w-full p-3 text-left transition-all duration-200 flex flex-col items-start border rounded-lg bg-card border-border hover:bg-accent ${isSelected ? 'bg-primary/10 border-primary hover:bg-primary/20' : ''}`;

  return (
    <button
      onClick={() => onSelect(workflow.id)}
      className={cardClasses}
    >
      <div className="flex justify-between items-start w-full">
        <h3 className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-card-foreground'}`}>{workflow.clientName}</h3>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
           {statusInfo.icon}
           <span>{statusInfo.text}</span>
        </div>
      </div>
      <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
            <DollarIcon className="w-4 h-4 text-muted-foreground/80" />
            <span className="font-mono">${workflow.amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground/80" />
          <span>Due: {new Date(workflow.dueDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-muted-foreground/80" />
          <span>{workflow.assignee}</span>
        </div>
      </div>
    </button>
  );
};
