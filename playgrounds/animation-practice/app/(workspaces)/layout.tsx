'use client';

import { Leva } from 'leva';
import { HEIGHT_OF_TOP_BAR } from '../_components/TopBar';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Leva titleBar={{ position: { x: 0, y: HEIGHT_OF_TOP_BAR } }} />
      {children}
    </>
  );
}
