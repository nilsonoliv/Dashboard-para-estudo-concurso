import { adminAuth } from './firebase-admin';

export async function verifyUserToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch (error) {
    console.error('Failed to verify Firebase auth token:', error);
    return null;
  }
}
