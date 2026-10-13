'use client';
import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { scoreAttempt, percent } from '@/lib/engine';
import { resClass, rowOf, type ResultRow } from '@/lib/rows';

const Loading = () => <div className="empty">Loading…</div>;
const csv = (rows: (string | number)[][]) => rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');

export function TeacherResults() {
  const { db, update, toast } = useStore();
  const [q, setQ] = useState('');
  const [gradeId, setGradeId] = useState<string | null>(null);
  const rows = useMemo(() => (db ? db.attempts.map((a) => rowOf(db, a)).filter((r): r is ResultRow => r !== null) : []), [db]);
  if (!db) return <Loading />;
  const shown = rows.filter((r) => !q || Object.values(r).some((v) => String(v).toLowerCase().includes(q.toLowerCase())));
  const done = rows.filter((r) => r.res !== 'Pending');
  const avg = done.length ? Math.round(done.reduce((s, r) => s + r.pct, 0) / done.length) : 0;
  const exportCsv = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv([['Student', 'ID', 'Exam', 'Score', 'Max', 'Percent', 'Grade', 'Result', 'Date'], ...rows.map((r) => [r.student, r.sid, r.exam, r.score, r.max, r.pct < 0 ? '' : r.pct, r.grade, r.res, r.date])])], { type: 'text/csv' }));
    a.download = 'results.csv'; a.click(); toast('CSV exported');
  };
  return (
    <>
      <div className="row sb" style={{ marginBottom: 16 }}><div><h1>Results & grading</h1><span className="mut">Figures are calculated from submissions.</span></div><button onClick={exportCsv}>Export CSV</button></div>
      <div className="grid">
        <div className="card stat"><span className="mut">Submissions</span><b>{rows.length}</b></div>
        <div className="card stat"><span className="mut">Average</span><b>{avg}%</b></div>
        <div className="card stat"><span className="mut">Pass rate</span><b>{done.length ? Math.round((done.filter((r) => r.res === 'Pass').length / done.length) * 100) + '%' : '—'}</b></div>
        <div className="card stat"><span className="mut">Pending grading</span><b>{rows.length - done.length}</b></div>
      </div>
      <div className="card">
        <input placeholder="Search…" aria-label="Search results" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 260, marginBottom: 10 }} />
        <div className="wrap"><table><thead><tr><th>Student</th><th>ID</th><th>Exam</th><th>Score</th><th>%</th><th>Grade</th><th>Result</th><th>Submitted</th><th /></tr></thead>
          <tbody>{shown.map((r) => <tr key={r.id}><td>{r.student}</td><td>{r.sid}</td><td>{r.exam}</td><td>{r.score}/{r.max}</td><td>{r.pct < 0 ? '—' : r.pct + '%'}</td><td>{r.grade}</td><td><span className={'tag ' + resClass(r.res)}>{r.res}</span></td><td>{r.date}</td>
            <td>{r.res === 'Pending' && <button className="s p" onClick={() => setGradeId(r.id)}>Grade</button>}</td></tr>)}
            {!shown.length && <tr><td colSpan={9} className="empty">No matching records.</td></tr>}</tbody></table></div>
      </div>
      {gradeId && <GradeModal id={gradeId} onClose={() => setGradeId(null)} update={update} toast={toast} />}
    </>
  );
}

function GradeModal({ id, onClose, update, toast }: { id: string; onClose: () => void; update: ReturnType<typeof useStore>['update']; toast: (m: string, bad?: boolean) => void }) {
  const { db } = useStore();
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [fb, setFb] = useState('');
  const a = db?.attempts.find((x) => x.id === id), e = db?.exams.find((x) => x.id === a?.examId);
  if (!db || !a || !e) return null;
  const essays = e.qs.filter((q) => q.type === 'essay');
  const save = () => {
    const m: Record<string, number> = {};
    for (const q of essays) { const v = parseFloat(marks[q.id] ?? ''); if (Number.isNaN(v) || v < 0 || v > q.m) return toast('Enter a valid mark for every essay.', true); m[q.id] = v; }
    update((d) => {
      const at = d.attempts.find((x) => x.id === id)!, ex = d.exams.find((x) => x.id === at.examId)!;
      const r = scoreAttempt(ex, at.answers, m);
      at.manual = m; at.score = r.score; at.pending = r.pending; at.feedback = fb.trim();
      d.logs.unshift({ t: Date.now(), who: 'teacher', a: `Graded essays: ${ex.title} (${r.score}/${percent(r.score, ex)}%)` });
    });
    toast('Result finalised'); onClose();
  };
  return (
    <div className="modal" role="dialog" aria-modal="true"><div className="card">
      <h2>Grade essays — {db.students.find((s) => s.id === a.studentId)?.name}</h2>
      <p className="mut">Auto-marked score so far: {a.score}. Pass mark is {e.pass}%.</p>
      {essays.map((q) => (
        <div className="card" key={q.id}><b>{q.t}</b><p>{String(a.answers[q.id] ?? '(no answer submitted)')}</p>
          <label>Marks (0–{q.m})<input type="number" min={0} max={q.m} step={0.5} value={marks[q.id] ?? ''} onChange={(ev) => setMarks({ ...marks, [q.id]: ev.target.value })} /></label></div>
      ))}
      <label>Feedback<textarea rows={2} value={fb} onChange={(ev) => setFb(ev.target.value)} /></label>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={onClose}>Cancel</button><button className="p" onClick={save}>Save & finalise</button></div>
    </div></div>
  );
}

export function TeacherExams() {
  const { db, update, toast } = useStore();
  if (!db) return <Loading />;
  const toggle = (id: string) => {
    const err = update((d) => { const e = d.exams.find((x) => x.id === id)!; if (e.status !== 'published' && !e.qs.length) return 'Add questions before publishing.'; e.status = e.status === 'published' ? 'draft' : 'published'; return null; });
    if (err) toast(err, true); else toast('Exam updated');
  };
  return (
    <>
      <h1>Examinations</h1>
      <div className="card wrap"><table><thead><tr><th>Title</th><th>Subject</th><th>Class</th><th>Questions</th><th>Mins</th><th>Status</th><th /></tr></thead>
        <tbody>{db.exams.map((e) => <tr key={e.id}><td>{e.title}</td><td>{e.subject}</td><td>{e.cls}</td><td>{e.qs.length}</td><td>{e.dur}</td><td><span className={'tag ' + (e.status === 'published' ? 'ok' : 'w')}>{e.status}</span></td><td><button className="s" onClick={() => toggle(e.id)}>{e.status === 'published' ? 'Unpublish' : 'Publish'}</button></td></tr>)}</tbody></table></div>
      <p className="mut">The exam builder and question bank from the HTML prototype are the next phase to port.</p>
    </>
  );
}
