import React from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  Camera,
  LayoutDashboard,
  RotateCcw,
  User,
} from 'lucide-react';
import type { AppPage, StudentProfile } from '../types/sortsmart';
import { BrandMark } from './BrandMark';

interface LayoutShellProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  totalPoints: number;
  profile: StudentProfile;
  geminiConfigured: boolean | null;
  onResetDemo: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{
  id: AppPage;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Overview', shortLabel: 'Home', icon: LayoutDashboard },
  { id: 'scanner', label: 'AI Scanner', shortLabel: 'Scan', icon: Camera },
  { id: 'guide', label: 'Disposal Guide', shortLabel: 'Guide', icon: BookOpen },
  { id: 'rewards', label: 'Green Points', shortLabel: 'Points', icon: Award },
  { id: 'profile', label: 'Profile', shortLabel: 'Profile', icon: User },
  { id: 'admin', label: 'Admin Analytics', shortLabel: 'Admin', icon: BarChart3 },
];

const PAGE_TITLES: Record<AppPage, string> = {
  dashboard: 'Sustainability Overview',
  scanner: 'AI Waste Scanner',
  guide: 'Smart Disposal Guide',
  rewards: 'Green Points & Rewards',
  profile: 'Student Profile',
  admin: 'Institutional Admin Dashboard',
};

export const LayoutShell: React.FC<LayoutShellProps> = ({
  activePage,
  onNavigate,
  totalPoints,
  profile,
  geminiConfigured,
  onResetDemo,
  children,
}) => {
  const [avatarError, setAvatarError] = React.useState(false);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#172B35]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-slate-200">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 text-left w-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A36A]"
          >
            <BrandMark className="w-9 h-9 shrink-0" />
            <div className="min-w-0">
              <div className="font-display font-bold text-base tracking-tight text-[#172B35] whitespace-nowrap">
                SortSmart AI
              </div>
              <div className="text-xs text-[#475569] truncate">
                Scan. Sort. Save the Planet.
              </div>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A36A] ${
                  isActive
                    ? 'bg-[#16A36A]/10 text-[#16A36A]'
                    : 'text-[#475569] hover:bg-slate-100 hover:text-[#172B35]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="text-xs text-[#475569] leading-relaxed">
            <div className="font-medium text-[#172B35]">Local Prototype Mode</div>
            <p className="mt-0.5">
              Scans and points persist in this browser.{' '}
              {geminiConfigured === true
                ? 'Live Gemini AI vision active.'
                : geminiConfigured === false
                  ? 'Demo classification active when API key is unset.'
                  : 'Checking AI vision service.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onResetDemo}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-[#475569] hover:text-[#172B35] hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean 3-Zone Top Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="lg:hidden flex items-center gap-2 shrink-0"
              aria-label="SortSmart AI Home"
            >
              <BrandMark className="w-7 h-7" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-[#475569] whitespace-nowrap">
                SortSmart AI
              </span>
              <span className="hidden sm:inline text-slate-300" aria-hidden="true">
                /
              </span>
              <h1 className="font-display font-semibold text-[#172B35] truncate text-sm sm:text-base">
                {PAGE_TITLES[activePage]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2.5 text-left rounded-lg px-2 py-1 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#16A36A]"
              aria-label={`Open profile for ${profile.name}`}
            >
              {!avatarError ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center shrink-0">
                  {profile.name.slice(0, 1)}
                </div>
              )}
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-semibold text-[#172B35] whitespace-nowrap">
                  {profile.name}
                </div>
                <div className="text-[11px] font-mono tabular-nums text-[#16A36A]">
                  {totalPoints.toLocaleString()} pts
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16A36A] hover:bg-[#138A59] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A36A]"
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>Scan Waste</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (compact <= 60px, 5 primary tabs + profile in top bar) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 px-1 py-1 grid grid-cols-5"
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.filter((item) => item.id !== 'profile').map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[46px] flex flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                isActive ? 'text-[#16A36A]' : 'text-[#475569]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
