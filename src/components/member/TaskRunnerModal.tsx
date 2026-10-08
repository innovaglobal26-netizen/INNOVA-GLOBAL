import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { taskService } from '../../services/tasks/taskService';
import { X, CheckCircle2, ShieldCheck, Cpu, ArrowRight, AlertCircle } from 'lucide-react';

interface TaskRunnerModalProps {
  innovaId: string;
  task: Task;
  onClose: () => void;
  onCompleted: () => void;
}

export const TaskRunnerModal: React.FC<TaskRunnerModalProps> = ({
  innovaId,
  task,
  onClose,
  onCompleted,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(task.duration_seconds || 20);
  const [startTime] = useState(new Date().toISOString());
  const [isDone, setIsDone] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setIsDone(true);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const handleClaimReward = async () => {
    setError(null);
    setClaiming(true);

    try {
      taskService.completeTask(innovaId, task.id, startTime);
      setClaimSuccess(true);
      setTimeout(() => {
        onCompleted();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to commit task reward.');
      setClaiming(false);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round(((task.duration_seconds - secondsRemaining) / task.duration_seconds) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-xs font-bold">
              {task.order_index}
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                Executing Task
              </span>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                {task.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description & Reward */}
        <div className="space-y-2 text-xs text-neutral-300 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
          <p className="leading-relaxed">{task.description}</p>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-neutral-400 font-mono">
            <span>Allocated Yield Reward:</span>
            <span className="text-amber-400 font-bold text-sm">৳{task.reward_amount.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Processing Animation / Countdown */}
        {!claimSuccess ? (
          <div className="space-y-4 text-center py-4">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-neutral-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-amber-500 transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono text-white tabular-nums">
                  {secondsRemaining}s
                </span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  Remaining
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-300 font-mono">
                <Cpu className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>
                  {secondsRemaining > 0
                    ? 'Verifying cryptographic node packet proof...'
                    : 'Consensus Proof Confirmed! Ready to Commit.'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Please remain on this screen until the 20-second consensus cycle completes.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClaimReward}
                disabled={!isDone || claiming}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {claiming
                  ? 'Committing to Earning Ledger...'
                  : isDone
                  ? 'CLAIM ৳' + task.reward_amount.toFixed(2) + ' REWARD'
                  : `Waiting Cycle (${secondsRemaining}s)`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-neutral-100">Reward Credited!</h4>
            <p className="text-xs text-neutral-300">
              ৳{task.reward_amount.toFixed(2)} has been recorded into your official financial ledger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
