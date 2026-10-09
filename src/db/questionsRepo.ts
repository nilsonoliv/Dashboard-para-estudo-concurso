import { db } from './index';
import { questions } from './schema';
import { inArray, eq, sql } from 'drizzle-orm';

export async function getAllQuestions() {
  try {
    return await db.select().from(questions).orderBy(questions.id);
  } catch (error) {
    console.error('Failed to get all questions from database:', error);
    throw new Error('Database query failed for questions.', { cause: error });
  }
}

export async function getQuestionsCount() {
  try {
    const res = await db.select({ count: sql<number>`count(*)::int` }).from(questions);
    return res[0]?.count || 0;
  } catch (error) {
    console.error('Failed to get questions count:', error);
    return 0;
  }
}

export async function seedQuestionsBatch(items: any[]) {
  try {
    if (!items || items.length === 0) return 0;

    // Insert in batches of 50 to avoid parameter limit
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize).map((q) => ({
        id: q.id,
        category: q.categoria || q.category || null,
        subject: q.materia || q.subject || 'Geral',
        topic: q.assunto || q.topic || 'Geral',
        position: q.cargo || q.position || null,
        year: q.ano ? String(q.ano) : null,
        banca: q.banca || null,
        concurso: q.concurso || null,
        statement: q.enunciado || q.statement || '',
        image: q.imagem || q.image || null,
        options: q.alternativas || q.options || [],
        correctOptionIndex: q.resposta_correta ?? q.correctOptionIndex ?? 0,
        explanation: q.explicacao || q.explanation || null,
      }));

      await db
        .insert(questions)
        .values(batch)
        .onConflictDoNothing({ target: questions.id });

      inserted += batch.length;
    }

    return inserted;
  } catch (error) {
    console.error('Failed to seed questions:', error);
    throw new Error('Database operation failed for seeding questions.', { cause: error });
  }
}
