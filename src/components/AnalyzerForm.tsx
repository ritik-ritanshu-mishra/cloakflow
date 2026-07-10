import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Database, Award, Clipboard, Check } from 'lucide-react';
import { FeedbackAnalysisResponse } from '../types';

interface AnalyzerFormProps {
  onSuccess: () => void;
}

export function AnalyzerForm({ onSuccess }: AnalyzerFormProps) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FeedbackAnalysisResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle validation errors from Express app
        if (data.error === 'Validation Error' && data.issues) {
          throw new Error(data.issues.map((i: any) => i.message).join(' '));
        }
        throw new Error(data.message || 'Processing failed');
      }

      setResult(data);
      setFeedback('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.sanitizedText) return;
    navigator.clipboard.writeText(result.sanitizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTarget = (target: string) => {
    return target.replace('_DATABASE', '').replace('_', ' ');
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Input Form Card */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/60 p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-cyan-400" />
          <h2 className="text-md font-semibold text-white">Scan Feedback Payload</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Type or paste feedback here containing PII (e.g. credit cards, email, phone numbers)..."
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-300"
          ></textarea>

          {error && <div className="text-xs text-rose-400 font-semibold">{error}</div>}

          <button
            type="submit"
            disabled={loading || !feedback.trim()}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-white disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Execute PII Scan'}
          </button>
        </form>
      </div>

      {/* Results Card */}
      {result && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-850 p-5 rounded-xl flex flex-col gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Scan Successful</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide select-all">
              {result.requestId}
            </span>
          </div>

          {/* Sanitized Text Display */}
          <div className="relative bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-lg text-sm text-slate-200 min-h-16 font-sans select-text">
            <p className="pr-8 whitespace-pre-wrap">{result.sanitizedText}</p>
            <button
              onClick={handleCopy}
              title="Copy sanitized text"
              className="absolute top-2.5 right-2.5 text-slate-500 hover:text-cyan-400 p-1.5 rounded bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Sentiment */}
            <div className="p-3 bg-slate-950/40 border border-slate-800/35 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Sentiment
              </span>
              <span
                className={`mt-1 text-xs font-bold uppercase tracking-wider ${
                  result.sentiment === 'POSITIVE'
                    ? 'text-cyan-400'
                    : result.sentiment === 'NEGATIVE'
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {result.sentiment}
              </span>
            </div>

            {/* Target */}
            <div className="p-3 bg-slate-950/40 border border-slate-800/35 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Database className="h-2.5 w-2.5" />
                Target
              </span>
              <span className="mt-1 text-xs font-bold text-slate-300 capitalize truncate w-full">
                {formatTarget(result.routingTarget)}
              </span>
            </div>

            {/* Confidence */}
            <div className="p-3 bg-slate-950/40 border border-slate-800/35 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Award className="h-2.5 w-2.5" />
                Confidence
              </span>
              <span className="mt-1 text-xs font-bold text-slate-300">
                {Math.round(result.confidenceScore * 100)}%
              </span>
            </div>
          </div>

          {/* Detected Entities list */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Detected Entities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.detectedEntities.length > 0 ? (
                result.detectedEntities.map((entity, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {entity}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No PII categories identified.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
