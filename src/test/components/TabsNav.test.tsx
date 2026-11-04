import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TabsNav, TabKey } from '@/components/TabsNav';

describe('TabsNav Component', () => {
  it('renderiza todas as abas principais da aplicação', () => {
    const handleTabChange = vi.fn();
    render(<TabsNav activeTab="fases" onTabChange={handleTabChange} />);

    expect(screen.getByText('Fases')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
    expect(screen.getByText('Desempenho')).toBeInTheDocument();
    expect(screen.getByText('Checklist')).toBeInTheDocument();
    expect(screen.getByText('Lista Pedagógica')).toBeInTheDocument();
    expect(screen.getByText('Simulador')).toBeInTheDocument();
    expect(screen.getByText('Backup')).toBeInTheDocument();
  });

  it('chama onTabChange para cada uma das abas ao serem clicadas', () => {
    const handleTabChange = vi.fn();
    render(<TabsNav activeTab="fases" onTabChange={handleTabChange} />);

    const testCases: Array<{ label: string; key: TabKey; target: string }> = [
      { label: 'Financeiro', key: 'financeiro', target: 'escada' },
      { label: 'Desempenho', key: 'desempenho', target: 'desempenho' },
      { label: 'Checklist', key: 'checklist', target: 'check' },
      { label: 'Lista Pedagógica', key: 'pedagogica', target: 'checklist2' },
      { label: 'Simulador', key: 'simulado', target: 'simulado' },
      { label: 'Backup', key: 'backup', target: 'backup' },
      { label: 'Fases', key: 'fases', target: 'fases' },
    ];

    testCases.forEach(({ label, key, target }) => {
      const btn = screen.getByText(label).closest('button');
      expect(btn).not.toBeNull();
      expect(btn).toHaveAttribute('data-target', target);
      expect(btn).toHaveAttribute('data-tab', key);
      fireEvent.click(btn!);
      expect(handleTabChange).toHaveBeenCalledWith(key);
    });
  });
});

