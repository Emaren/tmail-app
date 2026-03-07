'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function OpensPerUserChart({ data }: { data: { id: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: -12, right: 12, top: 12, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="id" stroke="rgba(226,232,240,0.65)" tickLine={false} axisLine={false} />
        <YAxis stroke="rgba(226,232,240,0.65)" tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          contentStyle={{
            background: 'rgba(5, 8, 17, 0.92)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            color: '#fff',
          }}
        />
        <Bar dataKey="count" radius={[12, 12, 4, 4]} fill="url(#topUsersGradient)" />
        <defs>
          <linearGradient id="topUsersGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.95} />
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.35} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
