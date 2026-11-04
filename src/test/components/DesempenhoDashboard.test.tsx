import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DesempenhoDashboard } from '@/components/DesempenhoDashboard';

describe('DesempenhoDashboard Component', () => {
  it('renderiza o painel geral de desempenho com métricas e gráficos', () => {
    render(<DesempenhoDashboard />);

    expect(screen.getByText('Painel Tático de Desempenho & Evolução')).toBeInTheDocument();
    expect(screen.getByText('Visão Geral & Evolução')).toBeInTheDocument();
    expect(screen.getByText('Análise de Erros & Vulnerabilidades')).toBeInTheDocument();
    expect(screen.getByText('Taxa Média Geral')).toBeInTheDocument();
  });

  it('permite alternar para a aba de Análise de Erros & Vulnerabilidades', () => {
    const handleNavigate = vi.fn();
    render(<DesempenhoDashboard onNavigateToSimulado={handleNavigate} />);

    // Clica no botão de alternância para análise de erros
    const errorsTabBtn = screen.getByText('Análise de Erros & Vulnerabilidades');
    fireEvent.click(errorsTabBtn);

    // Deve exibir métricas e seções dedicadas de erros
    expect(screen.getByText('Total de Questões Erradas')).toBeInTheDocument();
    expect(screen.getByText('Disciplina Mais Vulnerável')).toBeInTheDocument();
    expect(screen.getByText('Top 5 Vulnerabilidades Táticas & Diagnóstico de Lacunas')).toBeInTheDocument();

    // Clica no botão de praticar caderno de erros
    const practiceErrorsBtn = screen.getByText(/Praticar Caderno de Erros/i);
    fireEvent.click(practiceErrorsBtn);

    expect(handleNavigate).toHaveBeenCalledWith('erradas');
  });
});
