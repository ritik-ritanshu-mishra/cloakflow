import { useEffect, useState } from 'react';
import { AuditLogEntry } from '../types';
import { Database, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface AuditTableProps {
  refreshKey: number;
}

export function AuditTable({ refreshKey }: AuditTableProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/logs');
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading logs');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [refreshKey]);

  const formatTarget = (target: string) => {
    return target.replace('_DATABASE', '').replace('_', ' ');
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Clock className="h-5 w-5 text-cyan-400" />
        <h2 className="text-md font-semibold text-white">Recent Audit Logs</h2>
      </div>

      <div className="overflow-x-auto w-full">
        {loading && logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading audit logs...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No feedback logs found.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-800/50 text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Request ID</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Sentiment</th>
                <th className="px-5 py-3.5">Routing Target</th>
                <th className="px-5 py-3.5">PII Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 bg-slate-950/20">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400 select-all">
                    {log.id}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-5 py-3.5">
                    {log.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="h-3 w-3" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {log.sentiment === 'POSITIVE' && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium">
                        Positive
                      </span>
                    )}
                    {log.sentiment === 'NEGATIVE' && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium">
                        Negative
                      </span>
                    )}
                    {log.sentiment === 'NEUTRAL' && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 text-xs font-medium">
                        Neutral
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                      <Database className="h-3.5 w-3.5 text-slate-500" />
                      <span className="capitalize">{formatTarget(log.routingResult)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {log.detectedEntities.length > 0 ? (
                        log.detectedEntities.map((entity, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider"
                          >
                            <ShieldCheck className="h-2.5 w-2.5" />
                            {entity}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
