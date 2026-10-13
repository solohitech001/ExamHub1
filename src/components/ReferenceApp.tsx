'use client';
import { useEffect } from 'react';

declare global {
  interface Window { __examhubLoading?: boolean; __examhubBooted?: boolean }
}

/**
 * Mounts the supplied reference app unchanged. The markup below is the reference's <body> markup and
 * /examhub-reference.js is the reference's <script> content, byte for byte. The script is a classic
 * script that owns #root and #toasts, so it can only run once per page load.
 */
export function ReferenceApp() {
  useEffect(() => {
    if (window.__examhubBooted) { window.location.reload(); return; } // came back via client-side navigation
    if (window.__examhubLoading) return; // React StrictMode runs effects twice in development
    window.__examhubLoading = true;
    const s = document.createElement('script');
    s.src = '/examhub-reference.js';
    s.onload = () => { window.__examhubBooted = true; };
    document.body.appendChild(s);
  }, []);
  return (
    <>
      <div id="root"></div>
      <div id="toasts" aria-live="polite"></div>
    </>
  );
}
