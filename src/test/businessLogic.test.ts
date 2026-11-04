import { describe, it, expect } from 'vitest';

describe('Business Rules & Calculations (Regras de Negócio)', () => {
  describe('Contagens Regressivas e Planejamento Financeiro', () => {
    it('calcula corretamente a diferença de dias até a data alvo', () => {
      const today = new Date('2026-09-01T00:00:00');
      const target = new Date('2026-09-20T00:00:00');
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(19);
    });

    it('calcula o valor diário necessário para a passagem de Bonito (R$ 441)', () => {
      const diffDays = 21;
      const ticketPrice = 441;
      const perDay = diffDays > 0 ? ticketPrice / diffDays : 0;
      expect(perDay).toBe(21);
    });

    it('retorna 0 para o custo diário se a data já tiver passado', () => {
      const diffDays = 0;
      const ticketPrice = 441;
      const perDay = diffDays > 0 ? ticketPrice / diffDays : 0;
      expect(perDay).toBe(0);
    });

    it('soma corretamente a meta diária total de todas as provas', () => {
      const bonitoPerDay = 21.0;
      const ibge2PerDay = 2.5;
      const formosaPerDay = 30.0;
      const total = bonitoPerDay + ibge2PerDay + formosaPerDay;
      expect(total).toBeCloseTo(53.5, 1);
    });
  });

  describe('Regras da Ofensiva de Estudos (Streak Tracker)', () => {
    const getDaysDiff = (dateStr1: string, dateStr2: string) => {
      const d1 = new Date(dateStr1 + 'T00:00:00');
      const d2 = new Date(dateStr2 + 'T00:00:00');
      return Math.floor((d2.getTime() - d1.getTime()) / 86400000);
    };

    it('inicia o streak em 1 no primeiro dia de estudo', () => {
      let currentStreak = 0;
      let lastStudyDate = '';
      const today = '2026-09-01';

      if (!lastStudyDate) {
        currentStreak = 1;
      }
      expect(currentStreak).toBe(1);
    });

    it('incrementa a sequência se o aluno estudou no dia anterior consecutivo', () => {
      let currentStreak = 5;
      const lastStudyDate = '2026-09-01';
      const today = '2026-09-02';

      const diff = getDaysDiff(lastStudyDate, today);
      if (diff === 1) {
        currentStreak += 1;
      }
      expect(currentStreak).toBe(6);
    });

    it('reinicia a sequência para 1 se houver um hiato de mais de 1 dia', () => {
      let currentStreak = 10;
      const lastStudyDate = '2026-09-01';
      const today = '2026-09-04';

      const diff = getDaysDiff(lastStudyDate, today);
      if (diff > 1) {
        currentStreak = 1;
      }
      expect(currentStreak).toBe(1);
    });

    it('atualiza o melhor recorde (bestStreak) quando o streak atual o supera', () => {
      let bestStreak = 7;
      let currentStreak = 8;
      bestStreak = Math.max(bestStreak, currentStreak);
      expect(bestStreak).toBe(8);
    });
  });

  describe('Reordenação Inteligente do Checklist', () => {
    it('mantém itens não concluídos no topo e itens marcados ao final', () => {
      const items = [
        { id: '1', text: 'Item 1' },
        { id: '2', text: 'Item 2' },
        { id: '3', text: 'Item 3' },
      ];

      const state: Record<string, boolean> = {
        '1': true,  // concluído
        '2': false, // pendente
        '3': false, // pendente
      };

      const sorted = [...items].sort((a, b) => {
        const aChecked = Boolean(state[a.id]);
        const bChecked = Boolean(state[b.id]);
        if (aChecked === bChecked) return 0;
        return aChecked ? 1 : -1;
      });

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });
  });
});
