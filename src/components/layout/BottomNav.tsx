import React from 'react';
import { ActiveTab } from '../../types';
import { Calendar, ClipboardList, Users, Settings, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal
}) => {
  const { accentConfig, isDark } = useTheme();

  const navBg = isDark ? 'bg-[#1C1C1E]/95 border-[#2C2C2E]' : 'bg-white/95 border-[#E5E5EA]';
  const textInactive = isDark ? 'text-[#8E8E93] opacity-60' : 'text-[#8E8E93] opacity-70';

  return (
    <>
      {/* Floating Action Button (+) */}
      <button
        id="floating-add-booking-btn"
        type="button"
        onClick={onOpenAddModal}
        title="Thêm lịch Makeup mới"
        aria-label="Thêm lịch Makeup mới"
        style={{ backgroundColor: accentConfig.hex }}
        className="fixed bottom-20 right-5 sm:right-8 z-30 w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-3xl font-light hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-[#1C1C1E]"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav
        id="bottom-tab-navigation"
        className={`h-16 sm:h-20 ${navBg} backdrop-blur-md border-t flex justify-around items-center px-4 pb-2 sm:pb-3 shrink-0 z-20`}
      >
        {/* Tab 1: Lịch */}
        <button
          id="nav-tab-calendar"
          type="button"
          onClick={() => onTabChange('calendar')}
          style={activeTab === 'calendar' ? { color: accentConfig.hex } : undefined}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'calendar' ? 'font-bold' : textInactive
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-semibold">Lịch</span>
        </button>

        {/* Tab 2: Booking */}
        <button
          id="nav-tab-bookings"
          type="button"
          onClick={() => onTabChange('bookings')}
          style={activeTab === 'bookings' ? { color: accentConfig.hex } : undefined}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'bookings' ? 'font-bold' : textInactive
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-semibold">Booking</span>
        </button>

        {/* Tab 3: CTV */}
        <button
          id="nav-tab-ctv"
          type="button"
          onClick={() => onTabChange('ctv')}
          style={activeTab === 'ctv' ? { color: accentConfig.hex } : undefined}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'ctv' ? 'font-bold' : textInactive
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-semibold">CTV</span>
        </button>

        {/* Tab 4: Cài đặt */}
        <button
          id="nav-tab-settings"
          type="button"
          onClick={() => onTabChange('settings')}
          style={activeTab === 'settings' ? { color: accentConfig.hex } : undefined}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'settings' ? 'font-bold' : textInactive
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-semibold">Cài đặt</span>
        </button>
      </nav>
    </>
  );
};
