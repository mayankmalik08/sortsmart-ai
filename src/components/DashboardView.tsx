import React from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Leaf,
  Recycle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type {
  AppPage,
  EcoChallenge,
  StudentProfile,
  WasteCategory,
  WasteScanRecord,
} from '../types/sortsmart';
import { calculateRewardTier, computeDashboardMetrics } from '../utils/wasteLogic';
import { getCategoryVisuals } from '../utils/categoryTheme';
import { DualBarChart } from './Charts';

interface DashboardViewProps {
  profile: StudentProfile;
  scans: WasteScanRecord[];
  challenges: EcoChallenge[];
  bonusChallengePoints: number;
  onNavigate: (page: AppPage) => void;
  onClaimChallenge: (challengeId: string) => void;
}

const WEEKLY_STUDENT_TREND = [
  { label: 'Mon', primary: 2, secondary: 2 },
  { label: 'Tue', primary: 3, secondary: 2 },
  { label: 'Wed', primary: 1, secondary: 1 },
  { label: 'Thu', primary: 4, secondary: 3 },
  { label: 'Fri', primary: 3, secondary: 3 },
  { label: 'Sat', primary: 2, secondary: 1 },
  { label: 'Sun', primary: 2, secondary: 2 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  scans,
  challenges,
  bonusChallengePoints,
  onNavigate,
  onClaimChallenge,
}) => {
  const metrics = computeDashboardMetrics(scans, bonusChallengePoints);
  const tierInfo = calculateRewardTier(metrics.totalPoints);
  const featuredChallenge =
    challenges.find((c) => !c.claimed) ?? challenges[0];

  const todayScansCount = scans.filter((s) => s.timestamp.startsWith('2026-11-15')).length;
  const chartData = WEEKLY_STUDENT_TREND.map((item, idx) =>
    idx === 6
      ? {
          ...item,
          primary: Math.max(item.primary, todayScansCount),
          secondary: Math.max(
            item.secondary,
            scans.filter(
              (s) =>
                s.timestamp.startsWith('2026-11-15') &&
                (s.category === 'Recyclable waste' || s.category === 'E-waste')
            ).length
          ),
        }
      : item
  );

  const categoryEntries: Array<{ category: WasteCategory; count: number }> = [
    { category: 'Recyclable waste', count: metrics.categoryCounts['Recyclable waste'] },
    { category: 'Wet waste', count: metrics.categoryCounts['Wet waste'] },
    { category: 'Dry waste', count: metrics.categoryCounts['Dry waste'] },
    { category: 'E-waste', count: metrics.categoryCounts['E-waste'] },
    { category: 'Hazardous waste', count: metrics.categoryCounts['Hazardous waste'] },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Focal Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-medium text-[#16A36A]">
            {profile.institution} · {profile.campusZone}
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#172B35] tracking-tight text-balance">
            Welcome back, {profile.name.split(' ')[0]}
          </h2>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Scan waste items before disposal to route them into the right campus bin,
            prevent recycling contamination, and track your Green Points.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('scanner')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#16A36A] hover:bg-[#138A59] text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Waste</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('guide')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#172B35] text-sm font-medium transition-colors whitespace-nowrap"
          >
            <span>Disposal Guide</span>
            <ArrowRight className="w-4 h-4 text-[#475569]" />
          </button>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section aria-label="Personal sustainability metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">Total Items Scanned</div>
          <div className="mt-2 text-3xl font-display font-bold text-[#172B35] tabular-nums">
            {metrics.totalScans}
          </div>
          <div className="mt-1 text-xs text-[#475569]">
            Verified campus disposals
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">Green Points Earned</div>
          <div className="mt-2 text-3xl font-display font-bold text-[#16A36A] tabular-nums">
            {metrics.totalPoints.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#475569]">
            Prototype sustainability score
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">Diversion &amp; Recovery</div>
          <div className="mt-2 text-3xl font-display font-bold text-[#172B35] tabular-nums">
            {metrics.recyclingRatePct}%
          </div>
          <div className="mt-1 text-xs text-[#475569]">
            {metrics.recyclableAndDryCount} dry, recyclable &amp; e-waste items
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">Sustainability Tier</div>
          <div className="mt-2 text-xl font-display font-bold text-[#172B35]">
            {tierInfo.currentTier}
          </div>
          <div className="mt-2 text-xs text-[#475569] tabular-nums">
            {tierInfo.nextTier
              ? `${tierInfo.pointsToNext} pts to ${tierInfo.nextTier}`
              : 'Top tier unlocked'}
          </div>
        </div>
      </section>

      {/* Main Split: Activity Chart & Daily Challenge */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-base font-display font-semibold text-[#172B35]">
                Recycling &amp; Sorting Activity
              </h3>
              <p className="text-xs text-[#475569] mt-0.5">
                7-day sorting log combining demo baseline and today&apos;s live scans
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="text-xs font-medium text-[#16A36A] hover:underline self-start sm:self-auto whitespace-nowrap"
            >
              View Campus Analytics
            </button>
          </div>

          <DualBarChart
            data={chartData}
            primaryLabel="Items Scanned"
            secondaryLabel="Recycled / E-Waste"
            primaryColor="#16A36A"
            secondaryColor="#A3E635"
          />

          <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {categoryEntries.map((entry) => {
              const visuals = getCategoryVisuals(entry.category);
              return (
                <div key={entry.category} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                    <span
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ backgroundColor: visuals.accentHex }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{entry.category}</span>
                  </div>
                  <div className="text-lg font-display font-bold text-[#172B35] tabular-nums">
                    {entry.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Sustainability Challenge */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#16A36A]">
                Daily Sustainability Challenge
              </span>
              <span className="text-xs font-mono tabular-nums text-[#475569]">
                +{featuredChallenge.rewardPoints} pts
              </span>
            </div>

            <div>
              <h3 className="text-lg font-display font-semibold text-[#172B35]">
                {featuredChallenge.title}
              </h3>
              <p className="mt-1 text-sm text-[#475569] leading-relaxed">
                {featuredChallenge.description}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#475569] tabular-nums">
                <span>Progress</span>
                <span className="font-mono font-semibold text-[#172B35]">
                  {featuredChallenge.currentCount} / {featuredChallenge.targetCount}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#16A36A] transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (featuredChallenge.currentCount /
                          Math.max(1, featuredChallenge.targetCount)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            {featuredChallenge.completed && !featuredChallenge.claimed ? (
              <button
                type="button"
                onClick={() => onClaimChallenge(featuredChallenge.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#16A36A] hover:bg-[#138A59] text-white text-sm font-semibold transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Claim +{featuredChallenge.rewardPoints} Bonus Points</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('scanner')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#172B35] hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {featuredChallenge.claimed ? 'Challenge Claimed · Scan More' : 'Complete via AI Scanner'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('rewards')}
              className="w-full text-center text-xs font-medium text-[#475569] hover:text-[#172B35] py-1"
            >
              View all challenges &amp; leaderboard
            </button>
          </div>
        </div>
      </section>

      {/* Recent Scanning History */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-display font-semibold text-[#172B35]">
              Recent Scanning History
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">
              Demo baseline entries combined with your newly verified scans
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('scanner')}
            className="text-xs font-semibold text-[#16A36A] hover:underline whitespace-nowrap shrink-0"
          >
            + New Scan
          </button>
        </div>

        {scans.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Recycle className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-[#172B35]">
              No waste scans recorded yet
            </div>
            <p className="text-xs text-[#475569] max-w-md mx-auto">
              Upload a photo or capture a waste item to classify it with AI and start
              earning Green Points.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16A36A] text-white text-xs font-semibold"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Your First Item</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-[#475569] bg-slate-50/70">
                  <th className="py-3 px-6">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 hidden md:table-cell">Recommended Bin</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Source</th>
                  <th className="py-3 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {scans.slice(0, 6).map((scan) => {
                  const visuals = getCategoryVisuals(scan.category);
                  const dateLabel = new Date(scan.timestamp).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <tr key={scan.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {scan.thumbnailUrl ? (
                            <img
                              src={scan.thumbnailUrl}
                              alt={scan.item}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-[#475569]">
                              {scan.category === 'Wet waste' ? (
                                <Leaf className="w-4 h-4 text-[#16A36A]" />
                              ) : scan.category === 'Hazardous waste' ? (
                                <ShieldAlert className="w-4 h-4 text-rose-600" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-sky-600" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-[#172B35] truncate max-w-[220px] sm:max-w-xs">
                              {scan.item}
                            </div>
                            <div className="text-xs text-[#475569] tabular-nums">
                              {dateLabel}
                              {scan.manualOverride ? ' · Manual override' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-[#172B35]">
                          <span
                            className="w-2 h-2 rounded-sm shrink-0"
                            style={{ backgroundColor: visuals.accentHex }}
                            aria-hidden="true"
                          />
                          {scan.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#475569] hidden md:table-cell">
                        {scan.recommendedBin}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#475569] hidden sm:table-cell whitespace-nowrap">
                        {scan.sourceMode === 'live-ai'
                          ? 'Live AI'
                          : scan.sourceMode === 'demo-sample'
                            ? 'Demo sample'
                            : 'Manual entry'}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono tabular-nums text-xs font-semibold text-[#16A36A] whitespace-nowrap">
                        +{scan.pointsAwarded} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
