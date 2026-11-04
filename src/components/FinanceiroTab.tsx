'use client';

import React, { useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpCircle,
  MinusCircle,
  ArrowDownCircle,
  Wallet,
  Calendar,
  PiggyBank,
  Coins,
} from 'lucide-react';

export function FinanceiroTab() {
  const priorities = [
    {
      level: 'ALTA (Dominar 100%)',
      color: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: ArrowUpCircle,
      iconColor: 'text-rose-400',
      items: [
        'Legislação CRECI (Leis, Regimentos e Decretos)',
        'Português (Compreensão, Interpretação, Sintaxe e Crase)',
        'Atendimento ao Público e Postura Institucional',
        'Noções de Administração Geral e Pública',
      ],
    },
    {
      level: 'MÉDIA (Focar em Questões)',
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: MinusCircle,
      iconColor: 'text-amber-400',
      items: [
        'Controle de Documentos e Arquivologia',
        'Informática e Ferramentas em Nuvem',
        'Raciocínio Lógico e Quantitativo',
        'Legislação Complementar (LGPD, Ética no Serviço Público)',
      ],
    },
    {
      level: 'BAIXA (Estudo Marginal)',
      color: 'border-blue-500/30 bg-blue-950/20 text-blue-300',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: ArrowDownCircle,
      iconColor: 'text-blue-400',
      items: [
        'Matemática Financeira Avançada',
        'Improbidade Administrativa Aprofundada (teorias secundárias)',
      ],
    },
  ];

  const calculatedFinances = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calc = (name: string, targetDateStr: string, ticket: number, desc: string) => {
      const target = new Date(targetDateStr);
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / 86400000);
      const perDay = diffDays > 0 ? ticket / diffDays : 0;
      return { name, target: targetDateStr, ticket, desc, diffDays, perDay };
    };

    const items = [
      calc('Viagem / Prova Bonito', '2026-09-20T00:00:00', 441, 'Passagem ida e volta calculada (R$ 450 - R$ 9)'),
      calc('IBGE 2', '2026-09-27T00:00:00', 50, 'Custo de inscrição/transporte municipal'),
      calc('Formosa', '2026-10-11T00:00:00', 900, 'Transporte intermunicipal e hospedagem'),
    ];

    const totalPerDay = items.reduce((acc, curr) => acc + curr.perDay, 0);
    const totalCost = items.reduce((acc, curr) => acc + curr.ticket, 0);

    return { items, totalPerDay, totalCost };
  }, []);

  return (
    <div className="space-y-6">
      {/* Priority Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Matriz de Prioridades da Banca Quadrix</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorities.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div key={idx} className={`rounded-xl border p-5 ${group.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-5 w-5 ${group.iconColor}`} />
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${group.badgeColor}`}>
                    {group.level}
                  </span>
                </div>

                <ul className="space-y-2 mt-4 text-xs text-slate-200">
                  {group.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2">
                      <span className="text-slate-400 select-none">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial planning card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Planejamento de Custos e Viagens</h2>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs text-emerald-300">
            <Coins className="h-4 w-4 text-emerald-400" />
            <span>Total diário necessário: <strong>R$ {calculatedFinances.totalPerDay.toFixed(1)} / dia</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calculatedFinances.items.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm text-slate-200">{item.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    R$ {item.ticket}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Dias restantes:</span>
                  <span className="font-semibold text-amber-400">
                    {item.diffDays > 0 ? `${item.diffDays} dias` : 'Chegou o dia!'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Juntar por dia:</span>
                  <span className="font-semibold text-emerald-400">
                    {item.diffDays > 0 ? `R$ ${item.perDay.toFixed(1)} /dia` : 'R$ 0,00'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Data
                  </span>
                  <span>{new Date(item.target).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
