'use client';

import { useEffect, useState } from 'react';

interface StatData {
  total_opens: number;
  unique_ids: number;
  most_active: { user: string; count: number } | null;
  latest_open: { user: string; timestamp: string } | null;
  top_users: [string, number][];
  log: { user: string; timestamp: string }[];
}

export default function useStats() {
  const [data, setData] = useState<StatData | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';
    fetch(`${apiUrl}/stats`)
      .then(async (res) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (err) {
          console.error('❌ JSON parse error in useStats:', text);
          throw err;
        }
      })
      .then((json: StatData) => {
        setData(json);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch stats:', err);
        setData(null);
      });
  }, []);

  return data;
}
