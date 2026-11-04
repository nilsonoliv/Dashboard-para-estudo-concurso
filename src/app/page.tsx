'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { TabsNav, TabKey } from '@/components/TabsNav';
import { FasesTab } from '@/components/FasesTab';
import { FinanceiroTab } from '@/components/FinanceiroTab';
import { ChecklistTab } from '@/components/ChecklistTab';
import { PedagogicaTab } from '@/components/PedagogicaTab';
import { BackupTab } from '@/components/BackupTab';
import { SimuladorView, QuestionData } from '@/components/SimuladorView';
import { BASE_CHECKLIST_ITEMS, PEDAGOGICAL_CHECKLIST_ITEMS } from '@/data/checklistItems';
import { ALL_RAW_QUESTIONS } from '@/data/allQuestions';

export default function HomePage() {
  const { user, token, getIdToken } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('fases');
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lastStudyDate, setLastStudyDate] = useState<string>('');
  const [isStudiedToday, setIsStudiedToday] = useState<boolean>(false);
  const [phasesCompleted, setPhasesCompleted] = useState<Record<string, boolean>>({
    phase1: false,
    phase2: false,
    phase3: false,
    phase4: false,
  });
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [pedagogicalState, setPedagogicalState] = useState<Record<string, boolean>>({});
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const parseTabKey = (key: string | null): TabKey => {
    if (!key) return 'fases';
    const clean = key.replace('#', '').replace(/^content-/, '').toLowerCase();
    if (
      clean === 'escada' ||
      clean === 'financeiro' ||
      clean === 'prioridades' ||
      clean === 'evolucao' ||
      clean === 'evolução'
    )
      return 'financeiro';
    if (clean === 'check' || clean === 'checklist') return 'checklist';
    if (
      clean === 'checklist2' ||
      clean === 'pedagogica' ||
      clean === 'pedagogico' ||
      clean === 'pedagógica' ||
      clean === 'lista-pedagogica' ||
      clean === 'lista'
    )
      return 'pedagogica';
    if (clean === 'simulado' || clean === 'simulador' || clean === 'questoes' || clean === 'questões')
      return 'simulado';
    if (clean === 'backup' || clean === 'nuvem') return 'backup';
    if (clean === 'fases') return 'fases';
    const valid: TabKey[] = ['fases', 'financeiro', 'checklist', 'pedagogica', 'simulado', 'backup'];
    if (valid.includes(clean as TabKey)) return clean as TabKey;
    return 'fases';
  };

  const handleTabChange = (newTab: TabKey) => {
    const validTab = parseTabKey(newTab);
    setActiveTab(validTab);
    try {
      localStorage.setItem('activeTab', validTab);
      if (typeof window !== 'undefined') {
        const hashTarget =
          validTab === 'financeiro' ? 'escada' :
          validTab === 'checklist' ? 'check' :
          validTab === 'pedagogica' ? 'checklist2' :
          validTab;
        window.history.replaceState(null, '', `#${hashTarget}`);
      }
    } catch (e) {
      // ignore
    }
  };

  // Helper for today's date in YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getDaysDiff = (dateStr1: string, dateStr2: string) => {
    const d1 = new Date(dateStr1 + 'T00:00:00');
    const d2 = new Date(dateStr2 + 'T00:00:00');
    return Math.floor((d2.getTime() - d1.getTime()) / 86400000);
  };

  // 1. Initial load from LocalStorage
  useEffect(() => {
    try {
      const today = getTodayStr();
      const savedLastStudy = localStorage.getItem('lastStudyDate') || '';
      let savedCurrent = parseInt(localStorage.getItem('currentStreak') || '0', 10);
      let savedBest = parseInt(localStorage.getItem('bestStreak') || '0', 10);

      // Streak continuity check
      if (savedLastStudy && getDaysDiff(savedLastStudy, today) > 1) {
        savedCurrent = 0;
        localStorage.setItem('currentStreak', '0');
      }

      setCurrentStreak(savedCurrent);
      setBestStreak(savedBest);
      setLastStudyDate(savedLastStudy);
      setIsStudiedToday(savedLastStudy === today);

      // Phases
      const pSaved: Record<string, boolean> = {
        phase1: localStorage.getItem('phase-1-done') === 'true',
        phase2: localStorage.getItem('phase-2-done') === 'true',
        phase3: localStorage.getItem('phase-3-done') === 'true',
        phase4: localStorage.getItem('phase-4-done') === 'true',
      };
      setPhasesCompleted(pSaved);

      // Checklist base
      const chkSaved: Record<string, boolean> = {};
      BASE_CHECKLIST_ITEMS.forEach((item) => {
        const val = localStorage.getItem(item.id);
        if (val === 'true') chkSaved[item.id] = true;
      });
      setChecklistState(chkSaved);

      // Pedagogical checklist
      const pedSaved: Record<string, boolean> = {};
      PEDAGOGICAL_CHECKLIST_ITEMS.forEach((item) => {
        const val = localStorage.getItem(item.id);
        if (val === 'true') pedSaved[item.id] = true;
      });
      setPedagogicalState(pedSaved);

      // Active Tab restoration from hash or storage
      const hashTab = window.location.hash ? parseTabKey(window.location.hash) : null;
      const storedTab = localStorage.getItem('activeTab') ? parseTabKey(localStorage.getItem('activeTab')) : null;
      if (hashTab) {
        setActiveTab(hashTab);
      } else if (storedTab) {
        setActiveTab(storedTab);
      }

      const onHashChange = () => {
        setActiveTab(parseTabKey(window.location.hash));
      };
      window.addEventListener('hashchange', onHashChange);

      // Global click handler to capture any tab clicks (from nav, buttons, links, etc.)
      const onDocumentClick = (e: MouseEvent) => {
        const el = (e.target as HTMLElement | null)?.closest?.('.tab-btn, [data-target], [data-tab]');
        if (el) {
          const raw = el.getAttribute('data-tab') || el.getAttribute('data-target');
          if (raw) {
            handleTabChange(parseTabKey(raw));
          }
        }
      };
      document.addEventListener('click', onDocumentClick);

      // Expose switchTab globally for legacy scripts or console evaluation
      (window as any).switchTab = (targetId: string) => {
        handleTabChange(parseTabKey(targetId));
      };

      return () => {
        window.removeEventListener('hashchange', onHashChange);
        document.removeEventListener('click', onDocumentClick);
      };
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
  }, []);

  // 2. Fetch questions from backend API (or static fallback)
  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          // Fallback to local raw questions
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
      .catch((err) => {
        console.error('Error fetching questions:', err);
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

  // 3. Sync with Cloud SQL when user authenticates
  useEffect(() => {
    if (!user) return;

    const pullRemoteProgress = async () => {
      try {
        setIsSyncing(true);
        const idToken = await getIdToken();
        if (!idToken) return;

        const res = await fetch('/api/progress', {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.progress) {
            const remote = data.progress;
            if (remote.currentStreak !== undefined && remote.currentStreak > 0) {
              setCurrentStreak(remote.currentStreak);
              localStorage.setItem('currentStreak', String(remote.currentStreak));
            }
            if (remote.bestStreak !== undefined && remote.bestStreak > 0) {
              setBestStreak(remote.bestStreak);
              localStorage.setItem('bestStreak', String(remote.bestStreak));
            }
            if (remote.lastStudyDate) {
              setLastStudyDate(remote.lastStudyDate);
              localStorage.setItem('lastStudyDate', remote.lastStudyDate);
              setIsStudiedToday(remote.lastStudyDate === getTodayStr());
            }
            if (remote.phasesCompleted) {
              setPhasesCompleted(remote.phasesCompleted);
            }
            if (remote.checklistState) {
              setChecklistState(remote.checklistState);
            }
            if (remote.pedagogicalState) {
              setPedagogicalState(remote.pedagogicalState);
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync progress with Cloud SQL:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    pullRemoteProgress();
  }, [user, getIdToken]);

  // Helper to persist state to Cloud SQL (debounced or on changes)
  const saveToCloud = useCallback(
    async (overrideData?: any) => {
      if (!user) return;
      try {
        const idToken = await getIdToken();
        if (!idToken) return;

        const payload = overrideData || {
          currentStreak,
          bestStreak,
          lastStudyDate,
          phasesCompleted,
          checklistState,
          pedagogicalState,
        };

        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.error('Cloud save failed:', e);
      }
    },
    [user, getIdToken, currentStreak, bestStreak, lastStudyDate, phasesCompleted, checklistState, pedagogicalState]
  );

  // Actions
  const handleStudyToday = () => {
    const today = getTodayStr();
    let nextCurrent = currentStreak;

    if (!lastStudyDate) {
      nextCurrent = 1;
    } else {
      const diff = getDaysDiff(lastStudyDate, today);
      if (diff === 1) nextCurrent += 1;
      else if (diff > 1) nextCurrent = 1;
    }

    const nextBest = Math.max(bestStreak, nextCurrent);

    setCurrentStreak(nextCurrent);
    setBestStreak(nextBest);
    setLastStudyDate(today);
    setIsStudiedToday(true);

    localStorage.setItem('currentStreak', String(nextCurrent));
    localStorage.setItem('bestStreak', String(nextBest));
    localStorage.setItem('lastStudyDate', today);

    saveToCloud({
      currentStreak: nextCurrent,
      bestStreak: nextBest,
      lastStudyDate: today,
      phasesCompleted,
      checklistState,
      pedagogicalState,
    });
  };

  const handleTogglePhase = (phaseKey: string) => {
    setPhasesCompleted((prev) => {
      const updated = { ...prev, [phaseKey]: !prev[phaseKey] };
      const storageKey =
        phaseKey === 'phase1'
          ? 'phase-1-done'
          : phaseKey === 'phase2'
          ? 'phase-2-done'
          : phaseKey === 'phase3'
          ? 'phase-3-done'
          : 'phase-4-done';

      localStorage.setItem(storageKey, String(updated[phaseKey]));
      saveToCloud({ phasesCompleted: updated });
      return updated;
    });
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklistState((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem(id, String(updated[id]));
      saveToCloud({ checklistState: updated });
      return updated;
    });
  };

  const handleTogglePedagogicalItem = (id: string) => {
    setPedagogicalState((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem(id, String(updated[id]));
      saveToCloud({ pedagogicalState: updated });
      return updated;
    });
  };

  const handleResetChecklist = () => {
    if (confirm('Tem certeza que deseja limpar todo o progresso do checklist base?')) {
      BASE_CHECKLIST_ITEMS.forEach((i) => localStorage.removeItem(i.id));
      setChecklistState({});
      saveToCloud({ checklistState: {} });
    }
  };

  const handleResetPedagogical = () => {
    if (confirm('Tem certeza que deseja limpar a lista pedagógica?')) {
      PEDAGOGICAL_CHECKLIST_ITEMS.forEach((i) => localStorage.removeItem(i.id));
      setPedagogicalState({});
      saveToCloud({ pedagogicalState: {} });
    }
  };

  const handleExportJSON = () => {
    const backup = {
      version: '2.0-nextjs',
      date: new Date().toISOString(),
      currentStreak,
      bestStreak,
      lastStudyDate,
      phasesCompleted,
      checklistState,
      pedagogicalState,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-concursos-saude-ba-${getTodayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (data: any) => {
    if (data.currentStreak !== undefined) {
      setCurrentStreak(data.currentStreak);
      localStorage.setItem('currentStreak', String(data.currentStreak));
    }
    if (data.bestStreak !== undefined) {
      setBestStreak(data.bestStreak);
      localStorage.setItem('bestStreak', String(data.bestStreak));
    }
    if (data.lastStudyDate) {
      setLastStudyDate(data.lastStudyDate);
      localStorage.setItem('lastStudyDate', data.lastStudyDate);
      setIsStudiedToday(data.lastStudyDate === getTodayStr());
    }
    if (data.phasesCompleted) {
      setPhasesCompleted(data.phasesCompleted);
    }
    if (data.checklistState) {
      setChecklistState(data.checklistState);
      Object.entries(data.checklistState).forEach(([k, v]) => localStorage.setItem(k, String(v)));
    }
    if (data.pedagogicalState) {
      setPedagogicalState(data.pedagogicalState);
      Object.entries(data.pedagogicalState).forEach(([k, v]) => localStorage.setItem(k, String(v)));
    }

    saveToCloud(data);
  };

  const handleHardReset = () => {
    if (confirm('Isso apagará todo seu progresso, sequências e dados de checklist locais. Continuar?')) {
      localStorage.clear();
      setCurrentStreak(0);
      setBestStreak(0);
      setLastStudyDate('');
      setIsStudiedToday(false);
      setPhasesCompleted({ phase1: false, phase2: false, phase3: false, phase4: false });
      setChecklistState({});
      setPedagogicalState({});
      saveToCloud({
        currentStreak: 0,
        bestStreak: 0,
        lastStudyDate: '',
        phasesCompleted: { phase1: false, phase2: false, phase3: false, phase4: false },
        checklistState: {},
        pedagogicalState: {},
      });
    }
  };

  const handleSyncCloud = async () => {
    await saveToCloud();
  };

  const handlePullCloud = async () => {
    if (!user) return;
    const idToken = await getIdToken();
    if (!idToken) return;

    const res = await fetch('/api/progress', {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.progress) {
        handleImportJSON(data.progress);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Top Header */}
      <Header
        currentStreak={currentStreak}
        bestStreak={bestStreak}
        isStudiedToday={isStudiedToday}
        onStudyToday={handleStudyToday}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <TabsNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab Contents */}
        <div className="pt-2">
          <section
            id="content-fases"
            data-tab="fases"
            className={`tab-content ${activeTab === 'fases' ? 'active block' : 'hidden'}`}
            aria-labelledby="tab-btn-fases"
          >
            <FasesTab
              phasesCompleted={phasesCompleted}
              onTogglePhase={handleTogglePhase}
              onOpenSimulado={() => handleTabChange('simulado')}
            />
          </section>

          <section
            id="content-escada"
            data-tab="financeiro"
            className={`tab-content ${activeTab === 'financeiro' ? 'active block' : 'hidden'}`}
            aria-labelledby="tab-btn-escada"
          >
            <FinanceiroTab />
          </section>

          <section
            id="content-check"
            data-tab="checklist"
            className={`tab-content ${activeTab === 'checklist' ? 'active block' : 'hidden'}`}
            aria-labelledby="tab-btn-check"
          >
            <ChecklistTab
              checklistState={checklistState}
              onToggleItem={handleToggleChecklistItem}
              onReset={handleResetChecklist}
            />
          </section>

          <section
            id="content-checklist2"
            data-tab="pedagogica"
            className={`tab-content ${activeTab === 'pedagogica' ? 'active block' : 'hidden'}`}
            aria-labelledby="tab-btn-checklist2"
          >
            <PedagogicaTab
              pedagogicalState={pedagogicalState}
              onToggleItem={handleTogglePedagogicalItem}
              onReset={handleResetPedagogical}
            />
          </section>

          <section
            id="content-simulado"
            data-tab="simulado"
            className={`tab-content ${activeTab === 'simulado' ? 'active block' : 'hidden'}`}
            aria-labelledby="tab-btn-simulado"
          >
            <SimuladorView questions={questions} />
          </section>

          <section
            id="content-backup"
            data-tab="backup"
            className={`tab-content ${activeTab === 'backup' ? 'active block' : 'hidden'}`}
            aria-labelledby="tab-btn-backup"
          >
            <BackupTab
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
              onSyncCloud={handleSyncCloud}
              onPullCloud={handlePullCloud}
              onHardReset={handleHardReset}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        Operação SAÚDE BA | PST • Desenvolvido com Next.js & Cloud SQL (PostgreSQL)
      </footer>
    </div>
  );
}
