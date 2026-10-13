import type { Answer, DB, Exam, Question } from './types';

export const ME = 'S001';
export const uid = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
export const maxMarks = (e: Exam) => e.qs.reduce((s, q) => s + q.m, 0);
export const grade = (p: number) => (p >= 70 ? 'A' : p >= 60 ? 'B' : p >= 50 ? 'C' : p >= 45 ? 'D' : 'F');
export const percent = (score: number, e: Exam) => Math.round((score / maxMarks(e)) * 100);
const norm = (s: unknown) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
export const hasAnswer = (a: Answer | undefined): a is Answer => a !== undefined && a !== '' && !(Array.isArray(a) && a.length === 0);

export function isCorrect(q: Question, a: Answer): boolean {
  if (q.type === 'multi') return JSON.stringify([...(a as number[])].sort()) === JSON.stringify([...(q.ans as number[])].sort());
  if (q.type === 'blank' || q.type === 'short') return norm(a) === norm(q.ans);
  return a === q.ans;
}

/** Rules: single/tf/fill/short = full marks if correct; multi = all-or-nothing;
 *  negative marking (if on) = -25% of a wrong answered objective question; essays need manual marks. */
export function scoreAttempt(e: Exam, answers: Record<string, Answer>, manual: Record<string, number> = {}) {
  let s = 0, pending = false;
  for (const q of e.qs) {
    const a = answers[q.id];
    if (q.type === 'essay') { if (manual[q.id] !== undefined) s += manual[q.id]; else pending = true; continue }
    if (!hasAnswer(a)) continue;
    if (isCorrect(q, a)) s += q.m; else if (e.neg) s -= q.m * 0.25;
  }
  return { score: Math.max(0, +s.toFixed(2)), pending };
}

/** Mutates db. Returns an error message or null. */
export function startAttempt(db: DB, examId: string): string | null {
  const e = db.exams.find((x) => x.id === examId);
  if (!e) return 'Exam not found.';
  if (db.active?.examId === examId) return null;
  if (db.active) return 'Finish your active exam first.';
  if (db.attempts.filter((a) => a.examId === examId && a.studentId === ME).length >= e.maxAttempts) return 'Attempt limit reached.';
  const order = e.qs.map((q) => q.id);
  if (e.shuffle) order.sort(() => Math.random() - 0.5);
  const now = Date.now();
  db.active = { examId, start: now, deadline: now + e.dur * 60000, answers: {}, flags: {}, cur: 0, order };
  db.logs.unshift({ t: now, who: 'student', a: 'Exam started: ' + e.title });
  return null;
}

/** Mutates db. Idempotent: does nothing when there is no active attempt (duplicate submits are ignored). */
export function submitActive(db: DB, auto: boolean): string | null {
  const a = db.active;
  if (!a) return null;
  const e = db.exams.find((x) => x.id === a.examId)!;
  const r = scoreAttempt(e, a.answers), id = uid('a');
  db.attempts.push({ id, examId: e.id, studentId: ME, score: r.score, pending: r.pending, at: Date.now(), mins: Math.max(1, Math.round((Math.min(Date.now(), a.deadline) - a.start) / 60000)), feedback: '', answers: a.answers, manual: {} });
  db.active = null;
  db.logs.unshift({ t: Date.now(), who: 'student', a: (auto ? 'Auto-submitted at deadline: ' : 'Submitted: ') + e.title });
  return id;
}
