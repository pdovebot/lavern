/**
 * ClawView — Clawern entry. Renders the narrative ClawernHome by default;
 * users drill into the legacy tabbed dashboard via "Full dashboard →".
 *
 * Dark hero zone matches lavern.ai/claw (film grain + fog vignette).
 */

import { useState, useCallback, useEffect } from 'react';
import { fonts, spacing } from '../staffing/styles/tokens.js';
import { CLAW } from './theme.js';
import { LoadingW } from '../components/LoadingW.js';
import { useClawData } from './hooks/useClawData.js';
import { useClawDemoSimulator, type ClawLogEntry } from './hooks/useClawDemoSimulator.js';
import { ClawernHome } from './ClawernHome.js';
import { ClawHeader } from './components/ClawHeader.js';
import { CommandStrip } from './components/CommandStrip.js';
import { ClawTabBar, type ClawTab } from './components/ClawTabBar.js';
import { OverviewTab } from './components/OverviewTab.js';
import { DocumentsTab } from './components/DocumentsTab.js';
import { DeliveriesTab } from './components/DeliveriesTab.js';
import { PrecedentsTab } from './components/PrecedentsTab.js';
import { ConfigTab } from './components/ConfigTab.js';

interface Props {
  onBack: () => void;
}

type ViewMode = 'home' | 'dashboard';

export default function ClawView({ onBack }: Props) {
  const {
    status, documents, deliveries, precedents, precedentSummary,
    loading, demoMode, scanning, paused,
    triggerScan, toggleEthicalMode, togglePause,
    setStatus, setDocuments, setDeliveries,
  } = useClawData();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState<ClawTab>('overview');
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [activityLog, setActivityLog] = useState<ClawLogEntry[]>([]);

  // Auto-start demo + jump to dashboard when arriving via ?demo=true
  useEffect(() => {
    if (window.location.hash.includes('?demo=true') && !loading && status) {
      setActivityLog([]);
      setDemoPlaying(true);
      setViewMode('dashboard');
      setActiveTab('overview');
    }
  }, [loading, status]);

  useClawDemoSimulator({
    active: demoPlaying,
    onStatusUpdate: useCallback((fn: (s: any) => any) => setStatus(prev => prev ? fn(prev) : prev), [setStatus]),
    onDocumentsUpdate: setDocuments,
    onDeliveriesUpdate: setDeliveries,
    onLogEntry: useCallback((entry: ClawLogEntry) => setActivityLog(prev => [...prev, entry]), []),
    onComplete: useCallback(() => setDemoPlaying(false), []),
  });

  const handlePlayDemo = useCallback(() => {
    setActivityLog([]);
    setDemoPlaying(true);
    setViewMode('dashboard');
    setActiveTab('overview');
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.grain} />
        <div style={styles.fog} />
        <button onClick={onBack} style={styles.floatingBack} aria-label="Back">{'←'}</button>
        <div style={styles.loadingWrap}>
          <LoadingW />
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div style={styles.page}>
        <div style={styles.grain} />
        <div style={styles.fog} />
        <button onClick={onBack} style={styles.floatingBack} aria-label="Back">{'←'}</button>
        <div style={styles.container}>
          <div style={styles.errorBox}>
            Could not reach the Clawern API. Try again in a moment, or run{' '}
            <code style={styles.code}>lavern claw init</code> if you haven't set it up yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.grain} />
      <div style={styles.fog} />

      {/* Floating back — always reachable */}
      <button onClick={onBack} style={styles.floatingBack} aria-label="Back to dashboard">
        {'←'}
      </button>

      <div style={styles.container}>
        {viewMode === 'home' ? (
          <ClawernHome
            status={status}
            documents={documents}
            deliveries={deliveries}
            demoMode={demoMode}
            scanning={scanning}
            paused={paused}
            onScan={triggerScan}
            onTogglePause={togglePause}
            onOpenDashboard={() => setViewMode('dashboard')}
            onPlayDemo={handlePlayDemo}
            demoPlaying={demoPlaying}
          />
        ) : (
          <>
            {/* Back-to-home pill */}
            <div style={styles.backToHomeRow}>
              <button
                onClick={() => setViewMode('home')}
                style={styles.backToHome}
              >
                {'←'} Clawern home
              </button>
            </div>

            <ClawHeader
              company={status.profile.company}
              jurisdiction={status.profile.jurisdiction}
              industry={status.profile.industry}
              daemon={status.daemon}
              demoMode={demoMode}
              onBack={() => setViewMode('home')}
            />

            <CommandStrip
              lastScan={status.lastScan}
              scanning={scanning}
              budget={status.budget}
              onScan={triggerScan}
              paused={paused}
              onTogglePause={togglePause}
              demoMode={demoMode}
              demoPlaying={demoPlaying}
              onWatchDemo={handlePlayDemo}
              ethicalMode={status.ethicalMode}
            />

            <ClawTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              documentCount={documents.length}
              deliveryCount={deliveries.length}
              precedentCount={precedents.length}
            />

            {activeTab === 'overview' && (
              <OverviewTab
                status={status}
                documents={documents}
                deliveries={deliveries}
                demoMode={demoMode}
                activityLog={activityLog}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentsTab documents={documents} demoMode={demoMode} />
            )}
            {activeTab === 'deliveries' && (
              <DeliveriesTab deliveries={deliveries} />
            )}
            {activeTab === 'precedents' && (
              <PrecedentsTab
                precedents={precedents}
                summary={precedentSummary}
                demoMode={demoMode}
              />
            )}
            {activeTab === 'config' && (
              <ConfigTab
                profile={status.profile}
                watchPaths={status.watchPaths}
                budget={{ totalUsd: status.budget.totalUsd }}
                demoMode={demoMode}
                ethicalMode={status.ethicalMode}
                onToggleEthical={toggleEthicalMode}
                lastHeartbeat={status.lastHeartbeat}
              />
            )}

            <div style={styles.footer}>It works while you sleep.</div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: CLAW.bg,
    paddingTop: spacing.xl,
    paddingBottom: 80,
    position: 'relative',
    isolation: 'isolate',
  },
  grain: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='0.65'/%3E%3C/svg%3E")`,
    opacity: 0.18,
    pointerEvents: 'none',
    zIndex: 1,
    mixBlendMode: 'overlay',
  },
  fog: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(232,132,92,0.06) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.5) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: `0 ${spacing.lg}px`,
    position: 'relative',
    zIndex: 2,
  },
  loadingWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    position: 'relative',
    zIndex: 2,
  },
  floatingBack: {
    position: 'fixed',
    top: 24,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: `1px solid ${CLAW.border}`,
    backgroundColor: 'rgba(8,8,8,0.6)',
    backdropFilter: 'blur(12px) saturate(140%)',
    WebkitBackdropFilter: 'blur(12px) saturate(140%)',
    color: CLAW.text,
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'background-color 0.25s cubic-bezier(0.28,0.11,0.32,1), transform 0.25s cubic-bezier(0.28,0.11,0.32,1)',
  },
  backToHomeRow: {
    marginBottom: spacing.lg,
  },
  backToHome: {
    backgroundColor: CLAW.surface,
    border: `1px solid ${CLAW.border}`,
    color: CLAW.textSecondary,
    padding: '6px 14px',
    fontSize: 11,
    fontFamily: fonts.sans,
    fontWeight: 600,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    borderRadius: 999,
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  errorBox: {
    padding: spacing.lg,
    backgroundColor: CLAW.dangerBg,
    border: `1px solid ${CLAW.dangerBorder}`,
    borderRadius: 8,
    color: CLAW.danger,
    fontSize: 14,
    fontFamily: fonts.sans,
    lineHeight: 1.6,
    margin: `${spacing.xxxl}px auto`,
    maxWidth: 600,
  },
  code: {
    fontFamily: fonts.mono,
    fontSize: 13,
    backgroundColor: CLAW.dangerBg,
    color: CLAW.danger,
    padding: '1px 6px',
    borderRadius: 3,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fonts.serif,
    color: CLAW.textMuted,
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    letterSpacing: 0.3,
  },
};
