import React from 'react';
import { Booking } from '../../types';
import { BookingCard } from '../booking/BookingCard';
import { findCTVConflicts } from '../../services/conflictService';
import { Plus, CalendarX } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DayViewProps {
  date: string;
  isToday: boolean;
  bookings: Booking[];
  allBookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onOpenAddBooking: () => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  date,
  isToday,
  bookings,
  allBookings,
  onSelectBooking,
  onOpenAddBooking,
  onScroll
}) => {
  const { isDark, accentConfig } = useTheme();
  const sortedBookings = [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const textPrimary = isDark ? 'text-white' : 'text-[#1C1C1E]';
  const textSecondary = isDark ? 'text-[#8E8E93]' : 'text-[#8E8E93]';
  const emptyIconBg = isDark ? 'bg-[#1C1C1E]' : 'bg-[#E5E5EA]/70';

  if (sortedBookings.length === 0) {
    return (
      <div
        id="day-view-container"
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          id="day-view-empty-state"
          className="min-h-[calc(100%+85px)] flex flex-col items-center justify-center p-6 text-center pb-24"
        >
          <div className={`w-16 h-16 rounded-full ${emptyIconBg} flex items-center justify-center mb-3`}>
            <CalendarX className={`w-8 h-8 ${textSecondary}`} />
          </div>
          <h3 className={`text-[17px] font-bold ${textPrimary} mb-1`}>
            {isToday ? 'Hôm nay chưa có lịch Makeup' : 'Chưa có lịch Makeup ngày này'}
          </h3>
          <p className={`text-[13px] ${textSecondary} max-w-xs mb-5`}>
            Tạo lịch mới để theo dõi thông tin khách, giờ makeup và người thực hiện nhanh chóng.
          </p>
          <button
            id="empty-state-add-btn"
            type="button"
            onClick={onOpenAddBooking}
            style={{ backgroundColor: accentConfig.hex }}
            className="px-5 py-2.5 rounded-full text-white font-semibold text-[14px] shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Thêm lịch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="day-view-container"
      onScroll={onScroll}
      className="flex-1 overflow-y-auto px-4 pt-3"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Container luôn có dư ít nhất 85px chiều cao để người dùng vuốt thu gọn header mượt mà ngay cả khi chỉ có 1-2 lịch */}
      <div className="min-h-[calc(100%+85px)] space-y-3.5 pb-24">
        {/* Subheader banner */}
        <div className="flex items-center justify-between px-1 pb-1">
          <span className={`text-[11px] font-bold uppercase tracking-widest ${textSecondary}`}>
            {isToday ? 'HÔM NAY' : 'LỊCH TRONG NGÀY'} · {sortedBookings.length} LỊCH
          </span>
        </div>

        {sortedBookings.map((booking) => {
          const conflicts = findCTVConflicts(allBookings, {
            id: booking.id,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            performerType: booking.performerType,
            ctvId: booking.ctvId
          });

          return (
            <BookingCard
              key={booking.id}
              booking={booking}
              hasConflict={conflicts.length > 0}
              onSelect={onSelectBooking}
            />
          );
        })}
      </div>
    </div>
  );
};
