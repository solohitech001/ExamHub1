'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { DB } from './types';
import { seed } from './seed';

const KEY = 'examhub:next:v1';
interface Ctx { db: DB | null; update: <T>(fn: (d: DB) => T) => T; reset: () => void; toast: (m: string, bad?: boolean) => void; toasts: { id: number; m: string; bad: boolean }[]; saving: boolean }
const C = createContext<Ctx | null>(null);
export const useStore = () => { const c = useContext(C); if (!c) throw new Error('StoreProvider missing'); return c };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB | null>(null);
  const [toasts, setToasts] = useState<Ctx['toasts']>([]);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const ref = useRef<DB | null>(null);
  useEffect(() => { // hydrate on the client only, avoids server/client mismatch
    try { const raw = localStorage.getItem(KEY); const d = raw ? (JSON.parse(raw) as DB) : seed(); ref.current = d; setDb(d); } catch { const d = seed(); ref.current = d; setDb(d); }
  }, []);
  useEffect(() => {
    if (!db) return;
    setSaving(true); clearTimeout(timer.current);
    timer.current = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} setSaving(false); }, 350);
  }, [db]);
  // Applies fn to a clone of the latest db synchronously, so callers can use fn's return value.
  const update = useCallback(<T,>(fn: (d: DB) => T): T => { const n = structuredClone(ref.current as DB); const r = fn(n); ref.current = n; setDb(n); return r; }, []);
  const reset = useCallback(() => { const d = seed(); ref.current = d; setDb(d); }, []);
  const toast = useCallback((m: string, bad = false) => { const id = Date.now() + Math.random(); setToasts((t) => [...t, { id, m, bad }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200); }, []);
  return <C.Provider value={{ db, update, reset, toast, toasts, saving }}>{children}</C.Provider>;
}
