import { db } from './index';
import { users, studyProgress } from './schema';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string | null, photoUrl?: string | null) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          photoUrl: photoUrl || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    const user = result[0];

    // Ensure initial studyProgress record exists
    if (user) {
      await db
        .insert(studyProgress)
        .values({
          userId: user.id,
          currentStreak: 0,
          bestStreak: 0,
          phasesCompleted: { phase1: false, phase2: false, phase3: false, phase4: false },
          checklistState: {},
          pedagogicalState: {},
        })
        .onConflictDoNothing();
    }

    return user;
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Database operation failed for user synchronization.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to query user by UID:', error);
    throw new Error('Database query failed for user.', { cause: error });
  }
}
