/**
 * RalphLoopView — Ralph mode.
 *
 * An experimental way of working with legal documents, borrowed from
 * software development: state a goal, set hard limits, and a small fast
 * model decides "done or keep going" after every cycle until the goal
 * is met. Standard Lavern editorial chrome — nothing cartoony except
 * the "I'm helping!" tagline.
 *
 * Three phases:
 *   1. Setup    — goal + hard limits + acknowledgment
 *   2. Running  — live iteration / budget / time + cycle feed + STOP
 *   3. Resolved — completed / stopped / exceeded + summary + findings
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRalphLoop, DEFAULT_LIMITS } from './useRalphLoop.js';
import type { RalphLimits } from './useRalphLoop.js';
import { colors, fonts, radii, spacing, shadows } from '../staffing/styles/tokens.js';

interface Props {
  onBack: () => void;
}

export default function RalphLoopView({ onBack }: Props) {
  const [goal, setGoal] = useState('');
  const [limits, setLimits] = useState<RalphLimits>(DEFAULT_LIMITS);
  const [acknowledged, setAcknowledged] = useState(false);

  const loop = useRalphLoop({ goal, limits });

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
    if (loop.state === 'completed') return 'Goal met.';
    if (loop.state === 'stopped')   return 'Stopped.';
    if (loop.state === 'exceeded')  return 'Hit a limit.';
    return '';
  }, [loop.state]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Nav row */}
        <div style={styles.navRow}>
          <button onClick={onBack} style={styles.backBtn}>
            {'←'} Back
          </button>
        </div>

        {/* Title block */}
        <header style={styles.titleBlock}>
          <div style={styles.kicker}>You found here. Congrats!</div>
          <h1 style={styles.title}>
            Ralph Wiggum <span style={styles.titleAccent}>mode</span>
          </h1>
          <p style={styles.quote}>&ldquo;I&rsquo;m helping!&rdquo;</p>
          <p style={styles.intro}>
            An experimental way of working with legal documents.
            An idea taken from software development: state a goal, set
            hard limits, and a small fast model decides &ldquo;done&rdquo;
            or &ldquo;keep going&rdquo; after every cycle until the
            condition is met. Persistent, monolithic, deterministic —
            and bounded by the caps you set.
          </p>
        </header>

        {/* ── Phase 1: SETUP ───────────────────────────────────── */}
        {!isRunning && (
          <section style={styles.card}>
            <div style={styles.cardEyebrow}>1 · The goal</div>
            <label style={styles.label}>
              What should Ralph keep doing until it&rsquo;s done?
            </label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Review every contract in ~/Documents/Vendors and stop when each one has at least one annotated finding or has been confirmed clean."
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

            <div style={styles.cardEyebrow}>2 · The limits</div>
            <p style={styles.helper}>
              Ralph won&rsquo;t stop on his own until the evaluator says
              done. These caps protect you from a runaway loop.
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

            <div style={styles.cardEyebrow}>3 · Acknowledge</div>
            <label style={styles.ackLabel}>
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={e => setAcknowledged(e.target.checked)}
                style={styles.ackCheckbox}
              />
              <span style={styles.ackText}>
                I understand each cycle calls a model. Cost and time can add up.
                The limits above are hard caps. The Stop button works at any moment.
              </span>
            </label>

            <button
              onClick={loop.start}
              disabled={!canStart}
              style={{
                ...styles.startBtn,
                opacity: canStart ? 1 : 0.4,
                cursor: canStart ? 'pointer' : 'not-allowed',
              }}
            >
              {isResolved ? 'Run again' : 'Start'} {'→'}
            </button>
          </section>
        )}

        {/* ── Phase 2: RUNNING ─────────────────────────────────── */}
        {isRunning && (
          <>
            <section style={styles.runningHero}>
              <div style={styles.runningRow}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={styles.runningLabel}>Goal</div>
                  <div style={styles.runningGoal}>{goal}</div>
                </div>
                <button onClick={loop.stop} style={styles.stopBtn}>
                  ◼ Stop
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
                  <span style={styles.evalLabel}>Evaluator</span>
                  <span>{loop.reason}</span>
                </div>
              )}
            </section>

            <RalphFeed log={loop.log} />
          </>
        )}

        {/* ── Phase 3: RESOLVED ────────────────────────────────── */}
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
                <div style={styles.findingsTitle}>Findings</div>
                <ul style={styles.findingsList}>
                  {loop.findings.map((f, i) => (
                    <li key={i} style={styles.findingItem}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={loop.reset} style={styles.resetBtn}>
              Run another goal
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
  const fill = danger ? colors.danger : warn ? colors.warning : colors.accent;
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

// ── Feed (cycles + evaluator only — no catchphrase quotes) ────────────

function RalphFeed({ log }: { log: ReturnType<typeof useRalphLoop>['log'] }) {
  const filtered = log.filter(e => e.kind === 'cycle' || e.kind === 'eval' || e.kind === 'stop');
  if (filtered.length === 0) return null;
  return (
    <section style={styles.feed}>
      <div style={styles.feedHeader}>Loop</div>
      <AnimatePresence initial={false}>
        {filtered.map((entry, i) => (
          <motion.div
            key={`${entry.ts}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.28, 0.11, 0.32, 1] }}
            style={{
              ...styles.feedItem,
              ...(entry.kind === 'eval' ? styles.feedItemEval : {}),
              ...(entry.kind === 'stop' ? styles.feedItemStop : {}),
            }}
          >
            {entry.kind === 'cycle' && (
              <>
                <span style={styles.feedCycleNum}>#{entry.cycle}</span>
                <span style={styles.feedCycleText}>{entry.text}</span>
                {entry.cost != null && (
                  <span style={styles.feedCost}>${entry.cost.toFixed(2)}</span>
                )}
                {entry.finding && (
                  <div style={styles.feedFinding}>{entry.finding}</div>
                )}
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
    fontFamily: fonts.sans,
    color: colors.text,
  },
  container: {
    maxWidth: 880,
    margin: '0 auto',
    padding: `${spacing.xl}px ${spacing.lg}px ${spacing.xxxl}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  },

  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
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

  // ── Title block ──
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  kicker: {
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: -2,
  },
  title: {
    fontSize: 'clamp(28px, 5.5vw, 40px)',
    fontFamily: fonts.sans,
    fontWeight: 400,
    color: colors.text,
    letterSpacing: -0.5,
    margin: 0,
    lineHeight: 1.1,
  },
  titleAccent: {
    fontWeight: 600,
  },
  quote: {
    fontSize: 16,
    fontFamily: fonts.serif,
    color: colors.textMuted,
    margin: 0,
    lineHeight: 1.4,
  },
  intro: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    lineHeight: 1.65,
    maxWidth: 640,
    margin: `${spacing.sm}px 0 0`,
  },

  // ── Setup card ──
  card: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    boxShadow: shadows.md,
  },
  cardEyebrow: {
    fontSize: 10.5,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontFamily: fonts.sans,
    marginBottom: -4,
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 14,
    fontFamily: fonts.sans,
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
    backgroundColor: colors.bgPanel,
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    padding: '4px 10px',
    borderRadius: radii.pill,
    cursor: 'pointer',
    transition: 'background-color 0.2s cubic-bezier(0.28,0.11,0.32,1), border-color 0.2s cubic-bezier(0.28,0.11,0.32,1)',
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
    lineHeight: 1.55,
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

  // ── Acknowledge ──
  ackLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 13,
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: spacing.md,
    backgroundColor: colors.bgPanel,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    lineHeight: 1.55,
  },
  ackCheckbox: {
    width: 16,
    height: 16,
    cursor: 'pointer',
    flexShrink: 0,
    marginTop: 2,
    accentColor: colors.accent,
  },
  ackText: {
    flex: 1,
  },

  // ── Start CTA ──
  startBtn: {
    marginTop: spacing.md,
    padding: '14px 28px',
    fontSize: 12,
    fontFamily: fonts.sans,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    backgroundColor: colors.accent,
    border: `2px solid ${colors.accent}`,
    borderRadius: radii.pill,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(196, 93, 62, 0.20), 0 8px 24px rgba(196, 93, 62, 0.22), 0 24px 56px rgba(196, 93, 62, 0.14), inset 0 1px 0 rgba(255,255,255,0.18)',
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
    fontFamily: fonts.serif,
    color: colors.text,
    lineHeight: 1.5,
    maxWidth: 580,
  },
  stopBtn: {
    padding: '10px 22px',
    fontSize: 12,
    fontFamily: fonts.sans,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    backgroundColor: colors.danger,
    border: 'none',
    borderRadius: radii.pill,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(196, 93, 62, 0.20), 0 6px 18px rgba(196, 93, 62, 0.22), 0 16px 40px rgba(196, 93, 62, 0.16), inset 0 1px 0 rgba(255,255,255,0.18)',
    flexShrink: 0,
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
    height: 6,
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
    backgroundColor: colors.bgPanel,
    border: `1px solid ${colors.border}`,
    padding: '10px 14px',
    borderRadius: radii.md,
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
  },
  evalLabel: {
    fontFamily: fonts.sans,
    fontWeight: 700,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 10.5,
    flexShrink: 0,
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
  feedItemEval: {
    backgroundColor: colors.bgPanel,
    color: colors.textSecondary,
  },
  feedItemStop: {
    backgroundColor: colors.accentLight,
    color: colors.accent,
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
    backgroundColor: colors.bgPanel,
    padding: '4px 10px',
    borderRadius: radii.sm,
    borderLeft: `2px solid ${colors.accent}`,
    marginTop: 4,
  },
  feedCost: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  feedEvalLabel: {
    fontFamily: fonts.sans,
    fontWeight: 700,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
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
    padding: spacing.xxl,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: shadows.md,
  },
  resolvedTitle: {
    fontSize: 28,
    fontFamily: fonts.serif,
    fontWeight: 400,
    color: colors.text,
    lineHeight: 1.2,
    letterSpacing: -0.3,
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
    fontSize: 28,
    fontFamily: fonts.serif,
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
    backgroundColor: colors.bgPanel,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    padding: spacing.lg,
    textAlign: 'left',
  },
  findingsTitle: {
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: 700,
    color: colors.textMuted,
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
    paddingLeft: 14,
    position: 'relative',
  },
  resetBtn: {
    padding: '10px 22px',
    fontSize: 11,
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
