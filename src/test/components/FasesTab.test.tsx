import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FasesTab } from '@/components/FasesTab';

describe('FasesTab Component', () => {
  const mockPhases = {
    phase1: false,
    phase2: true,
    phase3: false,
    phase4: false,
  };

  it('renderiza os 4 cartões de fases com seus títulos e períodos', () => {
    const handleToggle = vi.fn();
    const handleOpen = vi.fn();

    render(
      <FasesTab
        phasesCompleted={mockPhases}
        onTogglePhase={handleToggle}
        onOpenSimulado={handleOpen}
      />
    );

    expect(screen.getByText('Fase 1: Base')).toBeInTheDocument();
    expect(screen.getByText('Fase 2: Consolidação')).toBeInTheDocument();
    expect(screen.getByText('Fase 3: Revisões')).toBeInTheDocument();
    expect(screen.getByText('Fase 4: Lapidação')).toBeInTheDocument();
    expect(screen.getByText('Até 26 Agosto')).toBeInTheDocument();
  });

  it('dispara onTogglePhase ao clicar no checkbox de conclusão de uma fase', () => {
    const handleToggle = vi.fn();
    const handleOpen = vi.fn();

    render(
      <FasesTab
        phasesCompleted={mockPhases}
        onTogglePhase={handleToggle}
        onOpenSimulado={handleOpen}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(handleToggle).toHaveBeenCalledWith('phase1');
  });

  it('chama onOpenSimulado ao clicar no botão de CTA para abrir o simulador', () => {
    const handleToggle = vi.fn();
    const handleOpen = vi.fn();

    render(
      <FasesTab
        phasesCompleted={mockPhases}
        onTogglePhase={handleToggle}
        onOpenSimulado={handleOpen}
      />
    );

    const ctaButton = screen.getByRole('button', { name: /abrir simulador/i });
    fireEvent.click(ctaButton);

    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});
