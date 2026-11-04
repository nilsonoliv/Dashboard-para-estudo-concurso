import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '@/app/page';
import { AuthProvider } from '@/context/AuthContext';

// Mock fetch for questions API
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('/api/questions')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          questions: [
            {
              id: 1,
              subject: 'Língua Portuguesa',
              topic: 'Texto e Discurso',
              statement: 'Questão teste',
              options: ['A', 'B'],
              correctOptionIndex: 0,
            },
          ],
        }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as any;

describe('HomePage Tab Navigation Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  const renderHome = () =>
    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    );

  it('inicia na aba Fases por padrão e exibe a seção #content-fases', async () => {
    renderHome();
    expect(screen.getByText('Fase 1: Base')).toBeInTheDocument();
    const section = document.getElementById('content-fases');
    expect(section).toBeInTheDocument();
  });

  it('alterna para Financeiro ao clicar na aba e exibe a seção #content-escada', async () => {
    renderHome();
    const tabBtn = screen.getByRole('tab', { name: /financeiro/i });
    fireEvent.click(tabBtn);

    await waitFor(() => {
      expect(screen.getByText('Matriz de Prioridades da Banca Quadrix')).toBeInTheDocument();
      expect(screen.getByText('Planejamento de Custos e Viagens')).toBeInTheDocument();
      expect(document.getElementById('content-escada')).toBeInTheDocument();
    });
  });

  it('alterna para Checklist ao clicar na aba e exibe a seção #content-check', async () => {
    renderHome();
    const tabBtn = screen.getByRole('tab', { name: /^checklist$/i });
    fireEvent.click(tabBtn);

    await waitFor(() => {
      expect(screen.getByText('Checklist Base de Estudos')).toBeInTheDocument();
      expect(document.getElementById('content-check')).toBeInTheDocument();
    });
  });

  it('alterna para Lista Pedagógica ao clicar na aba e exibe #content-checklist2', async () => {
    renderHome();
    const tabBtn = screen.getByRole('tab', { name: /lista pedagógica/i });
    fireEvent.click(tabBtn);

    await waitFor(() => {
      expect(screen.getByText('Lista Pedagógica e Conhecimentos Específicos')).toBeInTheDocument();
      expect(document.getElementById('content-checklist2')).toBeInTheDocument();
    });
  });

  it('alterna para Simulador ao clicar na aba e exibe #content-simulado', async () => {
    renderHome();
    const tabBtn = screen.getByRole('tab', { name: /^simulador$/i });
    fireEvent.click(tabBtn);

    await waitFor(() => {
      expect(screen.getByText('Simulador Tático de Questões')).toBeInTheDocument();
      expect(document.getElementById('content-simulado')).toBeInTheDocument();
    });
  });

  it('alterna para Backup ao clicar na aba e exibe #content-backup', async () => {
    renderHome();
    const tabBtn = screen.getByRole('tab', { name: /^backup$/i });
    fireEvent.click(tabBtn);

    await waitFor(() => {
      expect(screen.getByText('Arquivo de Backup Local (JSON)')).toBeInTheDocument();
      expect(document.getElementById('content-backup')).toBeInTheDocument();
    });
  });

  it('navega para o Simulador ao clicar no botão "Abrir Simulador" da aba Fases', async () => {
    renderHome();
    const ctaBtn = screen.getByRole('button', { name: /abrir simulador/i });
    fireEvent.click(ctaBtn);

    await waitFor(() => {
      expect(screen.getByText('Simulador Tático de Questões')).toBeInTheDocument();
    });
  });

  it('abre a aba Financeiro automaticamente se o hash inicial for #escada', async () => {
    window.location.hash = '#escada';
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Matriz de Prioridades da Banca Quadrix')).toBeInTheDocument();
      expect(document.getElementById('content-escada')).toBeInTheDocument();
    });
  });

  it('abre a aba Checklist automaticamente se o hash inicial for #check', async () => {
    window.location.hash = '#check';
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Checklist Base de Estudos')).toBeInTheDocument();
    });
  });

  it('abre a aba Lista Pedagógica automaticamente se o hash inicial for #checklist2', async () => {
    window.location.hash = '#checklist2';
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Lista Pedagógica e Conhecimentos Específicos')).toBeInTheDocument();
    });
  });

  it('mantém todas as seções no DOM e alterna as classes active/hidden', async () => {
    renderHome();

    // All sections are present in DOM
    const fases = document.getElementById('content-fases');
    const escada = document.getElementById('content-escada');
    const check = document.getElementById('content-check');
    const check2 = document.getElementById('content-checklist2');
    const simulado = document.getElementById('content-simulado');
    const backup = document.getElementById('content-backup');

    expect(fases).toBeInTheDocument();
    expect(escada).toBeInTheDocument();
    expect(check).toBeInTheDocument();
    expect(check2).toBeInTheDocument();
    expect(simulado).toBeInTheDocument();
    expect(backup).toBeInTheDocument();

    // Initially Fases is active
    expect(fases?.className).toContain('active');
    expect(fases?.className).toContain('block');
    expect(escada?.className).toContain('hidden');

    // Click on Financeiro
    const tabBtn = screen.getByRole('tab', { name: /financeiro/i });
    fireEvent.click(tabBtn);

    await waitFor(() => {
      expect(escada?.className).toContain('active');
      expect(escada?.className).toContain('block');
      expect(fases?.className).toContain('hidden');
    });

    // Test global window.switchTab helper
    (window as any).switchTab('check');
    await waitFor(() => {
      expect(check?.className).toContain('active');
      expect(check?.className).toContain('block');
      expect(escada?.className).toContain('hidden');
    });
  });

  it('restaura a aba correta a partir do localStorage', async () => {
    localStorage.setItem('activeTab', 'backup');
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Arquivo de Backup Local (JSON)')).toBeInTheDocument();
    });
  });
});
