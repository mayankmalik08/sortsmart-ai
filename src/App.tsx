import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AdminDashboardView } from './components/AdminDashboardView';
import { DashboardView } from './components/DashboardView';
import { DisposalGuideView } from './components/DisposalGuideView';
import { LayoutShell } from './components/LayoutShell';
import { ProfileView } from './components/ProfileView';
import { RewardsView } from './components/RewardsView';
import { WasteScannerView } from './components/WasteScannerView';
import {
  DEFAULT_STUDENT_PROFILE,
  INITIAL_ACHIEVEMENTS,
  INITIAL_CHALLENGES,
  INITIAL_SCANS,
} from './data/seedData';
import type {
  AchievementBadge,
  AppPage,
  EcoChallenge,
  StudentProfile,
  WasteScanRecord,
} from './types/sortsmart';
import {
  applyScanToChallenges,
  computeDashboardMetrics,
} from './utils/wasteLogic';

const STORAGE_KEY = 'sortsmart_ai_prototype_v1';

interface PersistedState {
  profile: StudentProfile;
  scans: WasteScanRecord[];
  challenges: EcoChallenge[];
  achievements: AchievementBadge[];
  claimedScanHashes: string[];
  bonusChallengePoints: number;
}

function getInitialState(): PersistedState {
  const fallback: PersistedState = {
    profile: DEFAULT_STUDENT_PROFILE,
    scans: INITIAL_SCANS,
    challenges: INITIAL_CHALLENGES,
    achievements: INITIAL_ACHIEVEMENTS,
    claimedScanHashes: INITIAL_SCANS.map((s) => s.scanHash),
    bonusChallengePoints: 0,
  };

  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!Array.isArray(parsed.scans) || !parsed.profile) return fallback;
    return {
      profile: parsed.profile,
      scans: parsed.scans,
      challenges: Array.isArray(parsed.challenges)
        ? parsed.challenges
        : INITIAL_CHALLENGES,
      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements
        : INITIAL_ACHIEVEMENTS,
      claimedScanHashes: Array.isArray(parsed.claimedScanHashes)
        ? parsed.claimedScanHashes
        : fallback.claimedScanHashes,
      bonusChallengePoints:
        typeof parsed.bonusChallengePoints === 'number'
          ? parsed.bonusChallengePoints
          : 0,
    };
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activePage, setActivePage] = React.useState<AppPage>('dashboard');
  const [state, setState] = React.useState<PersistedState>(getInitialState);
  const [geminiConfigured, setGeminiConfigured] = React.useState<boolean | null>(
    null
  );
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues in constrained environments
    }
  }, [state]);

  React.useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && typeof data.geminiConfigured === 'boolean') {
          setGeminiConfigured(data.geminiConfigured);
        } else if (active) {
          setGeminiConfigured(false);
        }
      })
      .catch(() => {
        if (active) setGeminiConfigured(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const showToast = React.useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3800);
  }, []);

  const metrics = computeDashboardMetrics(
    state.scans,
    state.bonusChallengePoints
  );

  const handleConfirmDisposal = (scan: WasteScanRecord) => {
    setState((prev) => {
      if (prev.claimedScanHashes.includes(scan.scanHash)) {
        return prev;
      }

      const nextScans = [scan, ...prev.scans];
      const nextChallenges = applyScanToChallenges(prev.challenges, scan.category);
      const nextMetrics = computeDashboardMetrics(
        nextScans,
        prev.bonusChallengePoints
      );

      const hasEwasteOrHazard = nextScans.some(
        (s) => s.category === 'E-waste' || s.category === 'Hazardous waste'
      );

      const nextAchievements = prev.achievements.map((badge) => {
        if (badge.unlocked) return badge;
        if (badge.id === 'badge-first-scan' && nextScans.length >= 1) {
          return { ...badge, unlocked: true, unlockedAt: 'Today' };
        }
        if (badge.id === 'badge-five-streak' && nextScans.length >= 5) {
          return { ...badge, unlocked: true, unlockedAt: 'Today' };
        }
        if (badge.id === 'badge-ewaste-guardian' && hasEwasteOrHazard) {
          return { ...badge, unlocked: true, unlockedAt: 'Today' };
        }
        if (badge.id === 'badge-eco-explorer' && nextMetrics.totalPoints >= 200) {
          return { ...badge, unlocked: true, unlockedAt: 'Today' };
        }
        return badge;
      });

      return {
        ...prev,
        scans: nextScans,
        challenges: nextChallenges,
        achievements: nextAchievements,
        claimedScanHashes: [...prev.claimedScanHashes, scan.scanHash],
      };
    });
    showToast(`Disposal confirmed: +${scan.pointsAwarded} Green Points earned.`);
  };

  const handleClaimChallenge = (challengeId: string) => {
    let awarded = 0;
    setState((prev) => {
      const target = prev.challenges.find((c) => c.id === challengeId);
      if (!target || !target.completed || target.claimed) return prev;
      awarded = target.rewardPoints;
      const nextBonus = prev.bonusChallengePoints + target.rewardPoints;
      const nextMetrics = computeDashboardMetrics(prev.scans, nextBonus);

      const nextAchievements = prev.achievements.map((badge) =>
        badge.id === 'badge-eco-explorer' &&
        !badge.unlocked &&
        nextMetrics.totalPoints >= 200
          ? { ...badge, unlocked: true, unlockedAt: 'Today' }
          : badge
      );

      return {
        ...prev,
        challenges: prev.challenges.map((c) =>
          c.id === challengeId ? { ...c, claimed: true } : c
        ),
        achievements: nextAchievements,
        bonusChallengePoints: nextBonus,
      };
    });

    if (awarded > 0) {
      showToast(`Challenge reward claimed: +${awarded} Green Points.`);
    }
  };

  const handleUpdateProfile = (nextProfile: StudentProfile) => {
    setState((prev) => ({
      ...prev,
      profile: nextProfile,
    }));
    showToast('Profile details updated.');
  };

  const handleResetDemo = () => {
    const fresh: PersistedState = {
      profile: DEFAULT_STUDENT_PROFILE,
      scans: INITIAL_SCANS,
      challenges: INITIAL_CHALLENGES,
      achievements: INITIAL_ACHIEVEMENTS,
      claimedScanHashes: INITIAL_SCANS.map((s) => s.scanHash),
      bonusChallengePoints: 0,
    };
    setState(fresh);
    showToast('Demo data restored to initial baseline.');
  };

  const handleNavigate = (page: AppPage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <LayoutShell
        activePage={activePage}
        onNavigate={handleNavigate}
        totalPoints={metrics.totalPoints}
        profile={state.profile}
        geminiConfigured={geminiConfigured}
        onResetDemo={handleResetDemo}
      >
        {activePage === 'dashboard' && (
          <DashboardView
            profile={state.profile}
            scans={state.scans}
            challenges={state.challenges}
            bonusChallengePoints={state.bonusChallengePoints}
            onNavigate={handleNavigate}
            onClaimChallenge={handleClaimChallenge}
          />
        )}

        {activePage === 'scanner' && (
          <WasteScannerView
            geminiConfigured={geminiConfigured}
            claimedScanHashes={state.claimedScanHashes}
            onConfirmDisposal={handleConfirmDisposal}
          />
        )}

        {activePage === 'guide' && <DisposalGuideView />}

        {activePage === 'rewards' && (
          <RewardsView
            profile={state.profile}
            scans={state.scans}
            challenges={state.challenges}
            achievements={state.achievements}
            bonusChallengePoints={state.bonusChallengePoints}
            onClaimChallenge={handleClaimChallenge}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'profile' && (
          <ProfileView
            profile={state.profile}
            scans={state.scans}
            achievements={state.achievements}
            bonusChallengePoints={state.bonusChallengePoints}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activePage === 'admin' && (
          <AdminDashboardView
            scans={state.scans}
            bonusChallengePoints={state.bonusChallengePoints}
          />
        )}
      </LayoutShell>

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#172B35] text-white text-xs sm:text-sm font-medium shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4 text-[#A3E635] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
