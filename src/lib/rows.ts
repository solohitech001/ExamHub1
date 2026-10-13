import type { Attempt, DB } from './types';
import { grade, maxMarks, percent } from './engine';

export interface ResultRow { id: string; student: string; sid: string; exam: string; score: number; max: number; pct: number; grade: string; res: 'Pass' | 'Fail' | 'Pending'; date: string; mins: number }
export function rowOf(db: DB, a: Attempt): ResultRow | null {
  const e = db.exams.find((x) => x.id === a.examId);
  if (!e) return null;
  const p = a.pending ? -1 : percent(a.score, e);
  return { id: a.id, student: db.students.find((s) => s.id === a.studentId)?.name ?? a.studentId, sid: a.studentId, exam: e.title, score: a.score, max: maxMarks(e), pct: p, grade: p < 0 ? '—' : grade(p), res: p < 0 ? 'Pending' : p >= e.pass ? 'Pass' : 'Fail', date: new Date(a.at).toLocaleDateString(), mins: a.mins };
}
export const resClass = (r: ResultRow['res']) => (r === 'Pass' ? 'ok' : r === 'Fail' ? 'bad' : 'w');
