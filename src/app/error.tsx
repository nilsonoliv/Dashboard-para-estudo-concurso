'use client';

import React, { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured layout error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-lg font-bold text-white mb-2">Erro ao carregar conteúdo</h2>
      <p className="text-xs text-slate-400 mb-4">Tente recarregar a visualização.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition"
      >
        Tentar novamente
      </button>
    </div>
  );
}
