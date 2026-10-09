import { NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/auth-server';
import { recordSimulationSession, getUserSimulationHistory } from '@/db/progress';

export async function GET(request: Request) {
  try {
    const decoded = await verifyUserToken(request);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const history = await getUserSimulationHistory(decoded.uid);
    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error('Error fetching simulations history:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar histórico de simulados', details: error.message },
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
    const session = await recordSimulationSession(decoded.uid, {
      mode: body.mode || 'livre',
      subject: body.subject,
      topics: body.topics,
      totalQuestions: body.totalQuestions || 0,
      score: body.score || 0,
      durationSeconds: body.durationSeconds || 0,
      answers: body.answers,
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error('Error recording simulation session:', error);
    return NextResponse.json(
      { error: 'Falha ao salvar sessão de simulado', details: error.message },
      { status: 500 }
    );
  }
}
