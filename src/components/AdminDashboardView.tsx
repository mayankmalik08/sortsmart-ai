import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';
import { DEMO_ADMIN_ANALYTICS } from '../data/seedData';
import type { WasteScanRecord } from '../types/sortsmart';
import { computeDashboardMetrics } from '../utils/wasteLogic';
import { DonutBreakdownChart, DualBarChart } from './Charts';

interface AdminDashboardViewProps {
  scans: WasteScanRecord[];
  bonusChallengePoints: number;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  scans,
  bonusChallengePoints,
}) => {
  const [timeframe, setTimeframe] = React.useState<'daily' | 'weekly'>('daily');
  const localMetrics = computeDashboardMetrics(scans, bonusChallengePoints);

  const totalScansCombined =
    DEMO_ADMIN_ANALYTICS.totalCampusScans + Math.max(0, localMetrics.totalScans - 5);
  const totalPointsCombined =
    DEMO_ADMIN_ANALYTICS.totalPointsDistributed +
    Math.max(0, localMetrics.totalPoints - 100);

  const chartData =
    timeframe === 'daily'
      ? DEMO_ADMIN_ANALYTICS.dailyActivity.map((d) => ({
          label: d.day,
          primary: d.scans,
          secondary: d.recycled,
        }))
      : DEMO_ADMIN_ANALYTICS.weeklyActivity.map((w) => ({
          label: w.week,
          primary: w.scans,
          secondary: Math.round(w.scans * (w.participationPct / 100)),
        }));

  return (
    <div className="space-y-6">
      {/* Demo Data Banner */}
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-sky-50/90 border border-sky-200 text-xs text-sky-950">
        <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
        <p>
          <strong>Institutional Analytics (Demo Data):</strong> Campus-wide metrics,
          zone reports, and hostel participation statistics below represent realistic
          demonstration data for institutional review, augmented by your local scan
          session.
        </p>
      </div>

      {/* 4 Institutional KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">
            Registered Campus Users
          </div>
          <div className="mt-2 text-3xl font-display font-bold text-[#172B35] tabular-nums">
            {DEMO_ADMIN_ANALYTICS.totalRegisteredUsers.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#475569]">
            Students &amp; hostel staff (Demo)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">Total Waste Scans</div>
          <div className="mt-2 text-3xl font-display font-bold text-[#172B35] tabular-nums">
            {totalScansCombined.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#475569]">
            Across 14 hostel &amp; academic zones
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">
            Active Participation Rate
          </div>
          <div className="mt-2 text-3xl font-display font-bold text-[#16A36A] tabular-nums">
            {DEMO_ADMIN_ANALYTICS.activeParticipationPct}%
          </div>
          <div className="mt-1 text-xs text-[#475569]">
            Weekly active student sorters
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-[#475569]">
            Green Points Distributed
          </div>
          <div className="mt-2 text-3xl font-display font-bold text-[#172B35] tabular-nums">
            {totalPointsCombined.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#475569]">
            Prototype reward points issued
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-display font-semibold text-[#172B35]">
                Campus Waste Activity Trends (Demo)
              </h3>
              <p className="text-xs text-[#475569] mt-0.5">
                {timeframe === 'daily'
                  ? 'Daily total scans vs. verified recyclable recovery'
                  : 'Weekly campus scan volume vs. active participation share'}
              </p>
            </div>

            <div
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
              role="group"
              aria-label="Activity timeframe"
            >
              <button
                type="button"
                onClick={() => setTimeframe('daily')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  timeframe === 'daily'
                    ? 'bg-white text-[#172B35] shadow-sm'
                    : 'text-[#475569] hover:text-[#172B35]'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  timeframe === 'weekly'
                    ? 'bg-white text-[#172B35] shadow-sm'
                    : 'text-[#475569] hover:text-[#172B35]'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          <DualBarChart
            data={chartData}
            primaryLabel="Total Scans"
            secondaryLabel={
              timeframe === 'daily' ? 'Recycled Items' : 'Active Target Volume'
            }
            primaryColor="#16A36A"
            secondaryColor="#38BDF8"
          />
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-display font-semibold text-[#172B35]">
              Category-Wise Waste Distribution (Demo)
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">
              Share of campus scans across the 5 segregation streams
            </p>
          </div>

          <DonutBreakdownChart
            segments={DEMO_ADMIN_ANALYTICS.categoryDistribution.map((c) => ({
              label: c.category,
              value: c.count,
              percentage: c.percentage,
              colorHex: c.colorHex,
            }))}
            centerValue={DEMO_ADMIN_ANALYTICS.totalCampusScans.toLocaleString()}
            centerCaption="Demo Scans"
          />
        </div>
      </section>

      {/* Most Active Participants & Recent Reports */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-display font-semibold text-[#172B35]">
              Most Active Participants (Demo)
            </h3>
            <span className="text-xs text-[#475569]">Top campus sorters</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-[#475569] bg-slate-50/70">
                  <th className="py-3 px-6">Participant</th>
                  <th className="py-3 px-4 text-right">Scans</th>
                  <th className="py-3 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {DEMO_ADMIN_ANALYTICS.topParticipants.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-[#172B35]">{p.name}</div>
                      <div className="text-xs text-[#475569]">{p.department}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-[#475569]">
                      {p.scans}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono tabular-nums text-xs font-semibold text-[#16A36A]">
                      {p.points.toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-display font-semibold text-[#172B35]">
              Recent Campus Reports (Demo)
            </h3>
            <span className="text-xs text-[#475569]">Bin &amp; pickup alerts</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {DEMO_ADMIN_ANALYTICS.recentReports.map((rep) => (
              <li key={rep.id} className="p-5 flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-semibold text-[#172B35]">
                    {rep.zone}
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {rep.issue}
                  </p>
                  <div className="text-[11px] text-slate-400">
                    {rep.category} · {rep.reportedAt}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 whitespace-nowrap ${
                    rep.status === 'Resolved'
                      ? 'text-[#16A36A]'
                      : rep.status === 'In Review'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                  }`}
                >
                  {rep.status === 'Resolved' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : rep.status === 'In Review' ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {rep.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
