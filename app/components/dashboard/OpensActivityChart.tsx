'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function OpensActivityChart({ data }: { data: { date: string; opens: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: -12, right: 10, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" stroke="rgba(226,232,240,0.65)" tickLine={false} axisLine={false} />
        <YAxis stroke="rgba(226,232,240,0.65)" tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ stroke: 'rgba(245, 158, 11, 0.4)', strokeWidth: 1 }}
          contentStyle={{
            background: 'rgba(5, 8, 17, 0.92)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            color: '#fff',
          }}
        />
        <Area type="monotone" dataKey="opens" stroke="#f59e0b" strokeWidth={2.4} fill="url(#activityFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
