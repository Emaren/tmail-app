'use client';

export default function StatCard({ title, value, subtext }: { title: string; value: string; subtext?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg text-center space-y-2 transition hover:scale-[1.02] hover:border-pink-600 duration-200">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest">{title}</h3>
      <div className="text-4xl font-bold text-white">{value}</div>
      {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
    </div>
  );
}
