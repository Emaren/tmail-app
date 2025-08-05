'use client';

export default function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg space-y-4">
      <h3 className="text-xl font-semibold text-gray-300">{title}</h3>
      {children}
    </div>
  );
}
