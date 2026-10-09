'use client';

import React from 'react';
import {
  CalendarDays,
  TrendingUp,
  CheckSquare,
  BookOpen,
  Cloud,
  FileQuestion,
} from 'lucide-react';

export type TabKey = 'fases' | 'financeiro' | 'checklist' | 'pedagogica' | 'backup' | 'simulado';

interface TabsNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function TabsNav({ activeTab, onTabChange }: TabsNavProps) {
  const tabs = [
    { key: 'fases' as TabKey, label: 'Fases', icon: CalendarDays },
    { key: 'financeiro' as TabKey, label: 'Prioridades Quadrix', icon: TrendingUp },
    { key: 'checklist' as TabKey, label: 'Checklist Base', icon: CheckSquare },
    { key: 'pedagogica' as TabKey, label: 'Lista Pedagógica', icon: BookOpen },
    { key: 'simulado' as TabKey, label: 'Simulador Inteligente', icon: FileQuestion, highlight: true },
    { key: 'backup' as TabKey, label: 'Nuvem & Backup', icon: Cloud },
  ];

  return (
    <nav className="flex space-x-1.5 overflow-x-auto pb-1 border-b border-slate-800">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              isActive
                ? tab.highlight
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-blue-400 border border-slate-700'
                : tab.highlight
                ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? (tab.highlight ? 'text-white' : 'text-blue-400') : 'text-slate-500'}`} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
