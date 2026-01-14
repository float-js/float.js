import type { ReactNode } from 'react';
import type { Metadata } from '@float/core';

export const metadata: Metadata = {
  title: {
    default: 'Float.js',
    template: '%s | Float.js',
  },
  description: 'Built with Float.js - Ultra Modern Web Framework',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%236366f1'/><stop offset='100%25' stop-color='%23d946ef'/></linearGradient></defs><circle cx='16' cy='16' r='14' fill='url(%23g)'/></svg>",
  },
};

// Float.js Layout - Only wraps content, framework handles HTML document
export default function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
