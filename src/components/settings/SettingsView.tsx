import React, { useState } from 'react';
import { ReminderOption, ThemeMode, AccentColor } from '../../types';
import { getDefaultReminder, setDefaultReminder } from '../../services/storageService';
import { useTheme, ACCENT_COLORS } from '../../contexts/ThemeContext';
import { Sun, Moon, Palette, Bell, RotateCcw, Check, Sparkles } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface SettingsViewProps {
  onResetDemo: () => void;
}

const REMINDER_OPTIONS: { value: ReminderOption; label: string }[] = [
  { value: 'none', label: 'Không nhắc' },
  { value: '15_mins', label: '15 phút trước' },
  { value: '30_mins', label: '30 phút trước (Khuyên dùng)' },
  { value: '1_hour', label: '1 giờ trước' },
  { value: '2_hours', label: '2 giờ trước' },
  { value: '1_day', label: '1 ngày trước' }
];

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetDemo }) => {
  const { theme, setTheme, accent, setAccent, accentConfig, isDark } = useTheme();
  const [defaultReminder, setReminderState] = useState<ReminderOption>(() => getDefaultReminder());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReminderChange = (val: ReminderOption) => {
    setReminderState(val);
    setDefaultReminder(val);
  };

  // Theme styling tokens
  const viewBg = isDark ? 'bg-[#000000]' : 'bg-[#F2F2F7]';
  const cardBg = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]';
  const textPrimary = isDark ? 'text-white' : 'text-[#1C1C1E]';
  const textSecondary = isDark ? 'text-[#8E8E93]' : 'text-[#636366]';
  const inputBg = isDark ? 'bg-[#2C2C2E]' : 'bg-[#F2F2F7]';

  return (
    <div id="settings-view-root" className={`flex-1 flex flex-col overflow-hidden ${viewBg}`}>
      {/* Header */}
      <div className={`${cardBg} px-5 pt-4 pb-3 border-b ${cardBorder} shrink-0`}>
        <h2 className={`text-xl font-bold ${textPrimary}`}>Cài đặt</h2>
        <p className={`text-[12px] ${textSecondary}`}>Giao diện, tông màu & thông báo</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ============================================================ */}
        {/* SECTION 1: GIAO DIỆN (SÁNG / TỐI) & MÀU CHỦ ĐẠO (ACCENT)     */}
        {/* ============================================================ */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Palette className="w-4 h-4" style={{ color: accentConfig.hex }} />
            <h3 className={`text-[12px] font-bold uppercase tracking-wider ${textSecondary}`}>
              Giao diện & Tông màu
            </h3>
          </div>

          <div className={`${cardBg} p-4 rounded-2xl border ${cardBorder} shadow-xs space-y-4`}>
            {/* Chế độ Sáng / Tối */}
            <div>
              <span className={`text-[13px] font-bold ${textPrimary} block mb-2`}>
                Chế độ hiển thị
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Light Mode Button */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`h-16 rounded-xl border p-3 flex items-center justify-between transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-2 shadow-xs bg-white'
                      : 'border-[#E5E5EA] bg-[#F2F2F7] opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: theme === 'light' ? accentConfig.hex : undefined
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-[14px] font-bold text-[#1C1C1E] block leading-tight">
                        Sáng
                      </span>
                      <span className="text-[11px] text-[#8E8E93]">Light mode</span>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: accentConfig.hex }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* Dark Mode Button */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`h-16 rounded-xl border p-3 flex items-center justify-between transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-2 shadow-xs bg-[#2C2C2E]'
                      : 'border-[#38383A] bg-[#1C1C1E] opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: theme === 'dark' ? accentConfig.hex : undefined
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#5856D6]/20 text-[#AF52DE] flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-[14px] font-bold text-white block leading-tight">
                        Tối
                      </span>
                      <span className="text-[11px] text-[#8E8E93]">Dark mode</span>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: accentConfig.hex }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Màu chủ đạo (Accent Color) */}
            <div className={`pt-3 border-t ${cardBorder}`}>
              <div className="flex justify-between items-center mb-2.5">
                <span className={`text-[13px] font-bold ${textPrimary}`}>
                  Màu chủ đạo (Accent Color)
                </span>
                <span
                  className="text-[12px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ backgroundColor: accentConfig.lightBg, color: accentConfig.hex }}
                >
                  {accentConfig.name}
                </span>
              </div>

              {/* 5 preset colors: Xanh dương, Tím, Hồng, Cam, Xanh lá */}
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((colKey) => {
                  const item = ACCENT_COLORS[colKey];
                  const isSelected = accent === colKey;

                  return (
                    <button
                      key={colKey}
                      type="button"
                      onClick={() => setAccent(colKey)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer hover:opacity-90 active:scale-95"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-xs transition-transform"
                        style={{
                          backgroundColor: item.hex,
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isSelected ? `0 0 0 3px ${isDark ? '#1C1C1E' : '#FFFFFF'}, 0 0 0 5px ${item.hex}` : undefined
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </div>
                      <span className={`text-[11px] font-semibold text-center truncate w-full ${isSelected ? textPrimary : textSecondary}`}>
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: THÔNG BÁO NHẮC LỊCH MẶC ĐỊNH                      */}
        {/* ============================================================ */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Bell className="w-4 h-4" style={{ color: accentConfig.hex }} />
            <h3 className={`text-[12px] font-bold uppercase tracking-wider ${textSecondary}`}>
              Nhắc lịch mặc định
            </h3>
          </div>

          <div className={`${cardBg} p-4 rounded-2xl border ${cardBorder} shadow-xs space-y-2.5`}>
            <p className={`text-[13px] ${textSecondary}`}>
              Thời gian nhắc trước khi bắt đầu makeup cho các lịch tạo mới:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {REMINDER_OPTIONS.map((opt) => {
                const isSelected = defaultReminder === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleReminderChange(opt.value)}
                    style={
                      isSelected
                        ? { backgroundColor: accentConfig.hex, color: '#FFFFFF' }
                        : undefined
                    }
                    className={`h-11 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'shadow-xs'
                        : `${inputBg} ${textPrimary} border ${cardBorder} hover:opacity-80`
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: DỮ LIỆU HỆ THỐNG                                  */}
        {/* ============================================================ */}
        <div>
          <h3 className={`text-[12px] font-bold uppercase tracking-wider ${textSecondary} mb-2 px-1`}>
            Dữ liệu hệ thống
          </h3>
          <div className={`${cardBg} p-4 rounded-2xl border ${cardBorder} shadow-xs flex justify-between items-center`}>
            <div>
              <h4 className={`text-[14px] font-bold ${textPrimary}`}>Khôi phục dữ liệu mẫu</h4>
              <p className={`text-[12px] ${textSecondary}`}>
                Tải lại danh sách lịch makeup và CTV ban đầu
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="h-10 px-3.5 rounded-xl bg-[#FF3B30]/10 text-[#FF3B30] text-[13px] font-bold hover:bg-[#FF3B30]/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0 ml-3"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Khôi phục
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 4: THÔNG TIN ỨNG DỤNG                                */}
        {/* ============================================================ */}
        <div className="text-center pt-2 pb-6 space-y-1">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-bold tracking-wide" style={{ color: accentConfig.hex }}>
            <Sparkles className="w-3 h-3" />
            Ynii Makeup
          </div>
          <p className={`text-[12px] ${textSecondary}`}>
            Sổ lịch Makeup thông minh • Tối ưu cho iPhone
          </p>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Khôi phục dữ liệu mẫu"
        message="Dữ liệu mẫu demo ban đầu sẽ được khôi phục. Các thay đổi của bạn sẽ được làm mới."
        confirmText="Khôi phục"
        onConfirm={() => {
          onResetDemo();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
