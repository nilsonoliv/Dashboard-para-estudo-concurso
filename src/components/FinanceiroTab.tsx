'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpCircle,
  MinusCircle,
  ArrowDownCircle,
  Wallet,
  Calendar,
  PiggyBank,
  Coins,
  Edit3,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  X,
} from 'lucide-react';

export interface PriorityGroup {
  id: string;
  level: string;
  color: string;
  badgeColor: string;
  iconName: 'high' | 'medium' | 'low';
  items: string[];
}

export interface FinancialPlanItem {
  id: string;
  name: string;
  targetDateStr: string;
  ticket: number;
  desc: string;
}

export const DEFAULT_PRIORITIES: PriorityGroup[] = [
  {
    id: 'prio-alta',
    level: 'ALTA (Dominar 100%)',
    color: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    iconName: 'high',
    items: [
      'Legislação CRECI (Leis, Regimentos e Decretos)',
      'Português (Compreensão, Interpretação, Sintaxe e Crase)',
      'Atendimento ao Público e Postura Institucional',
      'Noções de Administração Geral e Pública',
    ],
  },
  {
    id: 'prio-media',
    level: 'MÉDIA (Focar em Questões)',
    color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    iconName: 'medium',
    items: [
      'Controle de Documentos e Arquivologia',
      'Informática e Ferramentas em Nuvem',
      'Raciocínio Lógico e Quantitativo',
      'Legislação Complementar (LGPD, Ética no Serviço Público)',
    ],
  },
  {
    id: 'prio-baixa',
    level: 'BAIXA (Estudo Marginal)',
    color: 'border-blue-500/30 bg-blue-950/20 text-blue-300',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    iconName: 'low',
    items: [
      'Matemática Financeira Avançada',
      'Improbidade Administrativa Aprofundada (teorias secundárias)',
    ],
  },
];

export const DEFAULT_FINANCES: FinancialPlanItem[] = [
  {
    id: 'fin-bonito',
    name: 'Viagem / Prova Bonito',
    targetDateStr: '2026-09-20T00:00:00',
    ticket: 441,
    desc: 'Passagem ida e volta calculada (R$ 450 - R$ 9)',
  },
  {
    id: 'fin-ibge',
    name: 'IBGE 2',
    targetDateStr: '2026-09-27T00:00:00',
    ticket: 50,
    desc: 'Custo de inscrição/transporte municipal',
  },
  {
    id: 'fin-formosa',
    name: 'Formosa',
    targetDateStr: '2026-10-11T00:00:00',
    ticket: 900,
    desc: 'Transporte intermunicipal e hospedagem',
  },
];

export function FinanceiroTab() {
  const [priorities, setPriorities] = useState<PriorityGroup[]>(DEFAULT_PRIORITIES);
  const [finances, setFinances] = useState<FinancialPlanItem[]>(DEFAULT_FINANCES);

  // Editing state for priority card
  const [editingPrioId, setEditingPrioId] = useState<string | null>(null);
  const [prioForm, setPrioForm] = useState<{ level: string; items: string[] }>({
    level: '',
    items: [],
  });

  // Editing / adding state for financial card
  const [editingFinId, setEditingFinId] = useState<string | null>(null);
  const [isAddingFin, setIsAddingFin] = useState<boolean>(false);
  const [finForm, setFinForm] = useState<{
    name: string;
    targetDateStr: string;
    ticket: number;
    desc: string;
  }>({
    name: '',
    targetDateStr: '',
    ticket: 0,
    desc: '',
  });

  // Load from local storage
  useEffect(() => {
    try {
      const storedPrio = localStorage.getItem('custom_financial_priorities');
      if (storedPrio) {
        const parsed = JSON.parse(storedPrio);
        if (Array.isArray(parsed) && parsed.length > 0) setPriorities(parsed);
      }
      const storedFin = localStorage.getItem('custom_financial_plans');
      if (storedFin) {
        const parsed = JSON.parse(storedFin);
        if (Array.isArray(parsed) && parsed.length > 0) setFinances(parsed);
      }
    } catch (e) {
      console.error('Error loading custom financial cards:', e);
    }
  }, []);

  const savePriorities = (updated: PriorityGroup[]) => {
    setPriorities(updated);
    try {
      localStorage.setItem('custom_financial_priorities', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving priorities', e);
    }
  };

  const saveFinances = (updated: FinancialPlanItem[]) => {
    setFinances(updated);
    try {
      localStorage.setItem('custom_financial_plans', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving financial plans', e);
    }
  };

  // Calculations for financial cards
  const calculatedFinances = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = finances.map((item) => {
      const target = new Date(item.targetDateStr);
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / 86400000);
      const perDay = diffDays > 0 ? item.ticket / diffDays : 0;
      return {
        ...item,
        diffDays,
        perDay,
      };
    });

    const totalPerDay = items.reduce((acc, curr) => acc + curr.perDay, 0);
    const totalCost = items.reduce((acc, curr) => acc + curr.ticket, 0);

    return { items, totalPerDay, totalCost };
  }, [finances]);

  // Priority handlers
  const handleStartEditPrio = (prio: PriorityGroup) => {
    setEditingPrioId(prio.id);
    setPrioForm({
      level: prio.level,
      items: [...prio.items],
    });
  };

  const handleSavePrio = (id: string) => {
    if (!prioForm.level.trim()) return;
    const updated = priorities.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          level: prioForm.level.trim(),
          items: prioForm.items.filter((i) => i.trim().length > 0),
        };
      }
      return p;
    });
    savePriorities(updated);
    setEditingPrioId(null);
  };

  const handleAddPrioItem = () => {
    setPrioForm((prev) => ({
      ...prev,
      items: [...prev.items, ''],
    }));
  };

  const handlePrioItemChange = (idx: number, val: string) => {
    setPrioForm((prev) => {
      const next = [...prev.items];
      next[idx] = val;
      return { ...prev, items: next };
    });
  };

  const handleRemovePrioItem = (idx: number) => {
    setPrioForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  // Financial plan item handlers
  const handleStartEditFin = (fin: FinancialPlanItem) => {
    setEditingFinId(fin.id);
    setIsAddingFin(false);
    // Extract YYYY-MM-DD for date input
    const d = new Date(fin.targetDateStr);
    const yyyyMmDd = !isNaN(d.getTime())
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : '';
    setFinForm({
      name: fin.name,
      targetDateStr: yyyyMmDd,
      ticket: fin.ticket,
      desc: fin.desc,
    });
  };

  const handleSaveFin = (id: string) => {
    if (!finForm.name.trim() || !finForm.targetDateStr) return;
    const updated = finances.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          name: finForm.name.trim(),
          targetDateStr: `${finForm.targetDateStr}T00:00:00`,
          ticket: Number(finForm.ticket) || 0,
          desc: finForm.desc.trim(),
        };
      }
      return f;
    });
    saveFinances(updated);
    setEditingFinId(null);
  };

  const handleAddNewFin = () => {
    if (!finForm.name.trim() || !finForm.targetDateStr) return;
    const newItem: FinancialPlanItem = {
      id: `fin-custom-${Date.now()}`,
      name: finForm.name.trim(),
      targetDateStr: `${finForm.targetDateStr}T00:00:00`,
      ticket: Number(finForm.ticket) || 0,
      desc: finForm.desc.trim() || 'Meta personalizada',
    };
    saveFinances([...finances, newItem]);
    setIsAddingFin(false);
    setFinForm({ name: '', targetDateStr: '', ticket: 0, desc: '' });
  };

  const handleDeleteFin = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta financeira?')) {
      const updated = finances.filter((f) => f.id !== id);
      saveFinances(updated);
      if (editingFinId === id) setEditingFinId(null);
    }
  };

  const handleResetAllFinance = () => {
    if (confirm('Deseja restaurar as prioridades e planejamentos financeiros padrões?')) {
      savePriorities(DEFAULT_PRIORITIES);
      saveFinances(DEFAULT_FINANCES);
      localStorage.removeItem('custom_financial_priorities');
      localStorage.removeItem('custom_financial_plans');
      setEditingPrioId(null);
      setEditingFinId(null);
      setIsAddingFin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Priority Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Matriz de Prioridades da Banca Quadrix</h2>
          </div>

          <button
            onClick={handleResetAllFinance}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition shrink-0 self-start sm:self-center"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Restaurar Valores Padrão</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorities.map((group) => {
            const isEditing = editingPrioId === group.id;
            const Icon =
              group.iconName === 'high'
                ? ArrowUpCircle
                : group.iconName === 'medium'
                ? MinusCircle
                : ArrowDownCircle;
            const iconColor =
              group.iconName === 'high'
                ? 'text-rose-400'
                : group.iconName === 'medium'
                ? 'text-amber-400'
                : 'text-blue-400';

            if (isEditing) {
              return (
                <div
                  key={group.id}
                  className="rounded-xl border border-blue-500/50 bg-slate-900/95 p-4 space-y-3 shadow-xl ring-1 ring-blue-500/30"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                      <Edit3 className="h-3.5 w-3.5" /> Editando Nível
                    </span>
                    <button
                      onClick={() => setEditingPrioId(null)}
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Nome da Prioridade
                    </label>
                    <input
                      type="text"
                      value={prioForm.level}
                      onChange={(e) => setPrioForm((prev) => ({ ...prev, level: e.target.value }))}
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-semibold text-slate-400">
                        Assuntos / Itens
                      </label>
                      <button
                        type="button"
                        onClick={handleAddPrioItem}
                        className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                      >
                        <Plus className="h-3 w-3" /> Item
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {prioForm.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handlePrioItemChange(i, e.target.value)}
                            className="flex-1 text-xs bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePrioItem(i)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingPrioId(null)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSavePrio(group.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      <Save className="h-3.5 w-3.5" /> Salvar
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={group.id}
                className={`rounded-xl border p-5 flex flex-col justify-between group ${group.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${group.badgeColor}`}>
                        {group.level}
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartEditPrio(group)}
                      title="Editar assuntos deste grupo"
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
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

                <div className="mt-4 pt-3 border-t border-slate-800/40 text-[11px] text-slate-400 flex justify-between">
                  <span>{group.items.length} matérias listadas</span>
                  <button
                    onClick={() => handleStartEditPrio(group)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Editar
                  </button>
                </div>
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs text-emerald-300">
              <Coins className="h-4 w-4 text-emerald-400" />
              <span>Total diário necessário: <strong>R$ {calculatedFinances.totalPerDay.toFixed(1)} / dia</strong></span>
            </div>

            <button
              onClick={() => {
                setIsAddingFin(true);
                setEditingFinId(null);
                setFinForm({
                  name: '',
                  targetDateStr: '',
                  ticket: 0,
                  desc: '',
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nova Meta</span>
            </button>
          </div>
        </div>

        {/* Add New Financial Item Modal/Box */}
        {isAddingFin && (
          <div className="rounded-xl border border-blue-500/40 bg-slate-900/90 p-4 space-y-3 ring-1 ring-blue-500/20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Adicionar Novo Custo / Viagem
              </span>
              <button
                onClick={() => setIsAddingFin(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Nome do Concurso/Viagem
                </label>
                <input
                  type="text"
                  value={finForm.name}
                  onChange={(e) => setFinForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Prova Salvador"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Data Limite da Prova
                </label>
                <input
                  type="date"
                  value={finForm.targetDateStr}
                  onChange={(e) =>
                    setFinForm((prev) => ({ ...prev, targetDateStr: e.target.value }))
                  }
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Custo Total (R$)
                </label>
                <input
                  type="number"
                  value={finForm.ticket || ''}
                  onChange={(e) =>
                    setFinForm((prev) => ({ ...prev, ticket: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="Ex: 500"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Descrição dos Custos
              </label>
              <input
                type="text"
                value={finForm.desc}
                onChange={(e) => setFinForm((prev) => ({ ...prev, desc: e.target.value }))}
                placeholder="Ex: Passagens, hospedagem e taxa de inscrição"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingFin(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddNewFin}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Criar Meta
              </button>
            </div>
          </div>
        )}

        {/* Financial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calculatedFinances.items.map((item) => {
            const isEditing = editingFinId === item.id;

            if (isEditing) {
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-blue-500/50 bg-slate-950 p-4 space-y-3 ring-1 ring-blue-500/30"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                      <Edit3 className="h-3.5 w-3.5" /> Editar Custo
                    </span>
                    <button
                      onClick={() => setEditingFinId(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={finForm.name}
                      onChange={(e) => setFinForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                        Valor (R$)
                      </label>
                      <input
                        type="number"
                        value={finForm.ticket || ''}
                        onChange={(e) =>
                          setFinForm((prev) => ({
                            ...prev,
                            ticket: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                        Data Alvo
                      </label>
                      <input
                        type="date"
                        value={finForm.targetDateStr}
                        onChange={(e) =>
                          setFinForm((prev) => ({ ...prev, targetDateStr: e.target.value }))
                        }
                        className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={finForm.desc}
                      onChange={(e) => setFinForm((prev) => ({ ...prev, desc: e.target.value }))}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleDeleteFin(item.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingFinId(null)}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveFin(item.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 flex flex-col justify-between group hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm text-slate-200">{item.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        R$ {item.ticket}
                      </span>
                      <button
                        onClick={() => handleStartEditFin(item)}
                        title="Editar card financeiro"
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
                    <span>{new Date(item.targetDateStr).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
