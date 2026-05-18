/**
 * AgentDetailModal — Full agent profile viewer.
 *
 * Opens on agent card click. Shows everything: large avatar, full tagline,
 * 8-axis radar at full size, personality bars, all strengths/limitations
 * unclamped, work style quote, critical rules + success metrics (data
 * that doesn't even appear on the card), and a select/deselect CTA.
 *
 * Closes on: backdrop click, X button, Escape key.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SkillRadar } from './SkillRadar.js';
import { PersonalityBars } from './PersonalityBars.js';
import { CostTierBadge } from './CostTierBadge.js';
import { SeniorityBadge } from './SeniorityBadge.js';
import { colors, fonts, radii, spacing, shadows, categoryColor } from '../styles/tokens.js';
import type { AgentProfile } from '../hooks/useAgentProfiles.js';

interface Props {
  profile: AgentProfile | null;
  selected: boolean;
  onClose: () => void;
  onToggle: (role: string) => void;
}

function avatarUrl(seed: string, extra?: string): string {
  const base = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;
  return extra ? `${base}&${extra}` : base;
}

export function AgentDetailModal({ profile, selected, onClose, onToggle }: Props) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Mount/unmount transition state
  useEffect(() => {
    if (profile) {
      // Trigger enter animation on next frame
      const t = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(t);
    } else {
      setMounted(false);
    }
  }, [profile]);

  // Reset avatar error state when switching profiles
  useEffect(() => { setImgError(false); }, [profile?.role]);

  // Escape key closes
  useEffect(() => {
    if (!profile) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [profile, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!profile) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [profile]);

  if (!profile) return null;

  const cat = categoryColor(profile.category);
  const initials = profile.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${profile.displayName} — full profile`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: mounted ? 'rgba(20, 18, 14, 0.55)' : 'rgba(20, 18, 14, 0)',
        backdropFilter: mounted ? 'blur(8px) saturate(140%)' : 'blur(0px)',
        WebkitBackdropFilter: mounted ? 'blur(8px) saturate(140%)' : 'blur(0px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        transition: 'background-color 0.3s cubic-bezier(0.28,0.11,0.32,1), backdrop-filter 0.3s cubic-bezier(0.28,0.11,0.32,1)',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 760,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          backgroundColor: colors.bgCard,
          borderRadius: radii.xl,
          boxShadow: shadows.xl,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
          transition: 'opacity 0.35s cubic-bezier(0.28,0.11,0.32,1), transform 0.4s cubic-bezier(0.28,0.11,0.32,1)',
        }}
      >
        {/* Close button — top right */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={styles.closeBtn}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.bgPanel; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {'✕'}
        </button>

        {/* Header — avatar + name */}
        <div style={styles.header}>
          <div style={styles.avatarWrap}>
            {imgError ? (
              <div style={styles.initials}>{initials}</div>
            ) : (
              <img
                src={avatarUrl(profile.displayName, profile.avatarExtra)}
                alt={profile.displayName}
                width={120}
                height={120}
                onError={() => setImgError(true)}
                style={{ display: 'block', width: 120, height: 120 }}
              />
            )}
          </div>

          <div style={styles.headerText}>
            <div style={styles.headerBadges}>
              <CostTierBadge tier={profile.costTier} />
              <SeniorityBadge seniority={profile.seniority} />
              <span style={{ ...styles.categoryTag, color: cat, borderColor: `${cat}33`, backgroundColor: `${cat}0D` }}>
                {profile.category}
              </span>
            </div>
            <h2 style={styles.name}>{profile.displayName}</h2>
            <div style={styles.archetype}>{profile.personality.archetype}</div>
            <p style={styles.tagline}>{profile.tagline}</p>
          </div>
        </div>

        {/* Skills + personality side-by-side */}
        <div style={styles.statsRow}>
          <section style={styles.statsCol}>
            <div style={styles.eyebrow}>Skill profile</div>
            <div style={{ marginLeft: -12 }}>
              <SkillRadar skills={profile.skills} costTier={profile.costTier} size={200} />
            </div>
          </section>
          <section style={styles.statsCol}>
            <div style={styles.eyebrow}>Personality</div>
            {profile.personality.traits && Object.keys(profile.personality.traits).length > 0 ? (
              <PersonalityBars traits={profile.personality.traits} />
            ) : (
              <div style={styles.muted}>No trait data</div>
            )}
          </section>
        </div>

        {/* Practice areas */}
        {profile.practiceAreas.length > 0 && (
          <section style={styles.section}>
            <div style={styles.eyebrow}>Practice areas</div>
            <div style={styles.pillRow}>
              {profile.practiceAreas.map(area => (
                <span key={area} style={{ ...styles.pill, color: cat, backgroundColor: `${cat}0D`, borderColor: `${cat}22` }}>{area}</span>
              ))}
            </div>
          </section>
        )}

        {/* Strengths */}
        {profile.strengths.length > 0 && (
          <section style={styles.section}>
            <div style={{ ...styles.eyebrow, color: colors.success }}>Strengths</div>
            <ul style={styles.list}>
              {profile.strengths.map((s, i) => (
                <li key={i} style={styles.listItem}>
                  <span style={{ ...styles.listBullet, color: colors.success }}>{'✓'}</span>
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Limitations */}
        {profile.limitations.length > 0 && (
          <section style={styles.section}>
            <div style={{ ...styles.eyebrow, color: colors.warning }}>Limitations</div>
            <ul style={styles.list}>
              {profile.limitations.map((l, i) => (
                <li key={i} style={styles.listItem}>
                  <span style={{ ...styles.listBullet, color: colors.warning }}>{'⚠'}</span>
                  {l}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Critical rules (if present) */}
        {profile.criticalRules && profile.criticalRules.length > 0 && (
          <section style={styles.section}>
            <div style={styles.eyebrow}>Critical rules</div>
            <ul style={styles.list}>
              {profile.criticalRules.map((r, i) => (
                <li key={i} style={styles.listItem}>
                  <span style={styles.listBullet}>{'•'}</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Success metrics (if present) */}
        {profile.successMetrics && profile.successMetrics.length > 0 && (
          <section style={styles.section}>
            <div style={styles.eyebrow}>How success is measured</div>
            <ul style={styles.list}>
              {profile.successMetrics.map((m, i) => (
                <li key={i} style={styles.listItem}>
                  <span style={styles.listBullet}>{'•'}</span>
                  {m}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Work style quote */}
        {profile.personality.workStyle && (
          <section style={{ ...styles.section, ...styles.quoteSection }}>
            <div style={styles.eyebrow}>Work style</div>
            <blockquote style={styles.quote}>
              &ldquo;{profile.personality.workStyle}&rdquo;
            </blockquote>
          </section>
        )}

        {/* Footer — billing rate + select CTA */}
        <div style={styles.footer}>
          <div style={styles.rate}>
            <span style={styles.rateValue}>${profile.billingRateUsd.toLocaleString()}</span>
            <span style={styles.rateUnit}>/hr</span>
          </div>
          <button
            onClick={() => { onToggle(profile.role); }}
            style={{
              ...styles.cta,
              backgroundColor: selected ? 'transparent' : colors.text,
              color: selected ? colors.text : '#fff',
              borderColor: colors.text,
              boxShadow: selected
                ? 'none'
                : '0 1px 2px rgba(20,18,14,0.12), 0 8px 24px rgba(20,18,14,0.10), 0 24px 56px rgba(20,18,14,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {selected ? `✓ On the team` : `Add to team →`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const styles: Record<string, React.CSSProperties> = {
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    color: colors.textMuted,
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.25s cubic-bezier(0.28,0.11,0.32,1)',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    gap: spacing.xl,
    padding: `${spacing.xxl}px ${spacing.xxl}px ${spacing.lg}px`,
    alignItems: 'flex-start',
    borderBottom: `1px solid ${colors.border}`,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: colors.bgPanel,
    border: `2px solid ${colors.border}`,
    flexShrink: 0,
  },
  initials: {
    width: 120,
    height: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: colors.textMuted,
    backgroundColor: colors.bgPanel,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.xl,
  },
  headerBadges: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryTag: {
    fontSize: 10.5,
    fontFamily: fonts.sans,
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: radii.pill,
    border: '1px solid',
    textTransform: 'capitalize',
    letterSpacing: 0.2,
  },
  name: {
    fontSize: 28,
    fontFamily: fonts.serif,
    fontWeight: 500,
    color: colors.text,
    margin: 0,
    lineHeight: 1.15,
    letterSpacing: -0.4,
  },
  archetype: {
    fontSize: 12,
    fontFamily: fonts.sans,
    fontWeight: 500,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.textMuted,
    margin: `${spacing.md}px 0 0`,
    lineHeight: 1.55,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.xl,
    padding: `${spacing.xl}px ${spacing.xxl}px`,
    borderBottom: `1px solid ${colors.border}`,
  },
  statsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    minWidth: 0,
  },
  section: {
    padding: `${spacing.lg}px ${spacing.xxl}px`,
    borderBottom: `1px solid ${colors.border}`,
  },
  quoteSection: {
    backgroundColor: 'rgba(20, 18, 14, 0.02)',
  },
  eyebrow: {
    fontSize: 10.5,
    fontFamily: fonts.sans,
    fontWeight: 600,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: radii.pill,
    border: '1px solid',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  listItem: {
    fontSize: 13.5,
    fontFamily: fonts.sans,
    color: colors.textSecondary,
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  listBullet: {
    flexShrink: 0,
    fontWeight: 600,
    marginTop: 1,
  },
  muted: {
    fontSize: 12,
    color: colors.textDim,
  },
  quote: {
    fontSize: 15,
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    lineHeight: 1.55,
    margin: 0,
    paddingLeft: spacing.lg,
    borderLeft: `2px solid ${colors.border}`,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.lg}px ${spacing.xxl}px ${spacing.xl}px`,
    gap: spacing.lg,
    position: 'sticky',
    bottom: 0,
    backgroundColor: colors.bgCard,
  },
  rate: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  rateValue: {
    fontSize: 26,
    fontFamily: fonts.serif,
    fontWeight: 400,
    color: colors.text,
  },
  rateUnit: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.textMuted,
  },
  cta: {
    padding: '12px 24px',
    borderRadius: radii.pill,
    border: '2px solid',
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background-color 0.25s cubic-bezier(0.28,0.11,0.32,1), color 0.25s cubic-bezier(0.28,0.11,0.32,1), box-shadow 0.3s cubic-bezier(0.28,0.11,0.32,1), transform 0.3s cubic-bezier(0.28,0.11,0.32,1)',
  },
};
