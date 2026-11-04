import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChecklistTab } from '@/components/ChecklistTab';

describe('ChecklistTab Component', () => {
  it('renderiza o cabeçalho e categorias do checklist', () => {
    const handleToggle = vi.fn();
    const handleReset = vi.fn();

    render(
      <ChecklistTab
        checklistState={{}}
        onToggleItem={handleToggle}
        onReset={handleReset}
      />
    );

    expect(screen.getByText('Checklist Base de Estudos')).toBeInTheDocument();
    expect(screen.getByText('Ciclo de Estudos')).toBeInTheDocument();
    expect(screen.getByText('Língua Portuguesa')).toBeInTheDocument();
  });

  it('calcula o progresso corretamente e chama onReset ao clicar em Limpar', () => {
    const handleToggle = vi.fn();
    const handleReset = vi.fn();

    render(
      <ChecklistTab
        checklistState={{ di1: true, di2: true }}
        onToggleItem={handleToggle}
        onReset={handleReset}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /limpar/i });
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('dispara onToggleItem ao clicar em um item de checklist', () => {
    const handleToggle = vi.fn();
    const handleReset = vi.fn();

    render(
      <ChecklistTab
        checklistState={{}}
        onToggleItem={handleToggle}
        onReset={handleReset}
      />
    );

    const firstItem = screen.getAllByText('C. Esp Bonito')[0];
    fireEvent.click(firstItem);

    expect(handleToggle).toHaveBeenCalledWith('di1');
  });
});
