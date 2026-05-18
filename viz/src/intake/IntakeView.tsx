/**
 * IntakeView — "Client Intake" reception screen.
 *
 * Two intake modes:
 *   Quick:   Drop a document → auto-infer → Review → Terms → Done
 *   Guided:  Step-by-step conversational Q&A → Review → Terms → Done
 *
 * Falls back to demo mode if backend API is unreachable.
 */

import { useEffect, useCallback, useState } from 'react';
import { IntakeHeader } from './components/IntakeHeader.js';
import { QuickDropZone } from './components/QuickDropZone.js';
import { ClientInfoForm } from './components/ClientInfoForm.js';
import { ReviewCards } from './components/ReviewCards.js';
import { EngagementViewer } from './components/EngagementViewer.js';
import { useIntakeState, type MatterData } from './hooks/useIntakeState.js';
import type { IntakePhase, IntakeMode } from './components/IntakeProgress.js';
import { ConfidenceSignal } from '../shared/ConfidenceSignal.js';
import { colors, fonts, radii, spacing, shadows } from '../staffing/styles/tokens.js';

// ── Mode select card — premium hover-lift tile ─────────────────────────

interface ModeCardProps {
  onClick: () => void;
  label: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  recommended?: boolean;
}

function ModeCard({ onClick, label, title, description, icon, iconColor, iconBg, recommended }: ModeCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 18,
        padding: '40px 32px 36px',
        backgroundColor: hovered ? colors.bgCard : 'rgba(255, 255, 255, 0.78)',
        border: `1px solid ${hovered ? (recommended ? 'rgba(196, 93, 62, 0.35)' : colors.borderHover) : colors.border}`,
        borderRadius: radii.lg,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: fonts.sans,
        boxShadow: hovered ? shadows.lg : shadows.sm,
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'background-color 0.35s cubic-bezier(0.28,0.11,0.32,1), border-color 0.35s cubic-bezier(0.28,0.11,0.32,1), box-shadow 0.4s cubic-bezier(0.28,0.11,0.32,1), transform 0.4s cubic-bezier(0.28,0.11,0.32,1)',
        overflow: 'hidden',
      }}
    >
      {/* Recommended ribbon */}
      {recommended && (
        <span style={{
          position: 'absolute',
          top: 16,
          right: 16,
          fontSize: 10,
          fontFamily: fonts.sans,
          fontWeight: 600,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: colors.accent,
          backgroundColor: 'rgba(196, 93, 62, 0.10)',
          border: '1px solid rgba(196, 93, 62, 0.22)',
          borderRadius: radii.pill,
          padding: '3px 10px',
        }}>
          Recommended
        </span>
      )}

      {/* Soft radial highlight (top-left) — Apple-style */}
      <div aria-hidden style={{
        position: 'absolute',
        inset: 0,
        background: hovered
          ? `radial-gradient(circle at 18% 0%, ${recommended ? 'rgba(196, 93, 62, 0.06)' : 'rgba(20, 18, 14, 0.04)'}, transparent 55%)`
          : 'transparent',
        transition: 'background 0.5s cubic-bezier(0.28,0.11,0.32,1)',
        pointerEvents: 'none',
      }} />

      {/* Icon in tinted circle */}
      <div style={{
        position: 'relative',
        width: 68,
        height: 68,
        borderRadius: '50%',
        backgroundColor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        transition: 'transform 0.4s cubic-bezier(0.28,0.11,0.32,1)',
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
        boxShadow: hovered ? 'inset 0 1px 0 rgba(255,255,255,0.5)' : 'none',
      }}>
        {icon}
      </div>

      {/* Eyebrow label */}
      <div style={{
        position: 'relative',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: colors.textDim,
        marginBottom: -8,
      }}>
        {recommended ? 'Step by step' : label}
      </div>

      {/* Title — serif accent */}
      <div style={{
        position: 'relative',
        fontSize: 26,
        fontFamily: fonts.serif,
        fontWeight: 400,
        color: colors.text,
        letterSpacing: -0.3,
        lineHeight: 1.15,
      }}>
        {title}
      </div>

      {/* Description */}
      <div style={{
        position: 'relative',
        fontSize: 13.5,
        color: colors.textMuted,
        lineHeight: 1.55,
        maxWidth: '95%',
      }}>
        {description}
      </div>

      {/* Footer hint with arrow */}
      <div style={{
        position: 'relative',
        marginTop: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: hovered ? (recommended ? colors.accent : colors.text) : colors.textDim,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'color 0.3s cubic-bezier(0.28,0.11,0.32,1)',
      }}>
        Choose
        <span style={{
          display: 'inline-block',
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
          transition: 'transform 0.35s cubic-bezier(0.28,0.11,0.32,1)',
        }}>{'→'}</span>
      </div>
    </button>
  );
}

interface Props {
  onComplete: (matterData: MatterData) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function IntakeView({ onComplete, onSkip, onBack }: Props) {
  const { phase, setPhase, loading, error, matterData, demoMode, submitClientInfo, acceptEngagement, advanceToTerms } = useIntakeState();
  const [mode, setMode] = useState<IntakeMode>(null);

  // Auto-advance to briefing after acceptance
  useEffect(() => {
    if (phase === 'accepted' && matterData) {
      const timer = setTimeout(() => onComplete(matterData), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, matterData, onComplete]);

  const selectQuickMode = useCallback(() => {
    setMode('quick');
    setPhase('quick-drop');
  }, [setPhase]);

  const selectGuidedMode = useCallback(() => {
    setMode('guided');
    setPhase('guided-1');
  }, [setPhase]);

  const handleBack = useCallback(() => {
    if (phase === 'quick-drop' || phase === 'guided-1') {
      setMode(null);
      setPhase('mode-select');
    } else {
      onBack();
    }
  }, [phase, setPhase, onBack]);

  const handleQuickSubmit = useCallback((data: Parameters<typeof submitClientInfo>[0]) => {
    setPhase('quick-confirm');
    submitClientInfo(data);
  }, [setPhase, submitClientInfo]);

  return (
    <div style={styles.container}>
      <IntakeHeader phase={phase} mode={mode} onBack={handleBack} onSkip={onSkip} />

      {error && <div style={styles.error}>{error}</div>}

      {/* Mode Select */}
      {phase === 'mode-select' && (
        <div style={styles.modeSelect}>
          <ModeCard
            onClick={selectQuickMode}
            label="The fastest path"
            title="Drop & Go"
            description="Drop a document or paste text. We'll figure out the rest."
            iconColor={colors.text}
            iconBg="rgba(20, 18, 14, 0.04)"
            icon={(
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <line x1="12" y1="12" x2="12" y2="18" />
                <path d="M9 15l3-3 3 3" />
              </svg>
            )}
          />
          <ModeCard
            onClick={selectGuidedMode}
            label="Recommended"
            recommended
            title="Guided Intake"
            description="Step-by-step questions. Takes about 30 seconds."
            iconColor={colors.accent}
            iconBg="rgba(196, 93, 62, 0.08)"
            icon={(
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l2 2" />
              </svg>
            )}
          />
        </div>
      )}

      {/* Quick Mode */}
      {(phase === 'quick-drop' || phase === 'quick-confirm') && (
        <div style={styles.phase}>
          <QuickDropZone onSubmit={handleQuickSubmit} loading={loading} />
        </div>
      )}

      {/* Guided Mode */}
      {(phase === 'guided-1' || phase === 'guided-2' || phase === 'guided-3' || phase === 'guided-4' || phase === 'guided-5') && (
        <div style={styles.phase}>
          <ClientInfoForm
            onSubmit={submitClientInfo}
            loading={loading}
            guidedStep={phase}
            onStepChange={(step: IntakePhase) => setPhase(step)}
          />
        </div>
      )}

      {/* Review */}
      {phase === 'review' && matterData && (
        <div style={styles.phase}>
          <ConfidenceSignal message="Based on 47 similar matters, we expect +1.5 average improvement across all quality dimensions." />
          <div style={{ height: 12 }} />
          <div style={styles.phaseTitle}>Pre-engagement check results</div>
          <ReviewCards
            conflictCheck={matterData.response.conflictCheck}
            kyc={matterData.response.kyc}
            onContinue={advanceToTerms}
            demoMode={demoMode}
          />
        </div>
      )}

      {/* Terms */}
      {phase === 'terms' && matterData && (
        <div style={styles.phase}>
          <div style={styles.phaseTitle}>Review and accept the engagement terms</div>
          <EngagementViewer
            letter={matterData.response.engagementLetter}
            onAccept={acceptEngagement}
            loading={loading}
          />
        </div>
      )}

      {/* Accepted */}
      {phase === 'accepted' && (
        <div style={styles.successState}>
          <div style={styles.successIcon}>{'\u2713'}</div>
          <div style={styles.successTitle}>Engagement Accepted</div>
          <div style={styles.successText}>
            Matter {matterData?.matterNumber} created. Proceeding to briefing...
          </div>
        </div>
      )}

      <div style={{ height: 80 }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', minHeight: '100vh', backgroundColor: colors.bg,
    color: colors.text, fontFamily: fonts.sans, padding: `${spacing.xxxl}px`,
    maxWidth: 800, margin: '0 auto', position: 'relative',
  },
  phase: { marginBottom: spacing.xl },
  phaseTitle: {
    fontSize: 12, fontFamily: fonts.sans, fontWeight: 500, color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md,
  },
  error: {
    fontSize: 12, fontFamily: fonts.sans, color: colors.danger,
    backgroundColor: 'rgba(196, 93, 62, 0.06)', padding: '8px 12px',
    borderRadius: radii.sm, border: `1px solid rgba(196, 93, 62, 0.15)`,
    marginBottom: spacing.md,
  },
  modeSelect: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.xl,
    marginTop: spacing.xxl,
  },
  modeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '40px 24px',
    backgroundColor: colors.bgCard,
    border: `1.5px solid ${colors.border}`,
    borderRadius: radii.sm,
    cursor: 'pointer',
    transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
    textAlign: 'center',
    fontFamily: fonts.sans,
  },
  modeIcon: { opacity: 0.5 },
  modeTitle: { fontSize: 14, fontWeight: 600, color: colors.text, letterSpacing: 1, textTransform: 'uppercase' as const },
  modeDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 1.5 },
  successState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '40vh', gap: 12,
  },
  successIcon: {
    width: 48, height: 48, borderRadius: '50%', backgroundColor: colors.success,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24, fontWeight: 700,
  },
  successTitle: { fontSize: 22, fontFamily: fonts.serif, fontWeight: 300, color: colors.text },
  successText: { fontSize: 14, fontFamily: fonts.sans, color: colors.textMuted },
};
