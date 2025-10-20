import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, tooltip }) => {
  return (
    <div className="bg-card rounded-lg shadow-lg p-4 flex items-center space-x-4 border relative group">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-popover text-popover-foreground text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border shadow-lg">
          {tooltip}
        </div>
      )}
    </div>
  );
};