import React, { useRef } from 'react';
import { CalendarMode } from '../../types';
import { getVietnameseDateHeader } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  currentDate: string;
  mode: CalendarMode;
  onModeChange: (mode: CalendarMode) => void;
  onPrevDate: () => void;
  onNextDate: () => void;
  onToday: () => void;
  onSelectDate: (date: string) => void;
  isToday: boolean;
  scrollProgress?: number;
  isCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  mode,
  onModeChange,
  onPrevDate,
  onNextDate,
  onToday,
  onSelectDate,
  isToday,
  scrollProgress = 0,
  isCollapsed = false
}) => {
  const { isDark, accentConfig } = useTheme();
  const datePickerRef = useRef<HTMLInputElement>(null);
  const dateInfo = getVietnameseDateHeader(currentDate);

  // Chuẩn hóa scrollProgress trong khoảng [0, 1]
  // Vuốt đến đâu, header thu nhỏ tương ứng đến đó mà không bị nhảy bước
  const p = typeof scrollProgress === 'number'
    ? Math.min(1, Math.max(0, scrollProgress))
    : (isCollapsed ? 1 : 0);

  const headerBg = isDark ? 'bg-[#1C1C1E] border-[#2C2C2E]' : 'bg-white border-[#E5E5EA]';
  const textPrimary = isDark ? 'text-white' : 'text-[#1C1C1E]';
  const textSecondary = isDark ? 'text-[#8E8E93]' : 'text-[#8E8E93]';
  const btnBg = isDark ? 'bg-[#2C2C2E] text-white hover:bg-[#38383A]' : 'bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA]';

  return (
    <header
      id="calendar-header"
      className={`${headerBg} border-b shrink-0 select-none`}
      style={{
        paddingTop: `${Math.round(13 - p * 6)}px`,
        paddingBottom: `${Math.round(10 - p * 3)}px`,
        paddingLeft: '16px',
        paddingRight: '16px'
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP ROW: Tên ứng dụng + Ngày thu nhỏ (nếu cuộn) + Điều hướng */}
      {/* ------------------------------------------------------------- */}
      <div className="flex justify-between items-center h-8">
        {/* Left: Logo Ynii Makeup + Ngày inline mượt mà khi cuộn */}
        <div className="flex items-center min-w-0 pr-2">
          <span
            className="text-[12px] font-black tracking-widest uppercase shrink-0"
            style={{ color: accentConfig.hex }}
          >
            YNII MAKEUP
          </span>

          {/* Ngày inline tự động fade-in nhẹ nhàng khi người dùng vuốt lên */}
          <div
            style={{
              opacity: Math.min(1, Math.max(0, (p - 0.25) / 0.7)),
              maxWidth: `${p * 200}px`,
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
            className="flex items-center ml-2 transition-all"
          >
            <span className={`text-[12px] font-bold ${textPrimary} truncate`}>
              · {dateInfo.dayOfWeek}, {dateInfo.day}/{dateInfo.monthNumber}
            </span>
          </div>
        </div>

        {/* Right: Controls điều hướng ngày */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Nút Hôm nay (chỉ hiện khi không phải hôm nay) */}
          {!isToday && (
            <button
              id="header-today-btn"
              type="button"
              onClick={onToday}
              style={{ backgroundColor: accentConfig.lightBg, color: accentConfig.hex }}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 mr-0.5 cursor-pointer"
            >
              Hôm nay
            </button>
          )}

          {/* Nút Date Picker (Lịch) */}
          <button
            id="header-picker-btn"
            type="button"
            onClick={() => datePickerRef.current?.showPicker?.() || datePickerRef.current?.click()}
            title="Chọn ngày"
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${btnBg} flex items-center justify-center transition-colors relative cursor-pointer active:scale-95`}
          >
            <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
            <input
              ref={datePickerRef}
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) onSelectDate(e.target.value);
              }}
              className="absolute inset-0 opacity-0 pointer-events-auto cursor-pointer w-full h-full"
            />
          </button>

          {/* Nút Ngày trước / Ngày sau */}
          <button
            id="header-prev-btn"
            type="button"
            onClick={onPrevDate}
            title="Trước"
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${btnBg} flex items-center justify-center transition-colors cursor-pointer active:scale-95`}
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            id="header-next-btn"
            type="button"
            onClick={onNextDate}
            title="Sau"
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${btnBg} flex items-center justify-center transition-colors cursor-pointer active:scale-95`}
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CỤM NGÀY THÁNG CHÍNH: THỨ, NGÀY, THÁNG, NĂM                 */}
      {/*    Ví dụ: Thứ Năm, 03 Tháng 09 2026                             */}
      {/*    Gọn gàng, rõ ràng, không chiếm diện tích quá mức              */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          height: `${Math.max(0, (1 - p) * 26)}px`,
          opacity: Math.max(0, 1 - p * 1.6),
          marginTop: `${Math.max(0, (1 - p) * 5)}px`,
          transform: `translateY(-${p * 4}px)`,
          overflow: 'hidden'
        }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[15px] sm:text-[16px] font-bold ${textPrimary} tracking-tight truncate`}>
            {dateInfo.fullDateVi}
          </span>
          {isToday && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] shrink-0">
              Hôm nay
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CHỌN CHẾ ĐỘ: Ngày | Tuần | Tháng                           */}
      {/*    Fade out và thu gọn liên tục theo tiến trình vuốt            */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          height: `${Math.max(0, (1 - p) * 32)}px`,
          opacity: Math.max(0, 1 - p * 1.8),
          marginTop: `${Math.max(0, (1 - p) * 7)}px`,
          transform: `translateY(-${p * 4}px)`,
          overflow: 'hidden',
          pointerEvents: p > 0.6 ? 'none' : 'auto'
        }}
        className="flex space-x-1.5"
      >
        <button
          id="mode-day-btn"
          type="button"
          onClick={() => onModeChange('day')}
          style={mode === 'day' ? { backgroundColor: accentConfig.hex, color: '#FFFFFF' } : undefined}
          className={`px-3.5 py-1 text-[12px] font-semibold rounded-full transition-all cursor-pointer ${
            mode === 'day'
              ? 'shadow-xs'
              : `${btnBg} opacity-80 hover:opacity-100`
          }`}
        >
          Ngày
        </button>
        <button
          id="mode-week-btn"
          type="button"
          onClick={() => onModeChange('week')}
          style={mode === 'week' ? { backgroundColor: accentConfig.hex, color: '#FFFFFF' } : undefined}
          className={`px-3.5 py-1 text-[12px] font-semibold rounded-full transition-all cursor-pointer ${
            mode === 'week'
              ? 'shadow-xs'
              : `${btnBg} opacity-80 hover:opacity-100`
          }`}
        >
          Tuần
        </button>
        <button
          id="mode-month-btn"
          type="button"
          onClick={() => onModeChange('month')}
          style={mode === 'month' ? { backgroundColor: accentConfig.hex, color: '#FFFFFF' } : undefined}
          className={`px-3.5 py-1 text-[12px] font-semibold rounded-full transition-all cursor-pointer ${
            mode === 'month'
              ? 'shadow-xs'
              : `${btnBg} opacity-80 hover:opacity-100`
          }`}
        >
          Tháng
        </button>
      </div>
    </header>
  );
};
