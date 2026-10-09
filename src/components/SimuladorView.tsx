'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  FileQuestion,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  BarChart3,
  Award,
  Filter,
  ArrowRight,
  HelpCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export interface QuestionData {
  id: number;
  category?: string;
  subject: string;
  topic: string;
  position?: string;
  year?: string;
  banca?: string;
  concurso?: string;
  statement: string;
  image?: string | null;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

interface SimuladorViewProps {
  questions: QuestionData[];
  onSessionComplete?: (session: any) => void;
}

type Mode = 'livre' | 'cronometrado' | 'erradas';

export function SimuladorView({ questions, onSessionComplete }: SimuladorViewProps) {
  const { user, getIdToken } = useAuth();

  // Mode selection state
  const [selectedMode, setSelectedMode] = useState<Mode>('livre');
  const [selectedSubject, setSelectedSubject] = useState<string>('todos');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['todos']);
  const [timeMinutes, setTimeMinutes] = useState<number>(30);
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Simulation runner state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [activeQuestions, setActiveQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Array<{
    questionId: number;
    selectedOption: number;
    isCorrect: boolean;
  }>>([]);

  // Timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Subjects & topics list extracted from available questions
  const subjectsMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const q of questions) {
      if (!map[q.subject]) map[q.subject] = new Set();
      map[q.subject].add(q.topic);
    }
    return map;
  }, [questions]);

  const availableSubjects = useMemo(() => Object.keys(subjectsMap), [subjectsMap]);

  const availableTopics = useMemo(() => {
    if (selectedSubject === 'todos') {
      const all = new Set<string>();
      Object.values(subjectsMap).forEach((set) => set.forEach((t) => all.add(t)));
      return Array.from(all);
    }
    return Array.from(subjectsMap[selectedSubject] || []);
  }, [selectedSubject, subjectsMap]);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && selectedMode === 'cronometrado') {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            finishSimulation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedMode]);

  const startSimulation = () => {
    // Filter questions by subject and topics
    let pool = [...questions];

    if (selectedSubject !== 'todos') {
      pool = pool.filter((q) => q.subject === selectedSubject);
    }

    if (!selectedTopics.includes('todos') && selectedTopics.length > 0) {
      pool = pool.filter((q) => selectedTopics.includes(q.topic));
    }

    // Shuffle pool
    pool.sort(() => Math.random() - 0.5);

    // Limit count
    const chosen = pool.slice(0, questionCount);
    if (chosen.length === 0) {
      alert('Nenhuma questão encontrada para os filtros selecionados.');
      return;
    }

    setActiveQuestions(chosen);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswers([]);
    setIsFinished(false);
    setIsRunning(true);

    if (selectedMode === 'cronometrado') {
      setSecondsRemaining(timeMinutes * 60);
    }
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    const currentQ = activeQuestions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctOptionIndex;

    const answerRecord = {
      questionId: currentQ.id,
      selectedOption,
      isCorrect,
    };

    setUserAnswers((prev) => [...prev, answerRecord]);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishSimulation();
    }
  };

  const finishSimulation = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsFinished(true);

    const score = userAnswers.filter((a) => a.isCorrect).length;
    const duration = selectedMode === 'cronometrado'
      ? timeMinutes * 60 - secondsRemaining
      : 0;

    // Send session to PostgreSQL Cloud SQL backend
    try {
      const token = await getIdToken();
      if (token) {
        await fetch('/api/simulations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mode: selectedMode,
            subject: selectedSubject,
            topics: selectedTopics,
            totalQuestions: activeQuestions.length,
            score,
            durationSeconds: duration,
            answers: userAnswers,
          }),
        });
      }
    } catch (e) {
      console.error('Failed to record simulation in database:', e);
    }

    if (onSessionComplete) {
      onSessionComplete({ score, total: activeQuestions.length });
    }
  };

  const cancelSimulation = () => {
    if (confirm('Tem certeza que deseja cancelar o simulado em andamento?')) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      setIsFinished(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // RENDER 1: Running view
  if (isRunning && activeQuestions.length > 0) {
    const currentQ = activeQuestions[currentIndex];
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header Runner */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
              Questão {currentIndex + 1} de {activeQuestions.length}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {currentQ.subject} • {currentQ.topic}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {selectedMode === 'cronometrado' && (
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                <Clock className="h-4 w-4" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}
            <button
              onClick={cancelSimulation}
              className="text-xs text-rose-400 hover:text-rose-300 transition font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
            {currentQ.banca && (
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold text-slate-300">
                Banca: {currentQ.banca}
              </span>
            )}
            {(currentQ.year || (currentQ as any).ano) && (
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                Ano: {currentQ.year || (currentQ as any).ano}
              </span>
            )}
            {currentQ.position && (
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                Cargo: {currentQ.position}
              </span>
            )}
          </div>

          {/* Statement */}
          <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-100 whitespace-pre-line">
            {currentQ.statement}
          </p>

          {/* Optional image */}
          {currentQ.image && (
            <div className="my-3 rounded-lg overflow-hidden border border-slate-700">
              <img
                src={currentQ.image.startsWith('/') ? currentQ.image : `/assets/img/img-questions/${currentQ.image}`}
                alt="Imagem de apoio da questão"
                className="max-h-80 mx-auto object-contain"
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrectAnswer = currentQ.correctOptionIndex === optIdx;

              let optionClasses = 'border-slate-800 bg-slate-950/40 text-slate-200 hover:border-slate-700 hover:bg-slate-800/50';

              if (isAnswered) {
                if (isCorrectAnswer) {
                  optionClasses = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-md shadow-emerald-950';
                } else if (isSelected && !isCorrectAnswer) {
                  optionClasses = 'border-rose-500 bg-rose-950/40 text-rose-200';
                } else {
                  optionClasses = 'border-slate-800/50 opacity-40 text-slate-400';
                }
              } else if (isSelected) {
                optionClasses = 'border-blue-500 bg-blue-950/40 text-blue-200 ring-1 ring-blue-500';
              }

              return (
                <button
                  key={optIdx}
                  disabled={isAnswered}
                  onClick={() => setSelectedOption(optIdx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${optionClasses}`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold border border-slate-700 bg-slate-800">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-relaxed flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Answer confirmation and explanation */}
          {!isAnswered ? (
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleConfirmAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-md transition"
              >
                Confirmar Resposta
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  selectedOption === currentQ.correctOptionIndex
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                    : 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1.5 text-sm">
                  {selectedOption === currentQ.correctOptionIndex ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span>Resposta Correta!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-rose-400" />
                      <span>Resposta Incorreta.</span>
                    </>
                  )}
                </div>
                {currentQ.explanation && (
                  <p className="mt-2 text-slate-200">
                    <strong className="text-white">Explicação: </strong>
                    {currentQ.explanation}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition"
                >
                  <span>{currentIndex + 1 < activeQuestions.length ? 'Próxima Questão' : 'Finalizar Simulado'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER 2: Finished results view
  if (isFinished) {
    const total = activeQuestions.length;
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const percentage = Math.round((correctCount / (total || 1)) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 ring-2 ring-blue-500/30">
              <Award className="h-8 w-8 text-amber-400" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Simulado Concluído!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Seu resultado foi processado e registrado no banco de dados.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 py-4 max-w-sm mx-auto">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-2xl font-bold text-white">{correctCount}/{total}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Acertos</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-2xl font-bold text-blue-400">{percentage}%</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Aproveitamento</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <div className="text-2xl font-bold text-emerald-400">{total - correctCount}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Erros</div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsFinished(false);
              setIsRunning(false);
            }}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md transition"
          >
            <RotateCcw className="h-4 w-4" />
            Configurar Novo Simulado
          </button>
        </div>
      </div>
    );
  }

  // RENDER 3: Setup / Dashboard view
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileQuestion className="h-6 w-6 text-blue-400" />
            Simulador Tático de Questões
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Banco relacional com {questions.length} questões cadastradas para o seu concurso.
          </p>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setSelectedMode('livre')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedMode === 'livre'
              ? 'border-blue-500 bg-blue-950/20 ring-1 ring-blue-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Modo Livre / Treino</h3>
              <p className="text-xs text-slate-400">Resolva no seu próprio ritmo com gabarito comentado instantâneo.</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setSelectedMode('cronometrado')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedMode === 'cronometrado'
              ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Modo Cronometrado</h3>
              <p className="text-xs text-slate-400">Simule a pressão do dia da prova com contagem regressiva oficial.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Configuration */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-400" />
          Configuração do Simulado
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matéria */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Matéria / Disciplina
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopics(['todos']);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todas as Matérias</option>
              {availableSubjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Quantidade de Questões */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Quantidade de Questões
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value={5}>5 Questões</option>
              <option value={10}>10 Questões</option>
              <option value={15}>15 Questões</option>
              <option value={20}>20 Questões</option>
              <option value={30}>30 Questões</option>
              <option value={50}>50 Questões</option>
            </select>
          </div>

          {/* Tempo se cronometrado */}
          {selectedMode === 'cronometrado' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tempo Limite (Minutos)
              </label>
              <select
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value={10}>10 Minutos</option>
                <option value={20}>20 Minutos</option>
                <option value={30}>30 Minutos</option>
                <option value={45}>45 Minutos</option>
                <option value={60}>60 Minutos</option>
              </select>
            </div>
          )}
        </div>

        {/* Tópicos / Assuntos selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">
              Assuntos Específicos
            </label>
            <button
              onClick={() => setSelectedTopics(['todos'])}
              className="text-[11px] text-blue-400 hover:text-blue-300"
            >
              Marcar Todos
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-950/40 border border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer p-1.5 rounded hover:bg-slate-800">
              <input
                type="checkbox"
                checked={selectedTopics.includes('todos')}
                onChange={() => setSelectedTopics(['todos'])}
                className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-800 text-blue-600"
              />
              <span className="font-semibold text-blue-400">Todos os assuntos</span>
            </label>

            {availableTopics.map((topic) => {
              const isChecked = selectedTopics.includes(topic);
              return (
                <label
                  key={topic}
                  className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={selectedTopics.includes('todos')}
                    onChange={() => {
                      if (isChecked) {
                        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
                      } else {
                        setSelectedTopics([...selectedTopics.filter((t) => t !== 'todos'), topic]);
                      }
                    }}
                    className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-800 text-blue-600 disabled:opacity-40"
                  />
                  <span className="truncate">{topic}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Start button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={startSimulation}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition hover:scale-105 active:scale-95"
          >
            <Play className="h-4 w-4 fill-white" />
            Iniciar Simulado
          </button>
        </div>
      </div>
    </div>
  );
}
