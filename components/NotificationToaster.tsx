
import React, { useEffect, useState } from 'react';
// Fix: Corrected import path for types.ts to be explicit.
import type { Notification as NotificationType } from '../types.ts';
import { BotIcon } from './icons/BotIcon.tsx';
import { CheckCircleIcon } from './icons/CheckCircleIcon.tsx';
import { XIcon } from './icons/XIcon.tsx';

interface NotificationProps {
    notification: NotificationType;
    onDismiss: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(notification.id), 300); // Wait for animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);
    
    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(notification.id), 300);
    };

    const typeClasses = {
        agent: 'border-purple-500/50',
        success: 'border-green-500/50',
        error: 'border-red-500/50',
        info: 'border-blue-500/50',
    };
    
    const getIcon = () => {
        switch (notification.type) {
            case 'agent':
                return <BotIcon className="w-6 h-6 text-purple-400" />;
            case 'success':
                 return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
            default:
                return <BotIcon className="w-6 h-6 text-purple-400" />;
        }
    }

    return (
        <div 
             className={`w-full max-w-sm bg-slate-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border ${typeClasses[notification.type]} transition-all duration-300 ease-in-out transform ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-slate-200">
                           {notification.type === 'agent' ? 'Autonomous Agent' : 'Notification'}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                           {notification.message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={handleDismiss}
                            className="inline-flex text-slate-400 rounded-md hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <span className="sr-only">Close</span>
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface NotificationToasterProps {
  notifications: NotificationType[];
  onDismiss: (id: string) => void;
}

export const NotificationToaster: React.FC<NotificationToasterProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6 z-50">
        <div className="w-full max-w-sm space-y-4">
            {notifications.map((notification) => (
                <Notification 
                    key={notification.id} 
                    notification={notification} 
                    onDismiss={onDismiss} 
                />
            ))}
        </div>
    </div>
  );
};
