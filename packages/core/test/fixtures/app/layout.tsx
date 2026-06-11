import type { ReactNode } from 'react';
export const metadata = { title: { default: 'Fixture App' }, description: 'test fixture' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <div className="root-layout">{children}</div>;
}
