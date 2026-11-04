import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SimuladorView, QuestionData } from '@/components/SimuladorView';

describe('SimuladorView Component', () => {
  const mockQuestions: QuestionData[] = [
    {
      id: 1,
      subject: 'Língua Portuguesa',
      topic: 'Texto e Discurso',
      banca: 'Quadrix',
      statement: 'Assinale a alternativa que contém um texto injuntivo:',
      options: ['Manual de instruções.', 'Romance literário.', 'Poema clássico.'],
      correctOptionIndex: 0,
      explanation: 'Textos com comandos e instruções são injuntivos.',
    },
  ];

  it('renderiza o painel inicial de configuração de simulados', () => {
    render(<SimuladorView questions={mockQuestions} />);

    expect(screen.getByText('Simulador Tático de Questões')).toBeInTheDocument();
    expect(screen.getByText('Modo Livre / Treino')).toBeInTheDocument();
    expect(screen.getByText('Modo Cronometrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar simulado/i })).toBeInTheDocument();
  });

  it('inicia o simulado e permite responder a questão com gabarito imediato', () => {
    render(<SimuladorView questions={mockQuestions} />);

    // Inicia simulado
    const startBtn = screen.getByRole('button', { name: /iniciar simulado/i });
    fireEvent.click(startBtn);

    // Deve estar no modo executor de questões
    expect(screen.getByText(/Questão 1 de/i)).toBeInTheDocument();

    // Seleciona a alternativa correta (Opção A)
    const options = screen.getAllByRole('button');
    // Encontra a primeira alternativa
    const optionA = screen.getByText('Manual de instruções.');
    fireEvent.click(optionA);

    // Clica em Confirmar Resposta
    const confirmBtn = screen.getByRole('button', { name: /confirmar resposta/i });
    fireEvent.click(confirmBtn);

    // Deve exibir feedback de resposta correta e explicação
    expect(screen.getByText('Resposta Correta!')).toBeInTheDocument();
    expect(screen.getByText(/Textos com comandos e instruções são injuntivos/i)).toBeInTheDocument();
  });
});
