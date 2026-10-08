import React, { useState } from 'react';
import { runFullProductionVerification, VerificationCheckResult } from '../../utils/verification';
import { X, CheckCircle2, XCircle, ShieldCheck, Play, RefreshCw } from 'lucide-react';

interface ProductionVerificationModalProps {
  onClose: () => void;
}

export const ProductionVerificationModal: React.FC<ProductionVerificationModalProps> = ({
  onClose,
}) => {
  const [results, setResults] = useState<VerificationCheckResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await runFullProductionVerification();
      setResults(res);
    } finally {
      setRunning(false);
    }
  };

  const passCount = results?.filter((r) => r.status === 'PASS').length || 0;
  const totalCount = results?.length || 22;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Production E2E Verification Engine
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Systematic Section 80 Checklist Automated Audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!results ? (
            <div className="text-center py-10 space-y-4">
              <p className="text-sm text-neutral-300">
                Execute automated validation across all 22 required production criteria: Auth, PostgreSQL schemas, sequential IDs, RLS, payment idempotency, task locks, ledger integrity, and Root Admin 000001 isolation.
              </p>
              <button
                onClick={handleRun}
                disabled={running}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {running ? 'Running Comprehensive Audit...' : 'RUN FULL E2E VERIFICATION'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Scorecard */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-neutral-400 uppercase">Verification Score</p>
                  <p className="text-2xl font-mono font-bold text-emerald-400">
                    {passCount} / {totalCount} PASSED
                  </p>
                </div>
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg flex items-center gap-1.5 font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
                  Re-test
                </button>
              </div>

              {/* Itemized Table */}
              <div className="border border-neutral-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-neutral-800/30">
                        <td className="p-3 font-semibold text-neutral-200 whitespace-nowrap">
                          {r.category}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                              r.status === 'PASS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {r.status === 'PASS' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-neutral-400 text-[11px]">
                          {r.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
