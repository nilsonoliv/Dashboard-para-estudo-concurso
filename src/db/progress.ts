import { db } from './index';
import { users, studyProgress, simulationSessions, questionAnswers, questions } from './schema';
import { eq, desc } from 'drizzle-orm';

export interface ProgressUpdatePayload {
  currentStreak?: number;
  bestStreak?: number;
  lastStudyDate?: string;
  phasesCompleted?: Record<string, boolean>;
  checklistState?: Record<string, boolean>;
  pedagogicalState?: Record<string, boolean>;
}

export async function getUserProgress(uid: string) {
  try {
    const userResult = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    const user = userResult[0];
    if (!user) return null;

    const progressResult = await db.select().from(studyProgress).where(eq(studyProgress.userId, user.id)).limit(1);
    if (progressResult.length > 0) {
      return { user, progress: progressResult[0] };
    }

    // Create default if not found
    const created = await db
      .insert(studyProgress)
      .values({
        userId: user.id,
        currentStreak: 0,
        bestStreak: 0,
        phasesCompleted: { phase1: false, phase2: false, phase3: false, phase4: false },
        checklistState: {},
        pedagogicalState: {},
      })
      .returning();

    return { user, progress: created[0] };
  } catch (error) {
    console.error('Failed to get study progress:', error);
    throw new Error('Database query failed for study progress.', { cause: error });
  }
}

export async function updateUserProgress(uid: string, updates: ProgressUpdatePayload) {
  try {
    const userResult = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    const user = userResult[0];
    if (!user) throw new Error('User not found');

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.currentStreak !== undefined) updateData.currentStreak = updates.currentStreak;
    if (updates.bestStreak !== undefined) updateData.bestStreak = updates.bestStreak;
    if (updates.lastStudyDate !== undefined) updateData.lastStudyDate = updates.lastStudyDate;
    if (updates.phasesCompleted !== undefined) updateData.phasesCompleted = updates.phasesCompleted;
    if (updates.checklistState !== undefined) updateData.checklistState = updates.checklistState;
    if (updates.pedagogicalState !== undefined) updateData.pedagogicalState = updates.pedagogicalState;

    const result = await db
      .insert(studyProgress)
      .values({
        userId: user.id,
        ...updateData,
      })
      .onConflictDoUpdate({
        target: studyProgress.userId,
        set: updateData,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to update study progress:', error);
    throw new Error('Database operation failed for study progress update.', { cause: error });
  }
}

export async function recordSimulationSession(
  uid: string,
  sessionData: {
    mode: string;
    subject?: string;
    topics?: string[];
    totalQuestions: number;
    score: number;
    durationSeconds?: number;
    answers?: Array<{
      questionId: number;
      selectedOption: number;
      isCorrect: boolean;
    }>;
  }
) {
  try {
    const userResult = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    const user = userResult[0];
    const userId = user?.id || null;

    const insertedSession = await db
      .insert(simulationSessions)
      .values({
        userId,
        mode: sessionData.mode,
        subject: sessionData.subject || null,
        topics: sessionData.topics || [],
        totalQuestions: sessionData.totalQuestions,
        score: sessionData.score,
        durationSeconds: sessionData.durationSeconds || 0,
      })
      .returning();

    const session = insertedSession[0];

    if (sessionData.answers && sessionData.answers.length > 0) {
      await db.insert(questionAnswers).values(
        sessionData.answers.map((a) => ({
          userId,
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          isCorrect: a.isCorrect,
          sessionId: session.id,
        }))
      );
    }

    return session;
  } catch (error) {
    console.error('Failed to record simulation session:', error);
    throw new Error('Database operation failed for simulation session.', { cause: error });
  }
}

export async function getUserSimulationHistory(uid: string) {
  try {
    const userResult = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    const user = userResult[0];
    if (!user) return [];

    return await db
      .select()
      .from(simulationSessions)
      .where(eq(simulationSessions.userId, user.id))
      .orderBy(desc(simulationSessions.createdAt))
      .limit(30);
  } catch (error) {
    console.error('Failed to get simulation history:', error);
    throw new Error('Database query failed for simulation history.', { cause: error });
  }
}
