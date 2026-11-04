import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-blue-500">404</h1>
        <h2 className="text-xl font-bold text-white">Página não encontrada</h2>
        <p className="text-xs text-slate-400">A página solicitada não existe ou foi movida.</p>
        <Link
          href="/"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
