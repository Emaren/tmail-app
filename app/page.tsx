'use client';

import { useState } from 'react';
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PlaceholderChart from "@/components/dashboard/PlaceholderChart";
import PlaceholderTable from "@/components/dashboard/PlaceholderTable";
import OpensPerUserChart from "@/components/dashboard/OpensPerUserChart"; // ⬅ add this at top

export default function DashboardPage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <main className="min-h-screen w-full bg-zinc-950 text-zinc-100 px-6 md:px-12 py-16 space-y-20 max-w-[1600px] mx-auto">
      {/* ── HEADER ───────────────────────────────────── */}
      <header className="text-center space-y-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-pink-500 tracking-tight">
          📬 Email Intelligence Dashboard
        </h1>
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
          Track pixel opens, analyze patterns, and gain insights.
        </p>
      </header>

      {/* ── STAT TILE GRID ───────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard title="Total Opens" value="—" />
        <StatCard title="Unique IDs" value="—" />
        <StatCard title="Most Active ID" value="—" subtext="—" />
        <StatCard title="Latest Open" value="—" subtext="—" />
      </section>

      {/* ── CHARTS SECTION ───────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ChartCard title="Opens per User (Top 10)">
          <OpensPerUserChart data={[]} /> {/* temporary empty array */}
        </ChartCard>
        <ChartCard title="Opens Over Time (Last 7d)">
          <PlaceholderChart />
        </ChartCard>
      </section>

      {/* ── LOG TABLE ────────────────────────────────── */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-pink-400">📊 Recent Open Logs</h2>
        <PlaceholderTable />
      </section>

      {/* ── AI CHAT / INSIGHTS ───────────────────────── */}
      <section className="text-center">
        <button
          onClick={() => setShowChat(!showChat)}
          className="px-8 py-3 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-base font-semibold tracking-wide shadow-lg transition-all transform active:scale-95"
        >
          {showChat ? 'Close Agent Chat' : 'Open Agent Chat'}
        </button>

        {showChat && (
          <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-inner max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-3 text-pink-300">🧠 AI Insights Agent</h2>
            <p className="text-gray-500 italic">Coming soon: Ask the AI about your logs...</p>
          </div>
        )}
      </section>
    </main>
  );
}
