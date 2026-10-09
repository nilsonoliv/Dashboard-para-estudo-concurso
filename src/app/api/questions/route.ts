import { NextResponse } from 'next/server';
import { getAllQuestions, getQuestionsCount, seedQuestionsBatch } from '@/db/questionsRepo';
import { ALL_RAW_QUESTIONS } from '@/data/allQuestions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const autoSeed = searchParams.get('autoseed') === 'true';

    let count = await getQuestionsCount();
    if (count === 0 || autoSeed) {
      console.log(`Questions table is empty (count=${count}). Auto-seeding questions...`);
      await seedQuestionsBatch(ALL_RAW_QUESTIONS);
      count = await getQuestionsCount();
    }

    const all = await getAllQuestions();

    // Group subjects and topics for frontend selector
    const subjectsMap: Record<string, Set<string>> = {};
    for (const q of all) {
      if (!subjectsMap[q.subject]) {
        subjectsMap[q.subject] = new Set<string>();
      }
      subjectsMap[q.subject].add(q.topic);
    }

    const subjectsSummary = Object.keys(subjectsMap).map((materia) => ({
      materia,
      assuntos: Array.from(subjectsMap[materia]),
    }));

    return NextResponse.json({
      success: true,
      totalCount: count,
      subjects: subjectsSummary,
      questions: all,
    });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    // Graceful fallback to static questions if database connection fails temporarily
    return NextResponse.json({
      success: true,
      fromFallback: true,
      totalCount: ALL_RAW_QUESTIONS.length,
      questions: ALL_RAW_QUESTIONS.map((q) => ({
        id: q.id,
        category: q.categoria,
        subject: q.materia,
        topic: q.assunto,
        position: q.cargo,
        year: q.ano ? String(q.ano) : null,
        banca: q.banca,
        concurso: q.concurso,
        statement: q.enunciado,
        image: q.imagem,
        options: q.alternativas,
        correctOptionIndex: q.resposta_correta,
        explanation: q.explicacao,
      })),
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const itemsToSeed = body.questions || ALL_RAW_QUESTIONS;
    const inserted = await seedQuestionsBatch(itemsToSeed);
    const total = await getQuestionsCount();

    return NextResponse.json({
      success: true,
      insertedCount: inserted,
      totalInDatabase: total,
    });
  } catch (error: any) {
    console.error('Error seeding questions:', error);
    return NextResponse.json(
      { error: 'Falha ao semear questões no banco', details: error.message },
      { status: 500 }
    );
  }
}
