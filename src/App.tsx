import { useState } from 'react';
import { Shield } from 'lucide-react';
import { AnalyzerForm } from './components/AnalyzerForm';
import { StatsGrid } from './components/StatsGrid';
import { AuditTable } from './components/AuditTable';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    // Incrementing key forces StatsGrid and AuditTable components to re-fetch
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Premium Gradient Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 py-4.5 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-600/10 border border-cyan-500/25 flex items-center justify-center">
            <Shield className="h-5.5 w-5.5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              CloakFlow
              <span className="text-[10px] font-mono font-normal tracking-wide px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-500 tracking-wide mt-0.5">
              Secure Feedback Redaction & Routing Portal
            </p>
          </div>
        </div>
      </header>

      {/* Main Panel grid layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6 select-text">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form container */}
          <div className="lg:col-span-5 w-full">
            <AnalyzerForm onSuccess={handleRefresh} />
          </div>

          {/* Statistics grid panel */}
          <div className="lg:col-span-7 w-full flex flex-col gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                Scan Performance Statistics
              </h2>
              <StatsGrid refreshKey={refreshKey} />
            </div>
          </div>
        </div>

        {/* Audit Logs list table */}
        <div className="w-full mt-2">
          <AuditTable refreshKey={refreshKey} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900/60 text-center text-xs text-slate-600">
        <p>© 2026 CloakFlow. Built in Planning Mode.</p>
      </footer>
    </div>
  );
}
export { App };
