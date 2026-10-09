'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Coins,
  ShieldCheck,
  User as UserIcon,
  LogIn,
  LogOut,
  Database,
} from 'lucide-react';

interface HeaderProps {
  currentStreak: number;
  bestStreak: number;
  isStudiedToday: boolean;
  onStudyToday: () => void;
  isSyncing: boolean;
}

export function Header({
  currentStreak,
  bestStreak,
  isStudiedToday,
  onStudyToday,
  isSyncing,
}: HeaderProps) {
  const { user, signInWithGoogle, signOut } = useAuth();

  // Countdowns calculations
  const countdowns = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calcItem = (targetDateStr: string, ticketPrice: number) => {
      const target = new Date(targetDateStr);
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / 86400000);
      const perDay = diffDays > 0 ? ticketPrice / diffDays : 0;
      return { diffDays, perDay, ticketPrice };
    };

    const etapa2 = calcItem('2026-10-25T00:00:00', 0);
    const bonito = calcItem('2026-09-20T00:00:00', 441);
    const ibge2 = calcItem('2026-09-27T00:00:00', 50);
    const formosa = calcItem('2026-10-11T00:00:00', 900);

    const totalPerDay = bonito.perDay + ibge2.perDay + formosa.perDay;

    return { etapa2, bonito, ibge2, formosa, totalPerDay };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Operação SAÚDE BA
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    PST
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Dashboard Tático & Banco Relacional Cloud SQL</p>
              </div>
            </div>

            {/* Mobile Auth button */}
            <div className="md:hidden">
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </button>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 text-xs text-blue-300 bg-blue-900/40 px-2.5 py-1.5 rounded-lg border border-blue-700/50"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Entrar
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar (Countdowns + Streak + Auth) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            
            {/* Countdown Etapa 2 */}
            <div className="rounded-lg bg-slate-800/80 px-3 py-1.5 border border-slate-700/50">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Etapa 2</div>
              <div className="text-sm font-bold text-amber-400">
                {countdowns.etapa2.diffDays > 0 ? `${countdowns.etapa2.diffDays} dias` : 'Chegou o dia!'}
              </div>
            </div>

            {/* Total per day */}
            <div className="rounded-lg bg-slate-800/80 px-3 py-1.5 border border-slate-700/50">
              <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Coins className="h-3 w-3 text-emerald-400" /> Total Diário
              </div>
              <div className="text-sm font-bold text-emerald-400">
                R$ {countdowns.totalPerDay.toFixed(1)} /dia
              </div>
            </div>

            {/* Bonito */}
            <div className="hidden lg:block rounded-lg bg-slate-800/80 px-3 py-1.5 border border-slate-700/50">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Bonito</div>
              <div className="text-xs font-semibold text-slate-200">
                {countdowns.bonito.diffDays}d • R$ {countdowns.bonito.perDay.toFixed(1)}/d
              </div>
            </div>

            {/* IBGE 2 */}
            <div className="hidden lg:block rounded-lg bg-slate-800/80 px-3 py-1.5 border border-slate-700/50">
              <div className="text-[10px] uppercase font-semibold text-slate-400">IBGE 2</div>
              <div className="text-xs font-semibold text-slate-200">
                {countdowns.ibge2.diffDays}d • R$ {countdowns.ibge2.perDay.toFixed(1)}/d
              </div>
            </div>

            {/* Formosa */}
            <div className="hidden xl:block rounded-lg bg-slate-800/80 px-3 py-1.5 border border-slate-700/50">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Formosa</div>
              <div className="text-xs font-semibold text-slate-200">
                {countdowns.formosa.diffDays}d • R$ {countdowns.formosa.perDay.toFixed(1)}/d
              </div>
            </div>

            {/* Streak Tracker & Study Today Button */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-800/90 p-1.5 border border-slate-700">
              <button
                onClick={onStudyToday}
                disabled={isStudiedToday}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isStudiedToday
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow active:scale-95'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isStudiedToday ? 'Estudei Hoje!' : 'Estudei Hoje!'}
              </button>

              <div className="flex items-center gap-1 px-2 text-xs font-semibold text-amber-400">
                <Flame className="h-4 w-4 fill-amber-400 text-amber-500 animate-pulse" />
                <span>{currentStreak}d</span>
              </div>
              <div className="hidden sm:block text-[11px] text-slate-400 px-1 border-l border-slate-700">
                Recorde: <span className="font-semibold text-slate-200">{bestStreak}d</span>
              </div>
            </div>

            {/* Google Auth & User Info */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2 rounded-lg bg-slate-800/80 p-1.5 border border-slate-700">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuário'}
                      className="h-7 w-7 rounded-full border border-blue-500/40"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-200 leading-none max-w-[110px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Database className="h-2.5 w-2.5" /> Sincronizado
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    title="Desconectar"
                    className="p-1 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  <LogIn className="h-3.5 w-3.5 text-blue-400" />
                  <span>Entrar com Google</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
