export type QType = 'single' | 'multi' | 'tf' | 'blank' | 'short' | 'essay';
export type Answer = number | number[] | string;
export interface Question { id: string; type: QType; t: string; opts?: string[]; ans?: Answer; m: number; diff?: string; topic?: string; exp?: string; subject?: string }
export interface Exam { id: string; title: string; subject: string; cls: string; type: string; desc: string; inst: string; dur: number; pass: number; maxAttempts: number; neg: boolean; show: boolean; shuffle: boolean; status: 'draft' | 'published'; qs: Question[] }
export interface Attempt { id: string; examId: string; studentId: string; score: number; pending: boolean; at: number; mins: number; feedback: string; answers: Record<string, Answer>; manual: Record<string, number> }
export interface Active { examId: string; start: number; deadline: number; answers: Record<string, Answer>; flags: Record<string, 1>; cur: number; order: string[] }
export interface Person { id: string; name: string; email: string; cls?: string; subject?: string }
export interface DB { exams: Exam[]; students: Person[]; teachers: Person[]; subjects: string[]; schools: { id: string; name: string; plan: string; students: number; status: string }[]; attempts: Attempt[]; bank: Question[]; notes: string[]; logs: { t: number; who: string; a: string }[]; active: Active | null }
