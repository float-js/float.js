import type { ReactNode } from 'react';
import type { Metadata } from '@float/core';

export const metadata: Metadata = {
  title: {
    default: 'test-welcome-screen',
    template: '%s | test-welcome-screen',
  },
  description: 'Built with Float.js - Ultra Modern Web Framework',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
