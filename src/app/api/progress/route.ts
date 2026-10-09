import { NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/auth-server';
import { getUserProgress, updateUserProgress } from '@/db/progress';

export async function GET(request: Request) {
  try {
    const decoded = await verifyUserToken(request);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await getUserProgress(decoded.uid);
    if (!data) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      progress: data.progress,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName,
      },
    });
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar progresso do banco relacional', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyUserToken(request);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const updated = await updateUserProgress(decoded.uid, {
      currentStreak: body.currentStreak,
      bestStreak: body.bestStreak,
      lastStudyDate: body.lastStudyDate,
      phasesCompleted: body.phasesCompleted,
      checklistState: body.checklistState,
      pedagogicalState: body.pedagogicalState,
    });

    return NextResponse.json({ success: true, progress: updated });
  } catch (error: any) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Falha ao atualizar progresso no banco relacional', details: error.message },
      { status: 500 }
    );
  }
}
