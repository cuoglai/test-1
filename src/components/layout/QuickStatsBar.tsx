import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { CalendarDays, Users, CheckCircle2 } from 'lucide-react';

interface QuickStatsBarProps {
  totalCount: number;
  totalGuests: number;
  completedCount: number;
  labelPrefix?: string;
  scrollProgress?: number;
  isCollapsed?: boolean;
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({
  totalCount,
  totalGuests,
  completedCount,
  labelPrefix
}) => {
  const { isDark, accentConfig } = useTheme();

  const barBg = isDark ? 'bg-[#121214] border-[#2C2C2E]' : 'bg-[#F9F9F9] border-[#E5E5EA]';
  const cardBg = isDark ? 'bg-[#1C1C1E] border-[#2C2C2E]' : 'bg-white border-[#E5E5EA]';
  const textPrimary = isDark ? 'text-white' : 'text-[#1C1C1E]';
  const textSecondary = isDark ? 'text-[#8E8E93]' : 'text-[#8E8E93]';

  return (
    <div
      id="quick-stats-bar"
      className={`${barBg} grid grid-cols-3 border-b shrink-0 select-none py-1.5 px-3 sm:px-4 gap-1.5 sm:gap-2`}
      style={{
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 12px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 12px)'
      }}
    >
      {/* 1. TỔNG CA MAKEUP */}
      <div
        className={`h-8 sm:h-8.5 px-2 rounded-xl text-center border flex items-center justify-center gap-1.5 ${cardBg} shadow-2xs`}
      >
        <CalendarDays className="w-3.5 h-3.5" style={{ color: accentConfig.hex }} />
        <span className={`text-[11px] sm:text-[12px] font-semibold ${textSecondary}`}>
          {labelPrefix ? `${labelPrefix}:` : 'Tổng ca:'}
        </span>
        <span
          className="px-1.5 py-0.2 rounded-full text-[11.5px] font-extrabold leading-tight"
          style={{ backgroundColor: accentConfig.lightBg, color: accentConfig.hex }}
        >
          {totalCount}
        </span>
      </div>

      {/* 2. SỐ LƯỢNG KHÁCH */}
      <div
        className={`h-8 sm:h-8.5 px-2 rounded-xl text-center border flex items-center justify-center gap-1.5 ${cardBg} shadow-2xs`}
      >
        <Users className="w-3.5 h-3.5 text-blue-500" />
        <span className={`text-[11px] sm:text-[12px] font-semibold ${textSecondary}`}>
          Khách:
        </span>
        <span className={`px-1.5 py-0.2 rounded-full text-[11.5px] font-extrabold leading-tight ${
          isDark ? 'bg-blue-950/60 text-blue-300' : 'bg-blue-50 text-blue-700'
        }`}>
          {totalGuests}
        </span>
      </div>

      {/* 3. HOÀN THÀNH */}
      <div
        className={`h-8 sm:h-8.5 px-2 rounded-xl text-center border flex items-center justify-center gap-1.5 ${cardBg} shadow-2xs`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span className={`text-[11px] sm:text-[12px] font-semibold ${textSecondary}`}>
          Xong:
        </span>
        <span className={`px-1.5 py-0.2 rounded-full text-[11.5px] font-extrabold leading-tight ${
          isDark ? 'bg-emerald-950/60 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {completedCount}
        </span>
      </div>
    </div>
  );
};
