import { useEffect, useState } from 'react';
import { Activity, Shield, Smile, Frown, Meh, Percent } from 'lucide-react';

interface Stats {
  totalRequests: number;
  totalSanitized: number;
  positiveFeedback: number;
  negativeFeedback: number;
  neutralFeedback: number;
  averageConfidenceScore: number;
}

interface StatsGridProps {
  refreshKey: number;
}

export function StatsGrid({ refreshKey }: StatsGridProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/stats');
        if (!res.ok) throw new Error('Failed to fetch statistics');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [refreshKey]);

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-900 rounded-xl border border-slate-800/80"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm">
        {error}
      </div>
    );
  }

  const items = [
    {
      title: 'Total Scans',
      value: stats?.totalRequests || 0,
      icon: Activity,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      title: 'PII Sanitized',
      value: stats?.totalSanitized || 0,
      icon: Shield,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      title: 'Positive',
      value: stats?.positiveFeedback || 0,
      icon: Smile,
      color: 'text-cyan-400 bg-cyan-500/10',
    },
    {
      title: 'Negative',
      value: stats?.negativeFeedback || 0,
      icon: Frown,
      color: 'text-rose-400 bg-rose-500/10',
    },
    {
      title: 'Neutral',
      value: stats?.neutralFeedback || 0,
      icon: Meh,
      color: 'text-slate-400 bg-slate-500/10',
    },
    {
      title: 'Avg Confidence',
      value: `${((stats?.averageConfidenceScore || 0) * 100).toFixed(0)}%`,
      icon: Percent,
      color: 'text-violet-400 bg-violet-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="p-4 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800/60 flex flex-col justify-between hover:border-slate-700 transition-all duration-300 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {item.title}
            </span>
            <div className={`p-1.5 rounded-lg ${item.color}`}>
              <item.icon className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2.5xl font-bold tracking-tight text-white">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
