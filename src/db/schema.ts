import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User study progress (streaks, phases, checklist items)
export const studyProgress = pgTable('study_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  currentStreak: integer('current_streak').default(0).notNull(),
  bestStreak: integer('best_streak').default(0).notNull(),
  lastStudyDate: text('last_study_date'),
  phasesCompleted: jsonb('phases_completed').$type<Record<string, boolean>>().default({
    phase1: false,
    phase2: false,
    phase3: false,
    phase4: false,
  }),
  checklistState: jsonb('checklist_state').$type<Record<string, boolean>>().default({}),
  pedagogicalState: jsonb('pedagogical_state').$type<Record<string, boolean>>().default({}),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Questions bank for the concursos and simulados
export const questions = pgTable('questions', {
  id: integer('id').primaryKey(), // Original question id
  category: text('category'),
  subject: text('subject').notNull(), // Materia: Portugues, Matematica, etc.
  topic: text('topic').notNull(), // Assunto
  position: text('position'), // Cargo
  year: text('year'),
  banca: text('banca'),
  concurso: text('concurso'),
  statement: text('statement').notNull(), // Enunciado
  image: text('image'),
  options: jsonb('options').$type<string[]>().notNull(), // Alternativas
  correctOptionIndex: integer('correct_option_index').notNull(), // 0-based index
  explanation: text('explanation'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Simulation sessions history
export const simulationSessions = pgTable('simulation_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  mode: text('mode').notNull(), // 'livre', 'cronometrado'
  subject: text('subject'),
  topics: jsonb('topics').$type<string[]>(),
  totalQuestions: integer('total_questions').notNull(),
  score: integer('score').notNull(),
  durationSeconds: integer('duration_seconds').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Individual question attempts
export const questionAnswers = pgTable('question_answers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  questionId: integer('question_id')
    .references(() => questions.id)
    .notNull(),
  selectedOption: integer('selected_option').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  sessionId: integer('session_id').references(() => simulationSessions.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  progress: one(studyProgress, {
    fields: [users.id],
    references: [studyProgress.userId],
  }),
  sessions: many(simulationSessions),
  answers: many(questionAnswers),
}));

export const studyProgressRelations = relations(studyProgress, ({ one }) => ({
  user: one(users, {
    fields: [studyProgress.userId],
    references: [users.id],
  }),
}));

export const simulationSessionsRelations = relations(simulationSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [simulationSessions.userId],
    references: [users.id],
  }),
  answers: many(questionAnswers),
}));

export const questionAnswersRelations = relations(questionAnswers, ({ one }) => ({
  user: one(users, {
    fields: [questionAnswers.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [questionAnswers.questionId],
    references: [questions.id],
  }),
  session: one(simulationSessions, {
    fields: [questionAnswers.sessionId],
    references: [simulationSessions.id],
  }),
}));
