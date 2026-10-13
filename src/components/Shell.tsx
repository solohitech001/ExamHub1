'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useStore } from '@/lib/store';

const NAV = {
  student: [['/student', 'Dashboard'], ['/student/results', 'My results']],
  teacher: [['/teacher', 'Results & grading'], ['/teacher/exams', 'Examinations']],
} as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { toasts, reset, toast } = useStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => { if (path === '/') return; try { const t = localStorage.getItem('cbt-theme'); if (t === 'dark') setTheme('dark'); } catch {} }, []);
  useEffect(() => { if (path === '/') return; document.documentElement.dataset.theme = theme; try { localStorage.setItem('cbt-theme', theme); } catch {} }, [theme, path]);
  const role = path.startsWith('/student') ? 'student' : path.startsWith('/teacher') ? 'teacher' : null;
  if (path === '/') return <>{children}</>; // the reference app at / manages its own theme, toasts and chrome
  const focus = !role || path === '/student/exam'; // landing page and exam workspace: no chrome
  const toastEls = <div id="toasts" aria-live="polite">{toasts.map((t) => <div key={t.id} className={'toast ' + (t.bad ? 'bad' : '')}>{t.m}</div>)}</div>;
  if (focus || !role) return <>{children}{toastEls}</>;
  return (
    <>
      <div className="app">
        <aside aria-label="Main navigation">
          <div className="logo">🎓 ExamHub</div>
          {NAV[role].map(([href, label]) => (
            <Link key={href} href={href}><button className={path === href ? 'on' : ''}>{label}</button></Link>
          ))}
        </aside>
        <div>
          <header className="top">
            <span className="crumb">{role === 'student' ? 'Student' : 'Teacher'} (demo, no real login)</span><span className="sp" />
            <Link href={role === 'student' ? '/teacher' : '/student'}><button>Switch to {role === 'student' ? 'teacher' : 'student'}</button></Link>
            <button aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button onClick={() => { reset(); toast('Demo data reset'); }}>Reset demo data</button>
          </header>
          <main>{children}</main>
        </div>
      </div>
      {toastEls}
    </>
  );
}
