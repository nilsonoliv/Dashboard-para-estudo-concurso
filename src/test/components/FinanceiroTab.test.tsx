import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FinanceiroTab } from '@/components/FinanceiroTab';

describe('FinanceiroTab Component', () => {
  it('exibe a matriz de prioridades da Quadrix com os níveis Alta, Média e Baixa', () => {
    render(<FinanceiroTab />);

    expect(screen.getByText('Matriz de Prioridades da Banca Quadrix')).toBeInTheDocument();
    expect(screen.getByText(/ALTA \(Dominar 100%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/MÉDIA \(Focar em Questões\)/i)).toBeInTheDocument();
    expect(screen.getByText(/BAIXA \(Estudo Marginal\)/i)).toBeInTheDocument();
  });

  it('exibe o planejamento financeiro das viagens e concursos', () => {
    render(<FinanceiroTab />);

    expect(screen.getByText('Viagem / Prova Bonito')).toBeInTheDocument();
    expect(screen.getByText('R$ 441')).toBeInTheDocument();
    expect(screen.getByText('IBGE 2')).toBeInTheDocument();
    expect(screen.getByText('R$ 50')).toBeInTheDocument();
    expect(screen.getByText('Formosa')).toBeInTheDocument();
    expect(screen.getByText('R$ 900')).toBeInTheDocument();
  });
});
