/**
 * useRalphLoop — Ralph Wiggum's goal-driven loop, demo simulator edition.
 *
 * Implements the Ralph / OpenAI /follow-goals / Claude Code /goal pattern:
 *   - User states a goal + a verifiable stopping condition
 *   - Worker does one bounded thing per cycle
 *   - Cheap evaluator decides yes/no after each cycle
 *   - On "no", the next cycle fires with the reason as guidance
 *   - On "yes", the loop terminates
 *
 * For now this is a *demo simulator* — it fakes per-cycle work + the
 * evaluator verdict from a script. The real wiring would replace the
 * `runCycle` and `evaluate` implementations with backend calls.
 *
 * Hard limits are enforced client-side. If real backend were wired in,
 * the same limits would also need server-side enforcement.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { pickRalphSequence } from './ralph-quotes.js';

export type LoopState =
  | 'idle'         // before anything starts
  | 'running'      // loop is firing
  | 'paused'       // user paused mid-loop (not exposed yet)
  | 'completed'    // evaluator said "yes, goal met"
  | 'stopped'      // user hit stop
  | 'exceeded';    // a hard limit was hit (iters / budget / time)

export interface RalphLimits {
  /** Hard cap on iterations Ralph will run. Must be >= 1. */
  maxIterations: number;
  /** Hard cap on total spend (USD). 0 means no cap (not recommended). */
  maxBudgetUsd: number;
  /** Hard cap on total wall time (minutes). 0 means no cap. */
  maxDurationMin: number;
}

export const DEFAULT_LIMITS: RalphLimits = {
  maxIterations: 25,
  maxBudgetUsd: 2.00,
  maxDurationMin: 15,
};

export interface RalphLogEntry {
  kind: 'cycle' | 'quote' | 'eval' | 'stop';
  text: string;
  /** Per-cycle metadata. */
  cycle?: number;
  /** USD added by this cycle. */
  cost?: number;
  /** Optional finding extracted. */
  finding?: string;
  ts: number;
}

interface UseRalphLoopOpts {
  goal: string;
  limits: RalphLimits;
}

interface UseRalphLoopReturn {
  state: LoopState;
  log: RalphLogEntry[];
  iteration: number;
  spent: number;
  elapsedMs: number;
  reason: string | null;        // last evaluator reason / stop reason
  findings: string[];
  start: () => void;
  stop: () => void;
  reset: () => void;
}

// ── Demo content — a scripted "loop" so we can show the pattern ────────

const DEMO_CYCLES = [
  { task: 'Opening vendor-saas-agreement.pdf', cost: 0.06, finding: 'Auto-renewal clause, 60-day notice' },
  { task: 'Reading clause 3.2 (term and termination)', cost: 0.04, finding: null },
  { task: 'Reading clause 7.1 (limitation of liability)', cost: 0.05, finding: 'Liability cap = 12mo fees — narrow' },
  { task: 'Reading clause 9 (indemnity)', cost: 0.07, finding: 'Mutual indemnity, balanced' },
  { task: 'Reading clause 11 (governing law)', cost: 0.03, finding: 'Delaware, courts of New Castle' },
  { task: 'Opening master-services-agreement-v3.pdf', cost: 0.08, finding: null },
  { task: 'Reading clause 4 (fees and payment)', cost: 0.05, finding: 'Net-60, no late fee — generous to vendor' },
  { task: 'Reading clause 6 (warranties)', cost: 0.04, finding: 'Vendor disclaims all implied warranties' },
  { task: 'Reading clause 12 (data processing)', cost: 0.06, finding: 'No DPA referenced — gap' },
  { task: 'Opening employment-template.docx', cost: 0.05, finding: null },
  { task: 'Reading non-compete clause', cost: 0.04, finding: '24mo non-compete, 50-mile radius — likely unenforceable in CA' },
  { task: 'Reading IP assignment clause', cost: 0.04, finding: 'Broad assignment incl. inventions made on personal time' },
  { task: 'Cross-checking findings against goal', cost: 0.02, finding: null },
];

const EVAL_PROGRESS = [
  'Still finding clauses. Two more documents in the folder.',
  'Three findings so far — keep going, looking for indemnity language.',
  'Found liability cap. Still scanning for indemnity and termination.',
  'Indemnity located. One more pass over termination triggers.',
  'Cross-checking flagged clauses against the brief.',
  'Goal met. All flagged-severity clauses cited.',
];

// ── Hook ───────────────────────────────────────────────────────────────

export function useRalphLoop({ goal, limits }: UseRalphLoopOpts): UseRalphLoopReturn {
  const [state, setState] = useState<LoopState>('idle');
  const [log, setLog] = useState<RalphLogEntry[]>([]);
  const [iteration, setIteration] = useState(0);
  const [spent, setSpent] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reason, setReason] = useState<string | null>(null);
  const [findings, setFindings] = useState<string[]>([]);

  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const iterRef = useRef(0);
  const spentRef = useRef(0);
  const findingsRef = useRef<string[]>([]);
  const quotesRef = useRef(pickRalphSequence(40));

  // Wall-clock ticker
  useEffect(() => {
    if (state !== 'running') return;
    timerRef.current = setInterval(() => {
      if (startedAtRef.current) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const pushLog = useCallback((entry: Omit<RalphLogEntry, 'ts'>) => {
    setLog(prev => [...prev, { ...entry, ts: Date.now() }]);
  }, []);

  const halt = useCallback((finalState: LoopState, finalReason: string) => {
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setState(finalState);
    setReason(finalReason);
    pushLog({ kind: 'stop', text: finalReason });
  }, [pushLog]);

  const runOneCycle = useCallback(() => {
    if (stateRef.current !== 'running') return;

    const nextIter = iterRef.current + 1;
    iterRef.current = nextIter;
    setIteration(nextIter);

    // Pick scripted cycle content
    const demo = DEMO_CYCLES[(nextIter - 1) % DEMO_CYCLES.length];
    const newSpent = spentRef.current + demo.cost;
    spentRef.current = newSpent;
    setSpent(newSpent);

    pushLog({
      kind: 'cycle',
      cycle: nextIter,
      text: demo.task,
      cost: demo.cost,
      finding: demo.finding ?? undefined,
    });

    if (demo.finding) {
      findingsRef.current = [...findingsRef.current, demo.finding];
      setFindings(findingsRef.current);
    }

    // Insert a Ralph quote on every other cycle
    if (nextIter % 2 === 0) {
      const q = quotesRef.current[nextIter % quotesRef.current.length];
      pushLog({ kind: 'quote', text: q });
    }

    // ── Evaluator: should we keep going? ───────────────────────────
    // (a) Hard caps
    if (nextIter >= limits.maxIterations) {
      halt('exceeded', `Hit max iterations (${limits.maxIterations}). Ralph stopped.`);
      return;
    }
    if (limits.maxBudgetUsd > 0 && newSpent >= limits.maxBudgetUsd) {
      halt('exceeded', `Hit budget cap ($${limits.maxBudgetUsd.toFixed(2)}). Ralph stopped.`);
      return;
    }
    if (limits.maxDurationMin > 0 && startedAtRef.current) {
      const minsElapsed = (Date.now() - startedAtRef.current) / 60_000;
      if (minsElapsed >= limits.maxDurationMin) {
        halt('exceeded', `Hit time cap (${limits.maxDurationMin} min). Ralph stopped.`);
        return;
      }
    }

    // (b) Demo evaluator — completes when scripted content ends
    const evalIdx = Math.min(Math.floor(nextIter / 2), EVAL_PROGRESS.length - 1);
    const evalText = EVAL_PROGRESS[evalIdx];
    pushLog({ kind: 'eval', text: evalText });
    setReason(evalText);

    const done = evalIdx === EVAL_PROGRESS.length - 1 && nextIter >= DEMO_CYCLES.length;
    if (done) {
      halt('completed', 'Evaluator: goal met. Ralph rests his case (and his crayon).');
      return;
    }

    // (c) Schedule the next cycle
    cycleTimerRef.current = setTimeout(runOneCycle, 900);
  }, [limits, halt, pushLog]);

  const start = useCallback(() => {
    if (state !== 'idle' && state !== 'completed' && state !== 'stopped' && state !== 'exceeded') return;
    iterRef.current = 0;
    spentRef.current = 0;
    findingsRef.current = [];
    quotesRef.current = pickRalphSequence(40);
    setIteration(0);
    setSpent(0);
    setFindings([]);
    setLog([]);
    setReason(null);
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setState('running');
    pushLog({ kind: 'quote', text: 'I\'m starting! I\'m a brick!' });
    // Fire the first cycle on next tick so state has settled
    cycleTimerRef.current = setTimeout(runOneCycle, 600);
  }, [state, runOneCycle, pushLog]);

  const stop = useCallback(() => {
    if (state !== 'running') return;
    halt('stopped', 'You stopped Ralph. He says: "Aw. I was helping."');
  }, [state, halt]);

  const reset = useCallback(() => {
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    iterRef.current = 0;
    spentRef.current = 0;
    findingsRef.current = [];
    setIteration(0);
    setSpent(0);
    setFindings([]);
    setLog([]);
    setReason(null);
    setElapsedMs(0);
    startedAtRef.current = null;
    setState('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Unused param suppression
  void goal;

  return {
    state,
    log,
    iteration,
    spent,
    elapsedMs,
    reason,
    findings,
    start,
    stop,
    reset,
  };
}
