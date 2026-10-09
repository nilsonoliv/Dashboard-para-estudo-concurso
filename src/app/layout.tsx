import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Dashboard Tático - SAÚDE BA | PST',
  description: 'Dashboard tático para planejamento de estudos, acompanhamento de fases e simulados para concursos públicos.',
  openGraph: {
    title: 'Dashboard Tático - SAÚDE BA | PST',
    description: 'Dashboard tático para planejamento de estudos, acompanhamento de fases e simulados para concursos públicos.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" type="image/png" href="https://images.vexels.com/media/users/3/224234/isolated/preview/ff7c525c1c3e1bef640644542001e1fd-logotipo-da-escola-online.png" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
