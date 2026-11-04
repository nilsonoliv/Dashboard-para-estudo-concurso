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
    { key: 'fases' as TabKey, target: 'fases', label: 'Fases', icon: CalendarDays },
    { key: 'financeiro' as TabKey, target: 'escada', label: 'Financeiro', icon: TrendingUp },
    { key: 'checklist' as TabKey, target: 'check', label: 'Checklist', icon: CheckSquare },
    { key: 'pedagogica' as TabKey, target: 'checklist2', label: 'Lista Pedagógica', icon: BookOpen },
    { key: 'simulado' as TabKey, target: 'simulado', label: 'Simulador', icon: FileQuestion, highlight: true },
    { key: 'backup' as TabKey, target: 'backup', label: 'Backup', icon: Cloud },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLElement>) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('button[data-tab], [data-target]');
    if (btn) {
      const tabKey = (btn.dataset.tab || btn.dataset.target) as TabKey;
      if (tabKey) {
        onTabChange(tabKey);
      }
    }
  };

  return (
    <nav
      className="flex space-x-2 overflow-x-auto pb-1 border-b border-slate-800 tabs-nav scrollbar-none sm:scrollbar-auto relative z-20 pointer-events-auto"
      id="tab-navigation"
      role="tablist"
      aria-label="Abas de navegação da aplicação"
      onClick={handleNavClick}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`content-${tab.target}`}
            data-tab={tab.key}
            data-target={tab.target}
            id={`tab-btn-${tab.target}`}
            onClick={(e) => {
              e.preventDefault();
              onTabChange(tab.key);
            }}
            onPointerUp={() => {
              onTabChange(tab.key);
            }}
            className={`tab-btn shrink-0 flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-semibold rounded-xl cursor-pointer pointer-events-auto select-none touch-manipulation transition-all duration-200 relative z-10 ${
              isActive
                ? tab.highlight
                  ? 'active bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50'
                  : 'active bg-slate-800 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                : tab.highlight
                ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 border border-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition-transform ${
                isActive ? (tab.highlight ? 'text-white scale-110' : 'text-blue-400 scale-110') : 'text-slate-500'
              }`}
            />
            <span>{tab.label}</span>
            {isActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse hidden sm:inline-block" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
