import React from 'react';
import { SettingsIcon } from './icons/SettingsIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import type { User } from '../types.ts';
import { Button } from './ui/Button.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/DropdownMenu.tsx';
import { Switch } from './ui/Switch.tsx';
import { Label } from './ui/Label.tsx';

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
  
  const navItems: Exclude<View, 'portal' | 'knowledge'>[] = ['dashboard', 'analytics', 'disputes', 'integrations'];
  const canManageSettings = currentUser.role === 'Admin' || currentUser.role === 'Manager';
  const isClientView = currentUser.role === 'Client';

  return (
    <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">FazeAR Agent</h1>
        <p className="text-muted-foreground">{isClientView ? 'Client Payment Portal' : 'Automated Accounts Receivable Management'}</p>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                    <span>{currentUser.name} {currentUser.role === 'Client' && `(${currentUser.clientName})`}</span>
                    <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {users.map(user => (
                    <DropdownMenuItem 
                        key={user.id} 
                        onSelect={() => onSetCurrentUser(user)}
                        className={currentUser.id === user.id ? 'bg-primary/10' : ''}
                    >
                        {user.name} ({user.role})
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
         
         {!isClientView && (
            <>
                <div className="bg-secondary border rounded-lg p-1 flex gap-1">
                    {navItems.map(item => {
                        if (item === 'analytics' && !canManageSettings) return null;
                        if (item === 'integrations' && !canManageSettings) return null;
                        return (
                        <Button
                            key={item}
                            variant={currentView === item ? "ghost" : "ghost"}
                            onClick={() => onSetView(item)}
                            className={`px-3 py-1.5 h-auto text-sm ${currentView === item ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-accent-foreground'}`}
                        >
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </Button>
                        )
                    })}
                </div>
                <Button
                    variant={currentView === 'knowledge' ? "outline" : "secondary"}
                    onClick={() => onSetView('knowledge')}
                    className="px-3 py-1.5 h-auto text-sm"
                >
                    Knowledge Base
                </Button>
            </>
         )}

         {canManageSettings && (
            <>
            <div className="flex items-center gap-3 bg-secondary border rounded-lg pl-3 pr-2 py-2 text-sm">
                <Label htmlFor="autonomous-mode" className="flex items-center gap-1.5 cursor-pointer">
                    <BotIcon className={`w-5 h-5 transition-colors ${isGlobalAutonomous ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                    <span className={`font-semibold transition-colors ${isGlobalAutonomous ? 'text-foreground' : 'text-muted-foreground'}`}>Autonomous</span>
                </Label>
                 <Switch
                    id="autonomous-mode"
                    checked={isGlobalAutonomous}
                    onCheckedChange={onSetGlobalAutonomous}
                />
            </div>
             <Button onClick={onOpenSettings} variant="secondary" size="icon" aria-label="Open settings">
                <SettingsIcon className="w-6 h-6" />
             </Button>
            </>
         )}
      </div>
    </header>
  );
};