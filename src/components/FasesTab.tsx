'use client';

import React, { useState, useEffect } from 'react';
import {
  Info,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  X,
} from 'lucide-react';

export interface PhaseItem {
  key: string;
  title: string;
  period: string;
  badgeColor?: string;
  tasks: string[];
}

interface FasesTabProps {
  phasesCompleted: Record<string, boolean>;
  onTogglePhase: (phaseKey: string) => void;
  onOpenSimulado: () => void;
}

export const DEFAULT_PHASES: PhaseItem[] = [
  {
    key: 'phase1',
    title: 'Fase 1: Base',
    period: 'Até 26 Agosto',
    badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    tasks: [
      'Dia 1: Em cada sessão de estudo 40 min',
      'Dia 2: 30 min teoria (Estudo Guiado)',
      'Dia 3: 10 min Notebook LM',
      'Dia 4: 0 min simulado',
      'Dia 5: 0 min akicards',
    ],
  },
  {
    key: 'phase2',
    title: 'Fase 2: Consolidação',
    period: '27 Agosto a 28 Setembro',
    badgeColor: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    tasks: [
      'Dia 1: Em cada sessão de estudo 50 min',
      'Dia 2: 21 min teoria (Estudo Guiado)',
      'Dia 3: 19 min Notebook LM',
      'Dia 4: 5 min simulado',
      'Dia 5: 5 min akicards',
    ],
  },
  {
    key: 'phase3',
    title: 'Fase 3: Revisões',
    period: '29 Setembro a 30 Outubro',
    badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    tasks: [
      'Dia 1-3: Em cada sessão de estudo 60 min',
      'Dia 2: 21 min teoria (Estudo Guiado)',
      'Dia 3: 22 min Notebook LM',
      'Dia 4: 11 min simulado',
      'Dia 5: 6 min akicards',
    ],
  },
  {
    key: 'phase4',
    title: 'Fase 4: Lapidação',
    period: '31 Novembro a 1 Janeiro',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    tasks: [
      'Dia 1, 3: Em cada sessão de estudo 60 min.',
      'Dia 2, 4: 12 min teoria (Estudo Guiado)',
      'Dia 5: 12 min Notebook LM',
      'Dia 5: 30 min simulado',
      'Dia 5: 6 min akicards',
    ],
  },
];

export function FasesTab({
  phasesCompleted,
  onTogglePhase,
  onOpenSimulado,
}: FasesTabProps) {
  const [phases, setPhases] = useState<PhaseItem[]>(DEFAULT_PHASES);
  const [editingPhaseKey, setEditingPhaseKey] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    period: string;
    tasks: string[];
  }>({ title: '', period: '', tasks: [] });

  // Load custom phases from localStorage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('custom_fases_cards');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPhases(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load custom phases', e);
    }
  }, []);

  const savePhases = (newPhases: PhaseItem[]) => {
    setPhases(newPhases);
    try {
      localStorage.setItem('custom_fases_cards', JSON.stringify(newPhases));
    } catch (e) {
      console.error('Failed to save custom phases', e);
    }
  };

  const handleStartEdit = (phase: PhaseItem) => {
    setEditingPhaseKey(phase.key);
    setEditFormData({
      title: phase.title,
      period: phase.period,
      tasks: [...phase.tasks],
    });
  };

  const handleCancelEdit = () => {
    setEditingPhaseKey(null);
  };

  const handleSaveEdit = (key: string) => {
    if (!editFormData.title.trim()) return;
    const updated = phases.map((p) => {
      if (p.key === key) {
        return {
          ...p,
          title: editFormData.title.trim(),
          period: editFormData.period.trim(),
          tasks: editFormData.tasks.filter((t) => t.trim().length > 0),
        };
      }
      return p;
    });
    savePhases(updated);
    setEditingPhaseKey(null);
  };

  const handleTaskChange = (index: number, value: string) => {
    setEditFormData((prev) => {
      const nextTasks = [...prev.tasks];
      nextTasks[index] = value;
      return { ...prev, tasks: nextTasks };
    });
  };

  const handleAddTask = () => {
    setEditFormData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ''],
    }));
  };

  const handleRemoveTask = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const handleResetToDefault = () => {
    if (confirm('Deseja restaurar as fases e metas originais de estudo?')) {
      savePhases(DEFAULT_PHASES);
      localStorage.removeItem('custom_fases_cards');
      setEditingPhaseKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mentoring Banner with Edit Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-950/30 p-4 text-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-300">Diretriz da Mentoria & Cronograma de Fases:</p>
            <p className="text-blue-200/90 mt-0.5 text-xs">
              Personalize os títulos, prazos e rotinas diárias clicando no botão "Editar Card" de cada fase.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetToDefault}
          title="Restaurar padrão da mentoria"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition shrink-0 self-start sm:self-center"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span>Restaurar Fases</span>
        </button>
      </div>

      {/* Phases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phases.map((phase) => {
          const isDone = Boolean(phasesCompleted[phase.key]);
          const isEditing = editingPhaseKey === phase.key;

          if (isEditing) {
            return (
              <div
                key={phase.key}
                className="rounded-2xl border border-blue-500/50 bg-slate-900/90 p-5 shadow-xl space-y-4 ring-1 ring-blue-500/30"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Edit3 className="h-4 w-4" /> Editando {phase.title}
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded"
                    title="Cancelar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Título da Fase
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Ex: Fase 1: Base"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Período / Prazos
                    </label>
                    <input
                      type="text"
                      value={editFormData.period}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, period: e.target.value }))
                      }
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Ex: Até 26 Agosto"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-slate-400">
                        Tarefas / Sessões Diárias
                      </label>
                      <button
                        type="button"
                        onClick={handleAddTask}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                      >
                        <Plus className="h-3 w-3" /> Adicionar Linha
                      </button>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {editFormData.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={task}
                            onChange={(e) => handleTaskChange(idx, e.target.value)}
                            className="flex-1 text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                            placeholder="Descreva a atividade..."
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded"
                            title="Remover linha"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(phase.key)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Salvar Alterações
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={phase.key}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between group ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-900/10'
                  : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-bold ${isDone ? 'text-emerald-300' : 'text-slate-100'}`}>
                      {phase.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${phase.badgeColor || 'border-blue-500/30 bg-blue-500/10 text-blue-400'}`}>
                      {phase.period}
                    </span>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => onTogglePhase(phase.key)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                      />
                      <span>{isDone ? 'Concluído' : 'Pendente'}</span>
                    </label>
                  </div>
                </div>

                {/* Task list */}
                <ul className="mt-4 space-y-2.5">
                  {phase.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          isDone ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer with Edit Button */}
              <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-slate-500">
                  {phase.tasks.length} {phase.tasks.length === 1 ? 'meta diária' : 'metas diárias'}
                </span>
                <button
                  onClick={() => handleStartEdit(phase)}
                  className="flex items-center gap-1 text-slate-400 hover:text-blue-400 text-xs font-semibold transition py-1 px-2 rounded-lg hover:bg-slate-800"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Editar Card</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA to Questions Platform */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Plataforma de Questões & Simulados
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Pratique com os pacotes de questões oficiais, filtre por matéria, controle o tempo cronometrado e acompanhe seu histórico no banco relacional.
          </p>
        </div>

        <button
          onClick={onOpenSimulado}
          className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <span>Abrir Simulador</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
