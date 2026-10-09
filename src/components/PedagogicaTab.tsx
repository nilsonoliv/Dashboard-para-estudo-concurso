'use client';

import React, { useMemo } from 'react';
import { PEDAGOGICAL_CHECKLIST_ITEMS, ChecklistItem } from '@/data/checklistItems';
import { RotateCcw, CheckCircle2, Circle, BookOpen } from 'lucide-react';

interface PedagogicaTabProps {
  pedagogicalState: Record<string, boolean>;
  onToggleItem: (id: string) => void;
  onReset: () => void;
}

export function PedagogicaTab({
  pedagogicalState,
  onToggleItem,
  onReset,
}: PedagogicaTabProps) {
  const grouped = useMemo(() => {
    const map: Record<string, ChecklistItem[]> = {};
    for (const item of PEDAGOGICAL_CHECKLIST_ITEMS) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }

    for (const cat in map) {
      map[cat].sort((a, b) => {
        const aChecked = Boolean(pedagogicalState[a.id]);
        const bChecked = Boolean(pedagogicalState[b.id]);
        if (aChecked === bChecked) return 0;
        return aChecked ? 1 : -1;
      });
    }

    return map;
  }, [pedagogicalState]);

  const totalItems = PEDAGOGICAL_CHECKLIST_ITEMS.length;
  const completedCount = PEDAGOGICAL_CHECKLIST_ITEMS.filter((i) => pedagogicalState[i.id]).length;
  const progressPercent = Math.round((completedCount / (totalItems || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header and Progress Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            Lista Pedagógica e Conhecimentos Específicos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Conteúdos programáticos locais e especialidades dos cargos.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:w-48">
            <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
              <span>{completedCount} de {totalItems}</span>
              <span className="text-indigo-400">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            Limpar
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(grouped).map(([category, items]) => {
          const catCompleted = items.filter((i) => pedagogicalState[i.id]).length;
          return (
            <div
              key={category}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  {category}
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {catCompleted}/{items.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const isChecked = Boolean(pedagogicalState[item.id]);
                  return (
                    <label
                      key={item.id}
                      onClick={() => onToggleItem(item.id)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'border-emerald-500/20 bg-emerald-950/20 text-slate-400 line-through'
                          : 'border-slate-800/80 bg-slate-950/40 text-slate-200 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-500 hover:text-slate-400" />
                        )}
                      </div>
                      <span className="leading-relaxed flex-1">{item.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
