'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 p-6 space-y-10">
      {/* ── HEADER ───────────────────────────────────── */}
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-pink-500">📬 Email Intelligence Dashboard</h1>
        <p className="text-gray-400 text-lg">Track pixel opens, analyze patterns, and gain insights.</p>
      </header>

      {/* ── STAT TILE GRID ───────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Opens" value="—" />
        <StatCard title="Unique IDs" value="—" />
        <StatCard title="Most Active ID" value="—" subtext="—" />
        <StatCard title="Latest Open" value="—" subtext="—" />
      </section>

      {/* ── CHARTS SECTION ───────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Opens per User (Top 10)">
          {/* <OpensPerUserChart data={...} /> */}
          <PlaceholderChart />
        </ChartCard>
        <ChartCard title="Opens Over Time (Last 7d)">
          {/* <OpensOverTimeChart data={...} /> */}
          <PlaceholderChart />
        </ChartCard>
      </section>

      {/* ── LOG TABLE ────────────────────────────────── */}
      <section className="bg-zinc-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Recent Open Logs</h2>
        {/* <LogTable data={...} /> */}
        <PlaceholderTable />
      </section>

      {/* ── AI CHAT / INSIGHTS ───────────────────────── */}
      <section>
        <button
          onClick={() => setShowChat(!showChat)}
          className="px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-500 text-white shadow"
        >
          {showChat ? 'Close Agent Chat' : 'Open Agent Chat'}
        </button>

        {showChat && (
          <div className="mt-6 bg-zinc-800 rounded-xl p-6 shadow-inner">
            <h2 className="text-xl font-semibold mb-2">🧠 AI Insights Agent</h2>
            {/* <AgentChat /> */}
            <p className="text-gray-400 italic">Coming soon: Ask the AI about your logs...</p>
          </div>
        )}
      </section>
    </main>
  );
}

/* ── COMPONENT STUBS ───────────────────────────── */

function StatCard({ title, value, subtext }: { title: string; value: string; subtext?: string }) {
  return (
    <div className="bg-zinc-800 p-6 rounded-xl shadow text-center">
      <h3 className="text-lg font-semibold text-gray-300 mb-1">{title}</h3>
      <div className="text-3xl font-bold text-white">{value}</div>
      {subtext && <div className="text-sm text-gray-500 mt-1">{subtext}</div>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-800 p-6 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function PlaceholderChart() {
  return (
    <div className="h-40 bg-zinc-700 rounded-lg flex items-center justify-center text-gray-500 italic">
      Chart Placeholder
    </div>
  );
}

function PlaceholderTable() {
  return (
    <div className="h-48 bg-zinc-700 rounded-lg flex items-center justify-center text-gray-500 italic">
      Table Placeholder
    </div>
  );
}
