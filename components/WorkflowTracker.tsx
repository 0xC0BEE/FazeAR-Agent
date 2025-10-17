
import React, { useState, useRef, useEffect } from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Workflow, User } from '../types.ts';
import { WorkflowCard } from './WorkflowCard.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { SpinnerIcon } from './icons/SpinnerIcon.tsx';

interface WorkflowTrackerProps {
  workflows: Workflow[];
  currentUser: User;
  onSelectWorkflow: (workflowId: string) => void;
  selectedWorkflowId: string | null;
}

const INITIAL_LOAD_COUNT = 12;
const BATCH_SIZE = 8;

export const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ workflows, currentUser, onSelectWorkflow, selectedWorkflowId }) => {
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Overdue' | 'In Progress'>('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);

  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const myWorkflows = workflows.filter(w => w.assignee === currentUser.name && w.status !== 'Completed');
  const allWorkflows = workflows.filter(w => w.status !== 'Completed');

  const baseWorkflows = activeTab === 'my' ? myWorkflows : allWorkflows;

  const filteredWorkflows = baseWorkflows.filter(w => {
    const matchesSearch = w.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
      const statusOrder = { 'Overdue': 1, 'In Progress': 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  });

  // Reset visible count and scroll to top when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD_COUNT);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab, searchTerm, statusFilter]);

  // Infinite scroll observer
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredWorkflows.length) {
          setVisibleCount(prevCount => Math.min(prevCount + BATCH_SIZE, filteredWorkflows.length));
        }
      },
      { 
        root: scrollContainer,
        rootMargin: '0px 0px 200px 0px', // Trigger when loader is 200px from bottom
        threshold: 0.01 
      }
    );

    const loader = loaderRef.current;
    if (loader) {
      observer.observe(loader);
    }

    return () => {
      if (loader) {
        observer.unobserve(loader);
      }
    };
  }, [visibleCount, filteredWorkflows.length]);

  const visibleWorkflows = filteredWorkflows.slice(0, visibleCount);

  const getStatusText = () => {
    if (statusFilter === 'all') return '';
    return statusFilter.toLowerCase();
  }

  return (
    <div className="flex flex-col h-full bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div>
            <h2 className="text-lg font-semibold text-white">Workflow Tracker</h2>
            <p className="text-sm text-slate-400">Manage outstanding invoices.</p>
        </div>
        <div className="mt-4">
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-4 h-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by client name..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <div className="mt-2 flex gap-2">
                {(['all', 'Overdue', 'In Progress'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
                            statusFilter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                    >
                        {status === 'all' ? 'All' : status}
                    </button>
                ))}
            </div>
        </div>
      </div>
      <div className="border-b border-slate-700 flex-shrink-0">
        <nav className="flex space-x-2 px-4">
            <button onClick={() => setActiveTab('my')} className={`px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'my' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}>
                My Queue ({myWorkflows.length})
            </button>
             <button onClick={() => setActiveTab('all')} className={`px-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'all' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}>
                All Active ({allWorkflows.length})
            </button>
        </nav>
      </div>
      <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto space-y-2">
        <div className="px-1 pb-2 text-xs text-slate-400 italic">
            Showing {filteredWorkflows.length} {getStatusText()} workflow{filteredWorkflows.length !== 1 && 's'} in "{activeTab === 'my' ? 'My Queue' : 'All Active'}".
        </div>
        {visibleWorkflows.length > 0 ? (
            visibleWorkflows.map(workflow => (
                <WorkflowCard 
                    key={workflow.id}
                    workflow={workflow}
                    isSelected={workflow.id === selectedWorkflowId}
                    onSelect={onSelectWorkflow}
                />
            ))
        ) : (
            <div className="text-center py-10 text-slate-400">
                <p>No workflows match your criteria.</p>
            </div>
        )}
        
        {visibleCount < filteredWorkflows.length && (
            <div ref={loaderRef} className="flex justify-center items-center p-2">
                <SpinnerIcon className="w-5 h-5 animate-spin text-slate-500"/>
            </div>
        )}
      </div>
    </div>
  );
};
