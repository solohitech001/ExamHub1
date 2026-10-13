import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { StoreProvider } from '@/lib/store';
import { Shell } from '@/components/Shell';

export const metadata: Metadata = { title: 'ExamHub CBT', description: 'Computer-based testing platform (demo)' };

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body><StoreProvider><Shell>{children}</Shell></StoreProvider></body>
    </html>
  );
}
