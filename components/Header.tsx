import React from 'react';
import { useTheme } from './ThemeProvider.tsx';
import type { User, View } from '../types.ts';
import { SettingsIcon } from './icons/SettingsIcon.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { SunIcon } from './icons/SunIcon.tsx';
import { MoonIcon } from './icons/MoonIcon.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu.tsx';
import { Switch } from './ui/Switch.tsx';
import { Label } from './ui/Label.tsx';
import { Button } from './ui/Button.tsx';

interface HeaderProps {
  onOpenSettings: () => void;
  currentView: View;
  onSetView: (view: View) => void;
  users: User[];
  currentUser: User;
  onSetCurrentUser: (user: User) => void;
  isGlobalAutonomous: boolean;
  onSetGlobalAutonomous: (value: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  currentView,
  onSetView,
  users,
  currentUser,
  onSetCurrentUser,
  isGlobalAutonomous,
  onSetGlobalAutonomous,
}) => {
  const { theme, setTheme } = useTheme();

  const navItems: { id: 'dashboard' | 'analytics' | 'disputes' | 'integrations' | 'knowledge'; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'disputes', label: 'Disputes Hub' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'knowledge', label: 'Knowledge Base' },
  ];

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
            <BotIcon isAutonomous className="w-8 h-8 text-primary"/>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">FazeAR</h1>
        </div>
        {currentUser.role !== 'Client' && (
            <nav className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg">
            {navItems.map((item) => (
                <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onSetView(item.id)}
                className="text-xs h-8"
                >
                {item.label}
                </Button>
            ))}
            </nav>
        )}
      </div>
      <div className="flex items-center gap-3">
        {currentUser.role !== 'Client' && (
             <div className="flex items-center space-x-2">
                <Switch 
                    id="global-autonomous" 
                    checked={isGlobalAutonomous}
                    onCheckedChange={onSetGlobalAutonomous}
                />
                <Label htmlFor="global-autonomous" className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                    <BotIcon className={`w-4 h-4 transition-colors ${isGlobalAutonomous ? 'text-primary' : 'text-muted-foreground'}`}/>
                    Global Agent
                </Label>
            </div>
        )}
       
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <span>{currentUser.name}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {users.map((user) => (
              <DropdownMenuItem key={user.id} onSelect={() => onSetCurrentUser(user)}>
                {user.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {currentUser.role !== 'Client' && (
             <Button onClick={onOpenSettings} variant="ghost" size="icon">
              <SettingsIcon className="w-5 h-5" />
            </Button>
        )}
      </div>
    </header>
  );
};