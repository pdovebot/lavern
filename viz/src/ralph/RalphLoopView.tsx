/**
 * RalphLoopView — Ralph Wiggum, Esq. He keeps going until done.
 *
 * Three phases:
 *   1. Setup    — goal entry + hard limits + danger acknowledgment
 *   2. Running  — live iteration / budget / time, Ralph's commentary,
 *                 evaluator verdicts, always-visible STOP button
 *   3. Resolved — completed / stopped / exceeded — with a summary
 *
 * Ralph mode (the font/theme swap) activates whenever the user is on
 * this view, via a CSS class on <html>. Toggle in nav also persists.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRalphLoop, DEFAULT_LIMITS } from './useRalphLoop.js';
import type { RalphLimits } from './useRalphLoop.js';
import { colors, fonts, radii, spacing, shadows } from '../staffing/styles/tokens.js';

interface Props {
  onBack: () => void;
}

const RALPH_YELLOW = '#FED90F';     // Simpsons-yellow accent
const RALPH_PURPLE = '#3F2A56';     // Lisa's dress purple, secondary accent
const RALPH_RED = '#D62828';        // Marge / lunchbox red — warning

export default function RalphLoopView({ onBack }: Props) {
  const [goal, setGoal] = useState('');
  const [limits, setLimits] = useState<RalphLimits>(DEFAULT_LIMITS);
  const [acknowledged, setAcknowledged] = useState(false);

  const loop = useRalphLoop({ goal, limits });

  // Apply ralph-mode class to <html> for the duration of this view
  useEffect(() => {
    document.documentElement.classList.add('ralph-mode');
    return () => { document.documentElement.classList.remove('ralph-mode'); };
  }, []);

  const isRunning = loop.state === 'running';
  const isResolved = loop.state === 'completed' || loop.state === 'stopped' || loop.state === 'exceeded';
  const canStart = goal.trim().length >= 5 && acknowledged && (loop.state === 'idle' || isResolved);

  const elapsedMin = Math.floor(loop.elapsedMs / 60_000);
  const elapsedSec = Math.floor((loop.elapsedMs % 60_000) / 1000);

  const iterPct = (loop.iteration / Math.max(1, limits.maxIterations)) * 100;
  const budgetPct = limits.maxBudgetUsd > 0 ? (loop.spent / limits.maxBudgetUsd) * 100 : 0;
  const timePct = limits.maxDurationMin > 0
    ? (loop.elapsedMs / (limits.maxDurationMin * 60_000)) * 100
    : 0;

  const resolvedTitle = useMemo(() => {
    if (loop.state === 'completed') return 'Goal met. Ralph rests his case.';
    if (loop.state === 'stopped')   return 'You stopped him.';
    if (loop.state === 'exceeded')  return 'Hit a limit. Ralph stopped.';
    return '';
  }, [loop.state]);

  return (
    <div style={styles.page}>
      {/* Background flourish — yellow → red gradient blob top right */}
      <div style={styles.bgFlourish} aria-hidden />

      <div style={styles.container}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn}>
            {'←'} Back
          </button>
          <div style={styles.modeBadge}>
            <span style={styles.modeDot} />
            Ralph mode
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section style={styles.hero}>
          <motion.div
            animate={{ rotate: [0, -2, 2, -1, 1, 0] }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={styles.avatar}
            aria-hidden
          >
            👨‍⚖️
          </motion.div>
          <h1 style={styles.title}>
            Ralph Wiggum, Esq.
          </h1>
          <p style={styles.subtitle}>
            He bent his wookie. He keeps going.
          </p>
          <p style={styles.tagline}>
            A goal-driven loop: state the goal, set the limits, hit start.
            Ralph runs one bounded cycle after another. A small fast
            evaluator decides "done" or "keep going" between each.
            He stops when the goal is met — or when a limit is hit.
          </p>
        </section>

        {/* ── Phase 1: SETUP ─────────────────────────────────────── */}
        {!isRunning && (
          <section style={styles.card}>
            <div style={styles.cardEyebrow}>Step 1 · The goal</div>
            <label style={styles.label}>
              What should Ralph keep doing until he's done?
            </label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Find every penalty clause in ~/Documents/Contracts and stop when none remain. Stop after 25 iterations or $2 spent."
              style={styles.textarea}
              rows={4}
              disabled={isRunning}
            />
            <div style={styles.exampleRow}>
              <span style={styles.exampleLabel}>Try:</span>
              <button onClick={() => setGoal('Review every contract in ~/Documents/Vendors and stop when each one has at least one annotated finding or has been confirmed clean.')} style={styles.exampleChip}>
                Review every contract in a folder
              </button>
              <button onClick={() => setGoal('Find every indemnity clause in the open matter and rate it favourable / balanced / hostile. Stop when every clause is rated.')} style={styles.exampleChip}>
                Rate every indemnity clause
              </button>
              <button onClick={() => setGoal('Read the merger agreement and surface every term where the buyer carries unbounded liability. Stop when no more such terms surface in three consecutive passes.')} style={styles.exampleChip}>
                Find unbounded-liability terms
              </button>
            </div>

            <div style={styles.divider} />

            <div style={styles.cardEyebrow}>Step 2 · The limits</div>
            <p style={styles.helper}>
              Ralph won't stop on his own until the evaluator says done.
              These are the safety rails.
            </p>
            <div style={styles.limitsGrid}>
              <LimitInput
                label="Max iterations"
                hint="how many cycles before he stops"
                value={limits.maxIterations}
                min={1}
                max={500}
                onChange={v => setLimits(l => ({ ...l, maxIterations: v }))}
              />
              <LimitInput
                label="Budget cap (USD)"
                hint="dollar spend across all cycles"
                value={limits.maxBudgetUsd}
                min={0}
                max={100}
                step={0.5}
                prefix="$"
                onChange={v => setLimits(l => ({ ...l, maxBudgetUsd: v }))}
              />
              <LimitInput
                label="Time cap (min)"
                hint="wall-clock minutes"
                value={limits.maxDurationMin}
                min={0}
                max={240}
                onChange={v => setLimits(l => ({ ...l, maxDurationMin: v }))}
              />
            </div>

            <div style={styles.divider} />

            <div style={styles.cardEyebrow}>Step 3 · The warning</div>
            <div style={styles.warning}>
              <div style={styles.warningHeader}>
                <span style={styles.warningIcon}>⚠</span>
                <span style={styles.warningTitle}>Ralph does not know when to stop.</span>
              </div>
              <ul style={styles.warningList}>
                <li>Each cycle calls a model. Real money. Real time.</li>
                <li>The evaluator can be wrong. A bad "done" criterion can loop forever.</li>
                <li>The Stop button is always there. Use it.</li>
                <li>The limits above are <strong>hard caps</strong>. Pick conservative numbers.</li>
              </ul>
              <label style={styles.ackLabel}>
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={e => setAcknowledged(e.target.checked)}
                  style={styles.ackCheckbox}
                />
                <span>I understand. Run him within the limits I set.</span>
              </label>
            </div>

            <button
              onClick={loop.start}
              disabled={!canStart}
              style={{
                ...styles.startBtn,
                opacity: canStart ? 1 : 0.4,
                cursor: canStart ? 'pointer' : 'not-allowed',
              }}
            >
              {isResolved ? 'Run Ralph again →' : 'Start Ralph →'}
            </button>
          </section>
        )}

        {/* ── Phase 2: RUNNING ───────────────────────────────────── */}
        {isRunning && (
          <>
            <section style={styles.runningHero}>
              <div style={styles.runningRow}>
                <div>
                  <div style={styles.runningLabel}>Goal</div>
                  <div style={styles.runningGoal}>{goal}</div>
                </div>
                <button onClick={loop.stop} style={styles.stopBtn}>
                  ◼ Stop Ralph
                </button>
              </div>

              <div style={styles.metersGrid}>
                <Meter
                  label="Iterations"
                  value={`${loop.iteration} / ${limits.maxIterations}`}
                  pct={iterPct}
                />
                <Meter
                  label="Budget"
                  value={`$${loop.spent.toFixed(2)} / $${limits.maxBudgetUsd.toFixed(2)}`}
                  pct={budgetPct}
                />
                <Meter
                  label="Time"
                  value={`${elapsedMin}:${elapsedSec.toString().padStart(2, '0')} / ${limits.maxDurationMin}:00`}
                  pct={timePct}
                />
              </div>

              {loop.reason && (
                <div style={styles.evalNote}>
                  <span style={styles.evalLabel}>Evaluator:</span> {loop.reason}
                </div>
              )}
            </section>

            <RalphFeed log={loop.log} />
          </>
        )}

        {/* ── Phase 3: RESOLVED ──────────────────────────────────── */}
        {isResolved && (
          <section style={styles.resolved}>
            <div style={styles.resolvedTitle}>{resolvedTitle}</div>
            {loop.reason && <div style={styles.resolvedReason}>{loop.reason}</div>}

            <div style={styles.resolvedStats}>
              <div style={styles.resolvedStat}>
                <div style={styles.resolvedStatValue}>{loop.iteration}</div>
                <div style={styles.resolvedStatLabel}>iterations</div>
              </div>
              <div style={styles.resolvedStat}>
                <div style={styles.resolvedStatValue}>${loop.spent.toFixed(2)}</div>
                <div style={styles.resolvedStatLabel}>spent</div>
              </div>
              <div style={styles.resolvedStat}>
                <div style={styles.resolvedStatValue}>{elapsedMin}:{elapsedSec.toString().padStart(2, '0')}</div>
                <div style={styles.resolvedStatLabel}>elapsed</div>
              </div>
              <div style={styles.resolvedStat}>
                <div style={styles.resolvedStatValue}>{loop.findings.length}</div>
                <div style={styles.resolvedStatLabel}>findings</div>
              </div>
            </div>

            {loop.findings.length > 0 && (
              <div style={styles.findingsBox}>
                <div style={styles.findingsTitle}>What Ralph found</div>
                <ul style={styles.findingsList}>
                  {loop.findings.map((f, i) => (
                    <li key={i} style={styles.findingItem}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={loop.reset} style={styles.resetBtn}>
              ↺ Run another goal
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

// ── Meter ─────────────────────────────────────────────────────────────

function Meter({ label, value, pct }: { label: string; value: string; pct: number }) {
  const danger = pct >= 80;
  const warn = pct >= 60 && pct < 80;
  const fill = danger ? RALPH_RED : warn ? '#E58F2D' : RALPH_YELLOW;
  return (
    <div style={styles.meter}>
      <div style={styles.meterHeader}>
        <span style={styles.meterLabel}>{label}</span>
        <span style={styles.meterValue}>{value}</span>
      </div>
      <div style={styles.meterTrack}>
        <div
          style={{
            ...styles.meterFill,
            width: `${Math.min(100, Math.max(0, pct))}%`,
            backgroundColor: fill,
          }}
        />
      </div>
    </div>
  );
}

// ── LimitInput ────────────────────────────────────────────────────────

function LimitInput({
  label, hint, value, min, max, step = 1, prefix, onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label style={styles.limit}>
      <div style={styles.limitLabel}>{label}</div>
      <div style={styles.limitInputRow}>
        {prefix && <span style={styles.limitPrefix}>{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => {
            const v = Number(e.target.value);
            if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          style={styles.limitInput}
        />
      </div>
      <div style={styles.limitHint}>{hint}</div>
    </label>
  );
}

// ── Feed ──────────────────────────────────────────────────────────────

function RalphFeed({ log }: { log: ReturnType<typeof useRalphLoop>['log'] }) {
  return (
    <section style={styles.feed}>
      <div style={styles.feedHeader}>Loop</div>
      <AnimatePresence initial={false}>
        {log.map((entry, i) => (
          <motion.div
            key={`${entry.ts}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.28, 0.11, 0.32, 1] }}
            style={{
              ...styles.feedItem,
              ...(entry.kind === 'quote' ? styles.feedItemQuote : {}),
              ...(entry.kind === 'eval' ? styles.feedItemEval : {}),
              ...(entry.kind === 'stop' ? styles.feedItemStop : {}),
            }}
          >
            {entry.kind === 'cycle' && (
              <>
                <span style={styles.feedCycleNum}>#{entry.cycle}</span>
                <span style={styles.feedCycleText}>{entry.text}</span>
                {entry.finding && (
                  <div style={styles.feedFinding}>✦ {entry.finding}</div>
                )}
                {entry.cost != null && (
                  <span style={styles.feedCost}>${entry.cost.toFixed(2)}</span>
                )}
              </>
            )}
            {entry.kind === 'quote' && (
              <>
                <span style={styles.feedQuoteMark}>"</span>
                <span style={styles.feedQuoteText}>{entry.text}</span>
                <span style={styles.feedQuoteMark}>"</span>
                <span style={styles.feedQuoteAttrib}>— Ralph</span>
              </>
            )}
            {entry.kind === 'eval' && (
              <>
                <span style={styles.feedEvalLabel}>Evaluator</span>
                <span style={styles.feedEvalText}>{entry.text}</span>
              </>
            )}
            {entry.kind === 'stop' && (
              <span style={styles.feedStopText}>{entry.text}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: colors.bg,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'var(--ralph-font, ' + fonts.sans + ')',
  },
  bgFlourish: {
    position: 'fixed',
    top: -200,
    right: -200,
    width: 600,
    height: 600,
    background: `radial-gradient(circle at 50% 50%, ${RALPH_YELLOW}40, transparent 60%)`,
    pointerEvents: 'none',
    zIndex: 0,
  },
  container: {
    maxWidth: 880,
    margin: '0 auto',
    padding: `${spacing.xl}px ${spacing.lg}px ${spacing.xxxl}px`,
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  },

  // ── Header ──
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    padding: '6px 14px',
    borderRadius: radii.sm,
    border: `1.5px solid ${colors.text}`,
    backgroundColor: 'transparent',
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  modeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    borderRadius: radii.pill,
    backgroundColor: '#FFF8C8',
    border: `1.5px solid ${RALPH_YELLOW}`,
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#5B4A0A',
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: RALPH_YELLOW,
    boxShadow: `0 0 10px ${RALPH_YELLOW}`,
  },

  // ── Hero ──
  hero: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.xl}px 0 ${spacing.lg}px`,
  },
  avatar: {
    fontSize: 72,
    lineHeight: 1,
    filter: `drop-shadow(0 6px 16px ${RALPH_YELLOW}90)`,
  },
  title: {
    fontSize: 'clamp(36px, 6vw, 56px)',
    fontFamily: 'var(--ralph-display, ' + fonts.serif + ')',
    fontWeight: 400,
    color: colors.text,
    margin: 0,
    lineHeight: 1.05,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'var(--ralph-display, ' + fonts.serif + ')',
    color: RALPH_PURPLE,
    margin: 0,
    fontStyle: 'normal',
  },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 1.6,
    maxWidth: 540,
    margin: `${spacing.sm}px 0 0`,
  },

  // ── Setup card ──
  card: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: `${spacing.xxl}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    boxShadow: shadows.md,
  },
  cardEyebrow: {
    fontSize: 10.5,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: RALPH_PURPLE,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'var(--ralph-display, ' + fonts.serif + ')',
    marginBottom: -4,
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 14,
    fontFamily: 'var(--ralph-font, ' + fonts.sans + ')',
    color: colors.text,
    backgroundColor: colors.bgInput,
    border: `1.5px solid ${colors.border}`,
    borderRadius: radii.md,
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: 90,
    lineHeight: 1.55,
  },
  exampleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    marginTop: -4,
  },
  exampleLabel: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  exampleChip: {
    fontSize: 12,
    fontFamily: fonts.sans,
    backgroundColor: '#FFF8C8',
    border: `1px solid ${RALPH_YELLOW}`,
    color: '#5B4A0A',
    padding: '4px 10px',
    borderRadius: radii.pill,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.28,0.11,0.32,1)',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    margin: `${spacing.sm}px 0`,
  },
  helper: {
    fontSize: 13,
    color: colors.textMuted,
    margin: 0,
    lineHeight: 1.5,
  },

  // ── Limits ──
  limitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: spacing.md,
  },
  limit: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  limitLabel: {
    fontSize: 12,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: colors.text,
    letterSpacing: 0.3,
  },
  limitInputRow: {
    display: 'flex',
    alignItems: 'center',
    border: `1.5px solid ${colors.border}`,
    borderRadius: radii.md,
    backgroundColor: colors.bgInput,
    padding: '0 12px',
  },
  limitPrefix: {
    fontSize: 14,
    fontFamily: fonts.serif,
    color: colors.textMuted,
    marginRight: 4,
  },
  limitInput: {
    width: '100%',
    padding: '10px 0',
    fontSize: 16,
    fontFamily: fonts.sans,
    color: colors.text,
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
  },
  limitHint: {
    fontSize: 11,
    color: colors.textDim,
  },

  // ── Warning ──
  warning: {
    padding: spacing.lg,
    backgroundColor: '#FFF4F0',
    border: `1.5px solid ${RALPH_RED}40`,
    borderLeft: `4px solid ${RALPH_RED}`,
    borderRadius: radii.md,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  warningHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  warningIcon: {
    fontSize: 18,
    color: RALPH_RED,
  },
  warningTitle: {
    fontSize: 14,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: RALPH_RED,
    letterSpacing: 0.3,
  },
  warningList: {
    margin: 0,
    paddingLeft: 24,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 1.6,
  },
  ackLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    color: colors.text,
    fontWeight: 500,
    cursor: 'pointer',
    paddingTop: spacing.sm,
    borderTop: `1px dashed ${RALPH_RED}30`,
  },
  ackCheckbox: {
    width: 16,
    height: 16,
    cursor: 'pointer',
    accentColor: RALPH_RED,
  },

  startBtn: {
    marginTop: spacing.md,
    padding: '16px 32px',
    fontSize: 14,
    fontFamily: fonts.sans,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#1A0E00',
    backgroundColor: RALPH_YELLOW,
    border: `2px solid ${colors.text}`,
    borderRadius: radii.pill,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(20,18,14,0.14), 0 8px 24px rgba(254,217,15,0.34), 0 24px 56px rgba(254,217,15,0.18)',
    transition: 'all 0.25s cubic-bezier(0.28,0.11,0.32,1)',
    alignSelf: 'flex-start',
  },

  // ── Running ──
  runningHero: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    boxShadow: shadows.md,
    position: 'sticky',
    top: spacing.lg,
    zIndex: 5,
  },
  runningRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  runningLabel: {
    fontSize: 10.5,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  runningGoal: {
    fontSize: 15,
    fontFamily: 'var(--ralph-display, ' + fonts.serif + ')',
    color: colors.text,
    lineHeight: 1.5,
    maxWidth: 580,
  },
  stopBtn: {
    padding: '12px 22px',
    fontSize: 13,
    fontFamily: fonts.sans,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    backgroundColor: RALPH_RED,
    border: 'none',
    borderRadius: radii.pill,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(214,40,40,0.22), 0 8px 24px rgba(214,40,40,0.28), 0 24px 56px rgba(214,40,40,0.18), inset 0 1px 0 rgba(255,255,255,0.16)',
    flexShrink: 0,
    transition: 'all 0.25s cubic-bezier(0.28,0.11,0.32,1)',
  },
  metersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: spacing.lg,
  },
  meter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  meterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  meterLabel: {
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  meterValue: {
    fontSize: 13,
    fontFamily: fonts.mono,
    color: colors.text,
    fontWeight: 500,
  },
  meterTrack: {
    height: 8,
    backgroundColor: colors.bgPanel,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: radii.pill,
    transition: 'width 0.4s cubic-bezier(0.28,0.11,0.32,1), background-color 0.3s ease',
  },
  evalNote: {
    fontSize: 13,
    color: colors.textSecondary,
    backgroundColor: '#FFF8C8',
    border: `1px solid ${RALPH_YELLOW}80`,
    padding: '10px 14px',
    borderRadius: radii.md,
    lineHeight: 1.5,
  },
  evalLabel: {
    fontFamily: fonts.sans,
    fontWeight: 700,
    color: '#5B4A0A',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontSize: 11,
    marginRight: 8,
  },

  // ── Feed ──
  feed: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxShadow: shadows.sm,
  },
  feedHeader: {
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  feedItem: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.text,
    padding: '8px 12px',
    borderRadius: radii.sm,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 8,
    lineHeight: 1.5,
  },
  feedItemQuote: {
    backgroundColor: '#FFF8C8',
    color: '#3A2F00',
    fontFamily: 'var(--ralph-display, ' + fonts.serif + ')',
    fontSize: 15,
  },
  feedItemEval: {
    backgroundColor: '#F5F0FF',
    color: RALPH_PURPLE,
  },
  feedItemStop: {
    backgroundColor: '#FFF4F0',
    color: RALPH_RED,
    fontWeight: 600,
  },
  feedCycleNum: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
    backgroundColor: colors.bgPanel,
    padding: '1px 6px',
    borderRadius: radii.sm,
    flexShrink: 0,
  },
  feedCycleText: {
    color: colors.text,
    flex: '1 1 auto',
    minWidth: 200,
  },
  feedFinding: {
    width: '100%',
    fontSize: 12.5,
    color: colors.textSecondary,
    fontStyle: 'normal',
    backgroundColor: 'rgba(254,217,15,0.12)',
    padding: '4px 10px',
    borderRadius: radii.sm,
    borderLeft: `2px solid ${RALPH_YELLOW}`,
    marginTop: 4,
  },
  feedCost: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  feedQuoteMark: {
    fontFamily: 'var(--ralph-display, ' + fonts.serif + ')',
    fontSize: 22,
    color: RALPH_YELLOW,
    lineHeight: 0.5,
  },
  feedQuoteText: {
    fontStyle: 'normal',
    flex: '1 1 auto',
  },
  feedQuoteAttrib: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: '#8B7A00',
    fontStyle: 'normal',
    fontWeight: 600,
    marginLeft: 'auto',
  },
  feedEvalLabel: {
    fontFamily: fonts.sans,
    fontWeight: 700,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    backgroundColor: RALPH_PURPLE,
    color: '#FFFFFF',
    padding: '2px 7px',
    borderRadius: radii.sm,
    flexShrink: 0,
  },
  feedEvalText: {
    flex: '1 1 auto',
  },
  feedStopText: {
    flex: '1 1 auto',
  },

  // ── Resolved ──
  resolved: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: `${spacing.xxl}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: shadows.md,
  },
  resolvedTitle: {
    fontSize: 26,
    fontFamily: 'var(--ralph-display, ' + fonts.serif + ')',
    color: colors.text,
    lineHeight: 1.2,
  },
  resolvedReason: {
    fontSize: 14,
    color: colors.textMuted,
    maxWidth: 560,
    lineHeight: 1.55,
  },
  resolvedStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: spacing.md,
    width: '100%',
    padding: `${spacing.md}px 0`,
  },
  resolvedStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: spacing.md,
    backgroundColor: colors.bgPanel,
    borderRadius: radii.md,
  },
  resolvedStatValue: {
    fontSize: 30,
    fontFamily: 'var(--ralph-display, ' + fonts.serif + ')',
    fontWeight: 400,
    color: colors.text,
    lineHeight: 1,
  },
  resolvedStatLabel: {
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  findingsBox: {
    width: '100%',
    backgroundColor: '#FFFDF0',
    border: `1px solid ${RALPH_YELLOW}80`,
    borderRadius: radii.md,
    padding: spacing.lg,
    textAlign: 'left',
  },
  findingsTitle: {
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: 700,
    color: '#5B4A0A',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  findingsList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  findingItem: {
    fontSize: 13.5,
    color: colors.text,
    lineHeight: 1.5,
    paddingLeft: 18,
    position: 'relative',
  },
  resetBtn: {
    padding: '12px 22px',
    fontSize: 12,
    fontFamily: fonts.sans,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.text,
    backgroundColor: 'transparent',
    border: `1.5px solid ${colors.text}`,
    borderRadius: radii.pill,
    cursor: 'pointer',
  },
};
