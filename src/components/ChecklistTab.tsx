'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BASE_CHECKLIST_ITEMS, ChecklistItem } from '@/data/checklistItems';
import {
  RotateCcw,
  CheckCircle2,
  Circle,
  ListFilter,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
} from 'lucide-react';

interface ChecklistTabProps {
  checklistState: Record<string, boolean>;
  onToggleItem: (id: string) => void;
  onReset: () => void;
}

export function ChecklistTab({
  checklistState,
  onToggleItem,
  onReset,
}: ChecklistTabProps) {
  const [itemsList, setItemsList] = useState<ChecklistItem[]>(BASE_CHECKLIST_ITEMS);

  // Editing category title modal / inline
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  // Adding item inline
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState<string>('');

  // Editing existing item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState<string>('');

  // Load custom checklist items from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('custom_checklist_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItemsList(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading custom checklist items:', e);
    }
  }, []);

  const saveItems = (updated: ChecklistItem[]) => {
    setItemsList(updated);
    try {
      localStorage.setItem('custom_checklist_items', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving checklist items:', e);
    }
  };

  // Group items by category
  const grouped = useMemo(() => {
    const map: Record<string, ChecklistItem[]> = {};
    for (const item of itemsList) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }

    // Sort items inside each category: uncompleted first, then completed
    for (const cat in map) {
      map[cat].sort((a, b) => {
        const aChecked = Boolean(checklistState[a.id]);
        const bChecked = Boolean(checklistState[b.id]);
        if (aChecked === bChecked) return 0;
        return aChecked ? 1 : -1;
      });
    }

    return map;
  }, [itemsList, checklistState]);

  const totalItems = itemsList.length;
  const completedCount = itemsList.filter((i) => checklistState[i.id]).length;
  const progressPercent = Math.round((completedCount / (totalItems || 1)) * 100);

  // Category rename
  const handleStartRenameCategory = (cat: string) => {
    setEditingCategory(cat);
    setNewCategoryName(cat);
  };

  const handleSaveRenameCategory = (oldCategory: string) => {
    if (!newCategoryName.trim() || newCategoryName.trim() === oldCategory) {
      setEditingCategory(null);
      return;
    }
    const updated = itemsList.map((item) => {
      if (item.category === oldCategory) {
        return { ...item, category: newCategoryName.trim() };
      }
      return item;
    });
    saveItems(updated);
    setEditingCategory(null);
  };

  // Item additions
  const handleAddItem = (category: string) => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category,
      text: newItemText.trim(),
    };
    saveItems([...itemsList, newItem]);
    setNewItemText('');
    setAddingToCategory(null);
  };

  // Item edits
  const handleStartEditItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleSaveEditItem = (id: string) => {
    if (!editingItemText.trim()) return;
    const updated = itemsList.map((i) => {
      if (i.id === id) {
        return { ...i, text: editingItemText.trim() };
      }
      return i;
    });
    saveItems(updated);
    setEditingItemId(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja excluir este item do checklist?')) {
      const updated = itemsList.filter((i) => i.id !== id);
      saveItems(updated);
    }
  };

  const handleResetToOriginal = () => {
    if (confirm('Deseja restaurar os itens e matérias originais do Checklist?')) {
      saveItems(BASE_CHECKLIST_ITEMS);
      localStorage.removeItem('custom_checklist_items');
      onReset();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Progress Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-blue-400" />
            Checklist Base de Estudos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Organização diária das disciplinas. Clique em "Adicionar Item" ou no ícone de lápis para personalizar cada card.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:w-48">
            <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
              <span>{completedCount} de {totalItems}</span>
              <span className="text-blue-400">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToOriginal}
              title="Restaurar itens originais"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              Restaurar
            </button>
            <button
              onClick={onReset}
              title="Limpar seleções"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-lg transition"
            >
              Limpar / Desmarcar
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(grouped).map(([category, items]) => {
          const catCompleted = items.filter((i) => checklistState[i.id]).length;
          const isRenaming = editingCategory === category;
          const isAddingHere = addingToCategory === category;

          return (
            <div
              key={category}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  {isRenaming ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="text-xs bg-slate-950 border border-blue-500 rounded-lg px-2.5 py-1 text-white flex-1 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRenameCategory(category)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg text-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <h3 className="font-bold text-sm text-slate-100">{category}</h3>
                      <button
                        onClick={() => handleStartRenameCategory(category)}
                        title="Renomear categoria do card"
                        className="p-1 text-slate-500 hover:text-slate-300 rounded"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {catCompleted}/{items.length}
                    </span>
                    <button
                      onClick={() => {
                        setAddingToCategory(category);
                        setNewItemText('');
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 py-0.5 px-2 rounded-lg bg-blue-950/40 border border-blue-800/30 transition"
                    >
                      <Plus className="h-3 w-3" /> Item
                    </button>
                  </div>
                </div>

                {/* Inline Add Item Form */}
                {isAddingHere && (
                  <div className="mb-3 p-2.5 rounded-xl border border-blue-500/40 bg-slate-950 flex items-center gap-2">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Novo tópico ou tarefa..."
                      className="text-xs bg-transparent border-none text-white flex-1 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddItem(category)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => setAddingToCategory(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const isChecked = Boolean(checklistState[item.id]);
                    const isEditingItem = editingItemId === item.id;

                    if (isEditingItem) {
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-xl border border-blue-500/50 bg-slate-950"
                        >
                          <input
                            type="text"
                            value={editingItemText}
                            onChange={(e) => setEditingItemText(e.target.value)}
                            className="text-xs bg-transparent border-none text-white flex-1 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveEditItem(item.id)}
                            className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 text-slate-400 hover:text-white rounded text-xs"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start justify-between gap-2 p-2.5 rounded-xl border text-xs transition-all group ${
                          isChecked
                            ? 'border-emerald-500/20 bg-emerald-950/20 text-slate-400'
                            : 'border-slate-800/80 bg-slate-950/40 text-slate-200 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <label
                          onClick={() => onToggleItem(item.id)}
                          className="flex items-start gap-3 cursor-pointer select-none flex-1"
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
                          <span
                            className={`leading-relaxed ${
                              isChecked ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {item.text}
                          </span>
                        </label>

                        {/* Edit & Delete Action icons */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition">
                          <button
                            onClick={() => handleStartEditItem(item)}
                            title="Editar texto do item"
                            className="p-1 text-slate-500 hover:text-blue-400 rounded transition"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            title="Excluir item"
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-slate-500">
                  {catCompleted} concluído{catCompleted === 1 ? '' : 's'} de {items.length}
                </span>
                <button
                  onClick={() => {
                    setAddingToCategory(category);
                    setNewItemText('');
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  + Adicionar ao card
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
