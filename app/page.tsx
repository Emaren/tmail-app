'use client';

import { useEffect, useState } from 'react';
import useStats from '@/hooks/useStats';
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PlaceholderChart from "@/components/dashboard/PlaceholderChart";
import PlaceholderTable from "@/components/dashboard/PlaceholderTable";
import OpensPerUserChart from "@/components/dashboard/OpensPerUserChart";

export default function DashboardPage() {
  const [showChat, setShowChat] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof useStats>>();

  // ⏱ Poll every 10s to keep stats fresh
  useEffect(() => {
    async function fetchStats() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';
      const res = await fetch(`${apiUrl}/stats`);
      const json = await res.json();
      setStats(json);
    }

    fetchStats(); // Initial load

    const interval = setInterval(fetchStats, 10000); // Refresh every 10s
    return () => clearInterval(interval); // Cleanup
  }, []);

  const topUserData = (() => {
    try {
      if (Array.isArray(stats?.top_users)) {
        return stats.top_users
          .filter(t => Array.isArray(t) && t.length === 2)
          .map(([id, count]) => ({ id, count }));
      }
    } catch (err) {
      console.error("Failed to process top_users:", err);
    }
    return [];
  })();

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
        <StatCard title="Total Opens" value={String(stats?.total_opens ?? "—")} />
        <StatCard title="Unique IDs" value={String(stats?.unique_ids ?? "—")} />
        <StatCard
          title="Most Active ID"
          value={stats?.most_active?.user ?? "—"}
          subtext={`${stats?.most_active?.count ?? "—"} opens`}
        />
        <StatCard
          title="Latest Open"
          value={stats?.latest_open?.user ?? "—"}
          subtext={stats?.latest_open?.timestamp?.slice(0, 19).replace("T", " ") ?? "—"}
        />
      </section>

      {/* ── CHARTS SECTION ───────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ChartCard title="Opens per User (Top 10)">
          <OpensPerUserChart data={topUserData} />
        </ChartCard>
        <ChartCard title="Opens Over Time (Last 7d)">
          <PlaceholderChart />
        </ChartCard>
      </section>

      {/* ── LOG TABLE ────────────────────────────────── */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-pink-400">📊 Recent Open Logs</h2>

        {stats?.log?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-white border-opacity-20 text-white/80 text-sm">
              <thead className="bg-white bg-opacity-10">
                <tr>
                  <th className="py-2 px-4">User</th>
                  <th className="py-2 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.log.map((entry, index) => (
                  <tr key={index} className="border-t border-white border-opacity-10">
                    <td className="py-2 px-4">{entry.user}</td>
                    <td className="py-2 px-4">{entry.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No log data available.</p>
        )}
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
