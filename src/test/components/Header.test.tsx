import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '@/components/Header';

describe('Header Component', () => {
  const defaultProps = {
    currentStreak: 5,
    bestStreak: 12,
    isStudiedToday: false,
    onStudyToday: vi.fn(),
    isSyncing: false,
    activeTab: 'fases',
    onTabChange: vi.fn(),
  };

  it('renderiza o cabeçalho com título, streak e botão mobile do menu', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('Operação SAÚDE BA')).toBeInTheDocument();
    expect(screen.getByText('5d')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /menu principal/i })).toBeInTheDocument();
  });

  it('abre o menu de navegação mobile (drawer) ao clicar no botão de menu', () => {
    const handleTabChange = vi.fn();
    render(<Header {...defaultProps} onTabChange={handleTabChange} />);

    // Clica no botão hamburger do menu mobile
    const menuBtn = screen.getByRole('button', { name: /menu principal/i });
    fireEvent.click(menuBtn);

    // Deve abrir o menu mobile off-canvas com opções
    expect(screen.getByText('PST • Menu Tático')).toBeInTheDocument();
    expect(screen.getByText('Módulos de Estudo')).toBeInTheDocument();
    expect(screen.getByText('Fases da Mentoria')).toBeInTheDocument();
    expect(screen.getByText('Simulador Tático')).toBeInTheDocument();

    // Clica em um item do menu mobile
    const simuladorBtn = screen.getByText('Simulador Tático');
    fireEvent.click(simuladorBtn);

    expect(handleTabChange).toHaveBeenCalledWith('simulado');
  });
});
