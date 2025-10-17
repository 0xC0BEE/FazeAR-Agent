// Fix: Implemented the Header component.
import React from 'react';
import { SettingsIcon } from './icons/SettingsIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import type { User } from '../types.ts';

type View = 'dashboard' | 'analytics' | 'integrations' | 'portal';

interface HeaderProps {
  onOpenSettings: () => void;
  currentView: View;
  onSetView: (view: View) => void;
  users: User[];
  currentUser: User;
  onSetCurrentUser: (user: User) => void;
  isGlobalAutonomous: boolean;
  onSetGlobalAutonomous: (isActive: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onOpenSettings, 
    currentView, 
    onSetView, 
    users, 
    currentUser, 
    onSetCurrentUser,
    isGlobalAutonomous,
    onSetGlobalAutonomous
}) => {
  const navItems: Exclude<View, 'portal'>[] = ['dashboard', 'analytics', 'integrations'];
  const canManageSettings = currentUser.role === 'Admin' || currentUser.role === 'Manager';
  const isClientView = currentUser.role === 'Client';

  return (
    <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">FazeAR Agent</h1>
        <p className="text-slate-400">{isClientView ? 'Client Payment Portal' : 'Automated Accounts Receivable Management'}</p>
      </div>
      <div className="flex items-center gap-2">
         <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm font-semibold transition-colors hover:bg-slate-700">
                <UserIcon className="w-5 h-5 text-slate-400" />
                <span>{currentUser.name} {currentUser.role === 'Client' && `(${currentUser.clientName})`}</span>
                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
                {users.map(user => (
                    <button 
                        key={user.id}
                        onClick={() => onSetCurrentUser(user)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md ${currentUser.id === user.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        {user.name} ({user.role})
                    </button>
                ))}
            </div>
         </div>
         
         {!isClientView && (
            <>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-1 flex gap-1">
                    {navItems.map(item => {
                        if (item === 'analytics' && !canManageSettings) return null;
                        if (item === 'integrations' && !canManageSettings) return null;
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
                <button 
                    onClick={() => onSetView('portal')}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors bg-slate-800 border border-slate-700 ${
                        currentView === 'portal'
                            ? 'text-white ring-1 ring-blue-500'
                            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    Client Portal
                </button>
            </>
         )}

         {canManageSettings && (
            <>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-1 py-1 text-sm">
                <div className="flex items-center gap-1.5">
                    <BotIcon className={`w-5 h-5 ${isGlobalAutonomous ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className={`font-semibold ${isGlobalAutonomous ? 'text-white' : 'text-slate-400'}`}>Autonomous</span>
                </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isGlobalAutonomous}
                    onChange={(e) => onSetGlobalAutonomous(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
            </div>
             <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg text-slate-400 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Open settings"
             >
                <SettingsIcon className="w-6 h-6" />
             </button>
            </>
         )}
      </div>
    </header>
  );
};