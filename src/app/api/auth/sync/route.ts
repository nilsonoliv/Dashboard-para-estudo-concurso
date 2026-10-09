import { NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/auth-server';
import { getOrCreateUser } from '@/db/users';

export async function POST(request: Request) {
  try {
    const decoded = await verifyUserToken(request);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: 'Não autorizado: Token inválido ou ausente' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const email = decoded.email || body.email || `${decoded.uid}@firebase.user`;
    const displayName = body.displayName || decoded.name || null;
    const photoUrl = body.photoUrl || decoded.picture || null;

    const dbUser = await getOrCreateUser(decoded.uid, email, displayName, photoUrl);

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Falha ao sincronizar usuário no banco relacional', details: error.message },
      { status: 500 }
    );
  }
}
