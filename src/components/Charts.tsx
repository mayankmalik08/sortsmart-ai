import React from 'react';

interface DualBarChartProps {
  data: Array<{
    label: string;
    primary: number;
    secondary: number;
  }>;
  primaryLabel: string;
  secondaryLabel: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const DualBarChart: React.FC<DualBarChartProps> = ({
  data,
  primaryLabel,
  secondaryLabel,
  primaryColor = '#16A36A',
  secondaryColor = '#A3E635',
}) => {
  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.primary, d.secondary))
  );

  return (
    <div className="w-full" data-testid="dual-bar-chart">
      <div className="flex flex-wrap items-center justify-end gap-5 mb-4 text-xs font-medium text-[#475569]">
        <span className="inline-flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ backgroundColor: primaryColor }}
            aria-hidden="true"
          />
          {primaryLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ backgroundColor: secondaryColor }}
            aria-hidden="true"
          />
          {secondaryLabel}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pt-4 border-b border-slate-200 pb-2">
        {data.map((item) => {
          const pHeight = Math.max(6, Math.round((item.primary / maxVal) * 100));
          const sHeight = Math.max(6, Math.round((item.secondary / maxVal) * 100));
          return (
            <div
              key={item.label}
              className="flex flex-col items-center justify-end h-full group"
            >
              <div className="flex items-end justify-center gap-1 w-full h-36">
                <div
                  className="w-2.5 sm:w-3.5 rounded-t transition-transform duration-200 group-hover:scale-y-105 origin-bottom"
                  style={{
                    height: `${pHeight}%`,
                    backgroundColor: primaryColor,
                  }}
                  title={`${item.label} — ${primaryLabel}: ${item.primary}`}
                />
                <div
                  className="w-2.5 sm:w-3.5 rounded-t transition-transform duration-200 group-hover:scale-y-105 origin-bottom"
                  style={{
                    height: `${sHeight}%`,
                    backgroundColor: secondaryColor,
                  }}
                  title={`${item.label} — ${secondaryLabel}: ${item.secondary}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2">
        {data.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-xs font-medium text-[#475569]">{item.label}</div>
            <div className="text-[11px] font-mono tabular-nums text-slate-400">
              {item.primary}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DonutBreakdownProps {
  segments: Array<{
    label: string;
    value: number;
    percentage: number;
    colorHex: string;
  }>;
  centerValue: string;
  centerCaption: string;
}

export const DonutBreakdownChart: React.FC<DonutBreakdownProps> = ({
  segments,
  centerValue,
  centerCaption,
}) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  let cumulativeFraction = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6" data-testid="donut-chart">
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="16"
          />
          {segments.map((seg) => {
            const fraction = seg.value / total;
            const dashLength = Math.max(0, fraction * circumference - 2);
            const dashOffset = -cumulativeFraction * circumference;
            cumulativeFraction += fraction;
            return (
              <circle
                key={seg.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={seg.colorHex}
                strokeWidth="16"
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-bold font-display text-[#172B35] tabular-nums">
            {centerValue}
          </span>
          <span className="text-[11px] text-[#475569]">{centerCaption}</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: seg.colorHex }}
                aria-hidden="true"
              />
              <span className="text-[#172B35] truncate">{seg.label}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-xs">
              <span className="text-[#475569]">{seg.value.toLocaleString()}</span>
              <span className="font-semibold text-[#172B35] w-9 text-right">
                {seg.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
