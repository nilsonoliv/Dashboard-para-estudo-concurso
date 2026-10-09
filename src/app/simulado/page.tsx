'use client';

import React, { useEffect, useState } from 'react';
import { SimuladorView, QuestionData } from '@/components/SimuladorView';
import { ALL_RAW_QUESTIONS } from '@/data/allQuestions';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SimuladoStandalonePage() {
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setQuestions(
            ALL_RAW_QUESTIONS.map((q) => ({
              id: q.id,
              category: q.categoria,
              subject: q.materia,
              topic: q.assunto,
              position: q.cargo,
              year: q.ano ? String(q.ano) : undefined,
              banca: q.banca,
              concurso: q.concurso,
              statement: q.enunciado,
              image: q.imagem,
              options: q.alternativas,
              correctOptionIndex: q.resposta_correta,
              explanation: q.explicacao,
            }))
          );
        }
      })
      .catch(() => {
        setQuestions(
          ALL_RAW_QUESTIONS.map((q) => ({
            id: q.id,
            category: q.categoria,
            subject: q.materia,
            topic: q.assunto,
            position: q.cargo,
            year: q.ano ? String(q.ano) : undefined,
            banca: q.banca,
            concurso: q.concurso,
            statement: q.enunciado,
            image: q.imagem,
            options: q.alternativas,
            correctOptionIndex: q.resposta_correta,
            explanation: q.explicacao,
          }))
        );
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Painel
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              <span>Simulador Inteligente Concursos</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        <SimuladorView questions={questions} />
      </main>
    </div>
  );
}
