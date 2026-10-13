'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { ME, hasAnswer, startAttempt, submitActive } from '@/lib/engine';
import { resClass, rowOf } from '@/lib/rows';
import type { Answer } from '@/lib/types';

const Loading = () => <div className="empty">Loading…</div>;

export function StudentHome() {
  const { db, update, toast } = useStore();
  const router = useRouter();
  if (!db) return <Loading />;
  const mine = db.attempts.filter((a) => a.studentId === ME);
  const start = (id: string) => {
    const err = update((d) => startAttempt(d, id));
    if (err) toast(err, true); else router.push('/student/exam');
  };
  return (
    <>
      <h1>Welcome, Ada</h1><p className="mut">Your examinations.</p>
      <div className="grid"><div className="card stat"><span className="mut">Completed</span><b>{mine.length}</b></div><div className="card stat"><span className="mut">Awaiting grading</span><b>{mine.filter((a) => a.pending).length}</b></div></div>
      <div className="grid">
        {db.exams.filter((e) => e.status === 'published').map((e) => {
          const used = mine.filter((a) => a.examId === e.id).length, active = db.active?.examId === e.id;
          return (
            <div className="card" key={e.id}>
              <b>{e.title}</b>
              <p className="mut">{e.subject} · {e.qs.length} questions · {e.dur} min · pass {e.pass}%<br />Attempts used {used}/{e.maxAttempts}</p>
              <p>{e.inst}</p>
              <button className="p" disabled={!active && used >= e.maxAttempts} onClick={() => start(e.id)}>{active ? 'Resume' : used >= e.maxAttempts ? 'Attempts used' : 'Start exam'}</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function useOnline() {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(navigator.onLine); const u = () => setOn(true), d = () => setOn(false); window.addEventListener('online', u); window.addEventListener('offline', d); return () => { window.removeEventListener('online', u); window.removeEventListener('offline', d); }; }, []);
  return on;
}

export function Workspace() {
  const { db, update, toast, saving } = useStore();
  const router = useRouter();
  const online = useOnline();
  const [left, setLeft] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const deadline = db?.active?.deadline;

  useEffect(() => { // the deadline is stored with the attempt, so refreshes never reset the timer
    if (!deadline) return;
    const tick = () => {
      const l = deadline - Date.now(); setLeft(l);
      if (l <= 0) { update((d) => submitActive(d, true)); toast('Time is up. Your exam was submitted.'); router.replace('/student/results'); }
    };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [deadline, update, toast, router]);

  if (!db) return <Loading />;
  const a = db.active;
  if (!a) return <div className="card empty">No active exam. <Link href="/student">Back to dashboard</Link></div>;
  const e = db.exams.find((x) => x.id === a.examId)!;
  const qs = a.order.map((id) => e.qs.find((q) => q.id === id)!);
  const q = qs[a.cur], n = qs.length, ans = a.answers[q.id];
  const setAns = (v: Answer | undefined) => update((d) => { const x = d.active!; if (hasAnswer(v)) x.answers[q.id] = v; else delete x.answers[q.id]; });
  const jump = (i: number) => update((d) => { d.active!.cur = Math.max(0, Math.min(n - 1, i)); });
  const flag = () => update((d) => { const f = d.active!.flags; if (f[q.id]) delete f[q.id]; else f[q.id] = 1; });
  const answered = qs.filter((x) => hasAnswer(a.answers[x.id])).length, flagged = qs.filter((x) => a.flags[x.id]).length;
  const mm = left === null ? '--' : String(Math.max(0, Math.floor(left / 60000))).padStart(2, '0'), ss = left === null ? '--' : String(Math.max(0, Math.floor(left / 1000) % 60)).padStart(2, '0');
  const submit = () => { update((d) => submitActive(d, false)); router.push('/student/results'); };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <div className="card row"><div><b>{e.title}</b><br /><span className="mut">{e.subject}</span></div><span style={{ flex: 1 }} />
        <span className="mut" aria-live="polite">{saving ? 'Saving…' : 'Saved ✓'}</span>
        <span className={'tag ' + (online ? 'ok' : 'bad')}>{online ? 'Online' : 'Offline (kept locally)'}</span>
        <span className={'tm ' + (left !== null && left < 60000 ? 'low' : '')} role="timer">{mm}:{ss}</span></div>
      <div className="prog"><i style={{ width: `${((a.cur + 1) / n) * 100}%` }} /></div>
      <div className="xw">
        <div className="card">
          <p className="mut">Question {a.cur + 1} of {n} · {q.m} mark{q.m > 1 ? 's' : ''}</p>
          <h2>{q.t}</h2>
          {(q.type === 'single' || q.type === 'tf') && q.opts?.map((o, i) => <label className="opt" key={i}><input type="radio" name="o" checked={ans === i} onChange={() => setAns(i)} /> {o}</label>)}
          {q.type === 'multi' && <><p className="mut">Select all that apply.</p>{q.opts?.map((o, i) => { const cur = (ans as number[] | undefined) ?? []; return <label className="opt" key={i}><input type="checkbox" checked={cur.includes(i)} onChange={() => setAns(cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i])} /> {o}</label>; })}</>}
          {(q.type === 'blank' || q.type === 'short') && <input aria-label="Your answer" value={(ans as string | undefined) ?? ''} onChange={(ev) => setAns(ev.target.value)} />}
          {q.type === 'essay' && <textarea rows={9} aria-label="Your answer" value={(ans as string | undefined) ?? ''} onChange={(ev) => setAns(ev.target.value)} />}
          <div className="row" style={{ marginTop: 14 }}>
            <button disabled={a.cur === 0} onClick={() => jump(a.cur - 1)}>← Previous</button><button disabled={a.cur === n - 1} onClick={() => jump(a.cur + 1)}>Next →</button>
            <button onClick={flag}>{a.flags[q.id] ? 'Unflag' : '⚑ Mark for review'}</button><span style={{ flex: 1 }} /><button className="p" onClick={() => setConfirm(true)}>Submit exam</button>
          </div>
        </div>
        <div className="card"><b>Questions</b>
          <div className="pal" style={{ marginTop: 8 }}>{qs.map((x, i) => <button key={x.id} aria-label={`Question ${i + 1}`} className={`${a.flags[x.id] ? 'f' : hasAnswer(a.answers[x.id]) ? 'a' : ''} ${i === a.cur ? 'c' : ''}`} onClick={() => jump(i)}>{i + 1}</button>)}</div>
          <p className="mut" style={{ fontSize: '.8rem' }}>Green answered · Amber flagged · Ring = current</p></div>
      </div>
      {confirm && (
        <div className="modal" role="dialog" aria-modal="true"><div className="card">
          <h2>Submit examination?</h2><p>Answered <b>{answered}</b> · Unanswered <b>{n - answered}</b> · Flagged <b>{flagged}</b></p><p className="mut">Submission is final.</p>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button onClick={() => setConfirm(false)}>Keep working</button><button className="p" onClick={submit}>Submit now</button></div>
        </div></div>
      )}
    </div>
  );
}

export function StudentResults() {
  const { db } = useStore();
  if (!db) return <Loading />;
  const rows = db.attempts.filter((a) => a.studentId === ME).map((a) => rowOf(db, a)).filter((r) => r !== null).reverse();
  return (
    <>
      <h1>My results</h1>
      <div className="card wrap"><table><thead><tr><th>Exam</th><th>Score</th><th>%</th><th>Grade</th><th>Result</th><th>Submitted</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}><td>{r.exam}</td><td>{r.score}/{r.max}</td><td>{r.pct < 0 ? '—' : r.pct + '%'}</td><td>{r.grade}</td><td><span className={'tag ' + resClass(r.res)}>{r.res === 'Pending' ? 'Awaiting teacher grading' : r.res}</span></td><td>{r.date}</td></tr>)}
          {!rows.length && <tr><td colSpan={6} className="empty">No results yet.</td></tr>}</tbody></table></div>
    </>
  );
}
