import React, { useState, useRef, useEffect } from 'react';
import { SettingsIcon } from './icons/SettingsIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import type { User } from '../types.ts';

type View = 'dashboard' | 'analytics' | 'integrations' | 'portal' | 'knowledge' | 'disputes';

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const navItems: Exclude<View, 'portal' | 'knowledge'>[] = ['dashboard', 'analytics', 'disputes', 'integrations'];
  const canManageSettings = currentUser.role === 'Admin' || currentUser.role === 'Manager';
  const isClientView = currentUser.role === 'Client';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);


  return (
    <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">FazeAR Agent</h1>
        <p className="text-slate-400">{isClientView ? 'Client Payment Portal' : 'Automated Accounts Receivable Management'}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" ref={userMenuRef}>
            <button
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-800 text-slate-300 hover:bg-slate-700 h-10 px-4 py-2 flex items-center gap-2"
            >
                <UserIcon className="w-5 h-5 text-slate-400" />
                <span>{currentUser.name} {currentUser.role === 'Client' && `(${currentUser.clientName})`}</span>
                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </button>
            {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-10 border border-slate-700">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {users.map(user => (
                            <a
                                key={user.id}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSetCurrentUser(user);
                                    setIsUserMenuOpen(false);
                                }}
                                className={`block px-4 py-2 text-sm ${currentUser.id === user.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                role="menuitem"
                            >
                                {user.name} ({user.role})
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
         
         {!isClientView && (
            <>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-1 flex gap-1">
                    {navItems.map(item => {
                        if (item === 'analytics' && !canManageSettings) return null;
                        if (item === 'integrations' && !canManageSettings) return null;
                        const isActive = currentView === item;
                        return (
                        <button 
                            key={item}
                            onClick={() => onSetView(item)}
                            className={`px-3 py-1.5 h-auto text-sm rounded-md transition-colors ${isActive ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                        >
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </button>
                        )
                    })}
                </div>
                <button
                    onClick={() => onSetView('knowledge')}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 px-3 py-1.5 h-auto ${currentView === 'knowledge' ? 'border border-blue-500 bg-slate-900 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                    Knowledge Base
                </button>
            </>
         )}

         {canManageSettings && (
            <>
            <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-2 py-2 text-sm">
                <label htmlFor="autonomous-mode" className="flex items-center gap-1.5 cursor-pointer">
                    <BotIcon className={`w-5 h-5 ${isGlobalAutonomous ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className={`font-semibold ${isGlobalAutonomous ? 'text-white' : 'text-slate-400'}`}>Autonomous</span>
                </label>
                 <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox"
                        id="autonomous-mode"
                        checked={isGlobalAutonomous}
                        onChange={(e) => onSetGlobalAutonomous(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
            </div>
             <button
                onClick={onOpenSettings}
                aria-label="Open settings"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-800 text-slate-300 hover:bg-slate-700 h-10 w-10"
             >
                <SettingsIcon className="w-6 h-6" />
             </button>
            </>
         )}
      </div>
    </header>
  );
};
