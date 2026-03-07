import { ReactNode } from 'react';
import Panel from '@/components/shell/Panel';

export default function ChartCard({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) {
  return (
    <Panel title={title} kicker={kicker} className="h-full">
      {children}
    </Panel>
  );
}
