'use client';

import React from 'react';
import {
  Info,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface FasesTabProps {
  phasesCompleted: Record<string, boolean>;
  onTogglePhase: (phaseKey: string) => void;
  onOpenSimulado: () => void;
}

export function FasesTab({
  phasesCompleted,
  onTogglePhase,
  onOpenSimulado,
}: FasesTabProps) {
  const phases = [
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

  return (
    <div className="space-y-6">
      {/* Mentoring Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-950/30 p-4 text-blue-200">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-300">Diretriz da Mentoria:</p>
          <p className="text-blue-200/90 mt-0.5">
            Estude 2 horas/dia divididas em blocos de 50 minutos. O Dia 5 é reservado exclusivamente para resolução de questões no Simulador.
          </p>
        </div>
      </div>

      {/* Phases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phases.map((phase) => {
          const isDone = Boolean(phasesCompleted[phase.key]);
          return (
            <div
              key={phase.key}
              className={`rounded-2xl border transition-all p-5 ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-900/10'
                  : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-bold ${isDone ? 'text-emerald-300' : 'text-slate-100'}`}>
                    {phase.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${phase.badgeColor}`}>
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
            Pratique com os mais de 10 pacotes de questões oficiais, filtre por matéria, controle o tempo cronometrado e acompanhe seu histórico no banco relacional.
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
