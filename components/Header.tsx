import React from 'react';
import { SettingsIcon as Settings } from './icons/SettingsIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { BotIcon as Bot } from './icons/BotIcon.tsx';
import { MoonIcon as Moon } from './icons/MoonIcon.tsx';
import { SunIcon as Sun } from './icons/SunIcon.tsx';
import type { User } from '../types.ts';
import { useTheme } from "./ThemeProvider.tsx";
import { Button } from "./ui/Button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu.tsx";
import { Switch } from "./ui/Switch.tsx";
import { Label } from "./ui/Label.tsx";

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
  const { setTheme } = useTheme();

  const navItems: {key: Exclude<View, 'portal'>, label: string}[] = [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'analytics', label: 'Analytics' },
      { key: 'disputes', label: 'Disputes' },
      { key: 'integrations', label: 'Integrations' },
      { key: 'knowledge', label: 'Knowledge Base' },
  ];

  const canManageSettings = currentUser.role === 'Admin' || currentUser.role === 'Manager';
  const isClientView = currentUser.role === 'Client';

  return (
    <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">FazeAR Agent</h1>
        <p className="text-muted-foreground">{isClientView ? 'Client Payment Portal' : 'Automated Accounts Receivable Management'}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* User Switcher */}
        <div className="relative">
          <select
            value={currentUser.id}
            onChange={(e) => {
              const user = users.find(u => u.id === e.target.value);
              if (user) onSetCurrentUser(user);
            }}
            className="appearance-none bg-background border border-input rounded-md pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
         
        {!isClientView && (
          <nav className="bg-muted rounded-md p-1 flex gap-1 border">
            {navItems.map(item => {
              if ((item.key === 'analytics' || item.key === 'integrations') && !canManageSettings) return null;
              return (
                <Button 
                  key={item.key}
                  variant={currentView === item.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onSetView(item.key)}
                >
                  {item.label}
                </Button>
              )
            })}
          </nav>
        )}

        {canManageSettings && (
          <>
            {/* Autonomous Mode Toggle */}
            <div className="flex items-center gap-3 bg-background border rounded-lg px-3 py-1.5 text-sm">
              <Label htmlFor="autonomous-mode" className="flex items-center gap-1.5 cursor-pointer">
                <Bot className={`w-5 h-5 transition-colors ${isGlobalAutonomous ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-semibold">Autonomous</span>
              </Label>
              <Switch
                id="autonomous-mode"
                checked={isGlobalAutonomous}
                onCheckedChange={onSetGlobalAutonomous}
              />
            </div>
            {/* Settings Button */}
            <Button variant="ghost" size="icon" onClick={onOpenSettings}>
              <Settings className="h-5 w-5" />
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};