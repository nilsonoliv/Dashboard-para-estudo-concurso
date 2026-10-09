'use client';

import React, { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Download,
  Upload,
  Database,
  CloudUpload,
  CloudDownload,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface BackupTabProps {
  onExportJSON: () => void;
  onImportJSON: (data: any) => void;
  onSyncCloud: () => Promise<void>;
  onPullCloud: () => Promise<void>;
  onHardReset: () => void;
}

export function BackupTab({
  onExportJSON,
  onImportJSON,
  onSyncCloud,
  onPullCloud,
  onHardReset,
}: BackupTabProps) {
  const { user, signInWithGoogle } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportJSON(parsed);
        showStatus('Backup JSON importado com sucesso!');
      } catch (err) {
        showStatus('Erro ao ler o arquivo JSON. Formato inválido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCloudPush = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setIsProcessing(true);
    try {
      await onSyncCloud();
      showStatus('Dados salvos com sucesso no PostgreSQL Cloud SQL!');
    } catch (e: any) {
      showStatus('Erro ao salvar no banco relacional.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloudPull = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setIsProcessing(true);
    try {
      await onPullCloud();
      showStatus('Dados restaurados do PostgreSQL Cloud SQL!');
    } catch (e: any) {
      showStatus('Erro ao puxar dados do banco relacional.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {statusMessage && (
        <div className="p-3.5 rounded-xl border border-blue-500/40 bg-blue-950/60 text-blue-200 text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Cloud SQL Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Database className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-bold">Banco Relacional Cloud SQL (PostgreSQL)</h2>
        </div>
        <p className="text-xs text-slate-300">
          Sincronize seu progresso, checklists e histórico de simulados diretamente na nuvem no banco relacional Cloud SQL gerenciado.
        </p>

        {user ? (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white">Conta conectada:</span> {user.email}
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Autenticado
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
            <span>Conecte sua conta do Google para persistência automática no PostgreSQL.</span>
            <button
              onClick={signInWithGoogle}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
            >
              Conectar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleCloudPush}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            <CloudUpload className="h-4 w-4" />
            Salvar no Cloud SQL
          </button>

          <button
            onClick={handleCloudPull}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
          >
            <CloudDownload className="h-4 w-4" />
            Restaurar da Nuvem
          </button>
        </div>
      </div>

      {/* JSON File Backup Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Download className="h-5 w-5 text-indigo-400" />
          <h2 className="text-base font-bold">Arquivo de Backup Local (JSON)</h2>
        </div>
        <p className="text-xs text-slate-300">
          Você também pode descarregar um arquivo local com todo o seu histórico para segurança física ou transferir para outro navegador.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onExportJSON}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            Exportar JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
          >
            <Upload className="h-4 w-4 text-emerald-400" />
            Importar JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-400" /> Reset Geral do Aluno
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Zera sequências, checklists e histórico local.
          </p>
        </div>

        <button
          onClick={onHardReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition"
        >
          <Trash2 className="h-4 w-4" />
          Zerar Dados
        </button>
      </div>
    </div>
  );
}
