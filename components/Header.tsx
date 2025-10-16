// Fix: Implemented the Header component.
import React from 'react';
import { SettingsIcon } from './icons/SettingsIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import type { User } from '../types.ts';

interface HeaderProps {
  onOpenSettings: () => void;
  currentView: 'dashboard' | 'analytics';
  onSetView: (view: 'dashboard' | 'analytics') => void;
  users: User[];
  currentUser: User;
  onSetCurrentUser: (user: User) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, currentView, onSetView, users, currentUser, onSetCurrentUser }) => {
  const navItems: ('dashboard' | 'analytics')[] = ['dashboard', 'analytics'];
  const canViewAnalytics = currentUser.role === 'Admin' || currentUser.role === 'Manager';

  return (
    <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">FazeAR Agent</h1>
        <p className="text-slate-400">Automated Accounts Receivable Management</p>
      </div>
      <div className="flex items-center gap-2">
         <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm font-semibold transition-colors hover:bg-slate-700">
                <UserIcon className="w-5 h-5 text-slate-400" />
                <span>{currentUser.name}</span>
                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
                {users.map(user => (
                    <button 
                        key={user.id}
                        onClick={() => onSetCurrentUser(user)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${currentUser.id === user.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        {user.name}
                    </button>
                ))}
            </div>
         </div>
         <div className="bg-slate-800 border border-slate-700 rounded-lg p-1 flex gap-1">
             {navItems.map(item => {
                if (item === 'analytics' && !canViewAnalytics) return null;
                return (
                 <button 
                    key={item}
                    onClick={() => onSetView(item)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                        currentView === item
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                 >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                 </button>
                )
            })}
         </div>
         {currentUser.role !== 'Collector' && (
             <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg text-slate-400 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Open settings"
             >
                <SettingsIcon className="w-6 h-6" />
             </button>
         )}
      </div>
    </header>
  );
};