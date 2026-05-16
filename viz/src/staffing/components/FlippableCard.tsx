/**
 * FlippableCard — Agent tile that opens a full-detail modal on click.
 *
 * Note: kept the file name for backward compat. The original flip behavior
 * was replaced with a modal viewer (AgentDetailModal) that shows the full
 * profile — all strengths, limitations, work style, critical rules,
 * success metrics — without the line-clamp truncation the card has.
 *
 * Interactions:
 *   - Click card body → open detail modal
 *   - Click + button → toggle team membership (stops propagation)
 *   - Hover → light sweep + lift
 */

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { AgentCard } from './AgentCard.js';
import { AgentDetailModal } from './AgentDetailModal.js';
import { colors, radii, shadows } from '../styles/tokens.js';
import { injectHolographicStyles } from '../styles/holographic.js';
import type { AgentProfile } from '../hooks/useAgentProfiles.js';

interface Props {
  profile: AgentProfile;
  selected: boolean;
  onToggle: (role: string) => void;
  onFlipSound?: () => void;
  onSelectSound?: () => void;
}

export function FlippableCard({ profile, selected, onToggle, onFlipSound, onSelectSound }: Props) {
  const [isViewing, setIsViewing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    injectHolographicStyles();
  }, []);

  const handleOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsViewing(true);
    onFlipSound?.();
  }, [onFlipSound]);

  const handleClose = useCallback(() => {
    setIsViewing(false);
  }, []);

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(profile.role);
    onSelectSound?.();
  }, [onToggle, profile.role, onSelectSound]);

  return (
    <>
      <motion.div
        style={{
          width: 220,
          height: 460,
          cursor: 'pointer',
        }}
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.95 },
          visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
        }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsViewing(true); } }}
        aria-label={`View full profile for ${profile.displayName}`}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: radii.lg,
            backgroundColor: colors.bgCard,
            overflow: 'hidden',
            border: `1px solid ${selected ? colors.text : isHovered ? colors.borderHover : colors.border}`,
            boxShadow: selected
              ? shadows.selected
              : isHovered
                ? shadows.lg
                : shadows.sm,
            transition: 'border-color 0.25s cubic-bezier(0.28,0.11,0.32,1), box-shadow 0.35s cubic-bezier(0.28,0.11,0.32,1), transform 0.35s cubic-bezier(0.28,0.11,0.32,1)',
          }}
        >
          <AgentCard profile={profile} selected={selected} />

          {/* Subtle light sweep on hover */}
          {isHovered && !selected && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: radii.lg,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 65%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'holoShimmer 1s ease-in-out',
              animationIterationCount: '1',
              pointerEvents: 'none',
            }} />
          )}

          {/* Select button */}
          <button
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: `1.5px solid ${selected ? colors.text : colors.border}`,
              backgroundColor: selected ? colors.text : 'rgba(255,255,255,0.8)',
              color: selected ? '#fff' : colors.textMuted,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
              backdropFilter: 'blur(4px)',
            }}
            onClick={handleSelect}
            aria-label={selected ? `Remove ${profile.displayName} from team` : `Add ${profile.displayName} to team`}
            title={selected ? 'Remove from team' : 'Add to team'}
          >
            {selected ? '✓' : '+'}
          </button>
        </div>
      </motion.div>

      <AgentDetailModal
        profile={isViewing ? profile : null}
        selected={selected}
        onClose={handleClose}
        onToggle={onToggle}
      />
    </>
  );
}
