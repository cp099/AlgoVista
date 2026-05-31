import React from 'react';
import { cn } from '@utils/cn';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex space-x-1 bg-algo-surface p-1 rounded-lg border border-algo-border w-fit mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === tab
              ? "bg-algo-primary text-white shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};