import React from 'react';
import { Booking } from '../../types';
import { getReminderLabel, getBookingDisplayTitle, getBookingMakeupInfo, getStatusBadgeInfo } from '../../utils/formatters';
import { Phone, User, Clock, AlertTriangle, Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface BookingCardProps {
  booking: Booking;
  hasConflict?: boolean;
  onSelect: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, hasConflict, onSelect }) => {
  const { isDark, accentConfig } = useTheme();
  const statusInfo = getStatusBadgeInfo(booking.status);
  const displayTitle = getBookingDisplayTitle(booking);
  const fullInfo = getBookingMakeupInfo(booking);

  // Get a clean 1-line snippet of the makeup details
  const infoSnippet = booking.makeupInfo
    ? booking.makeupInfo.replace(/\n+/g, ' – ')
    : fullInfo;

  // Visual accent border
  let borderLeftColor = 'border-l-4 ';
  if (hasConflict) {
    borderLeftColor += 'border-[#FF3B30]';
  } else if (booking.performerType === 'ctv') {
    borderLeftColor += 'border-[#5856D6]';
  } else if (booking.status === 'paid' || booking.status === 'completed') {
    borderLeftColor += 'border-[#34C759]';
  } else {
    borderLeftColor += 'border-[#FF9500]';
  }

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (booking.customerPhone) {
      window.location.href = `tel:${booking.customerPhone}`;
    }
  };

  const cardBg = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]';
  const textPrimary = isDark ? 'text-white' : 'text-[#1C1C1E]';
  const textBody = isDark ? 'text-[#D1D1D6]' : 'text-[#3A3A3C]';
  const textMuted = isDark ? 'text-[#8E8E93]' : 'text-[#8E8E93]';
  const btnCallBg = isDark ? 'bg-[#2C2C2E] text-white' : 'bg-[#F2F2F7] text-[#1C1C1E]';

  return (
    <div
      id={`booking-card-${booking.id}`}
      onClick={() => onSelect(booking)}
      className="flex items-start space-x-2.5 cursor-pointer group transition-all"
    >
      {/* Time column: [Giờ] */}
      <div className="w-13 text-right pt-2.5 shrink-0">
        <p className={`text-[14px] font-bold ${textPrimary} leading-tight`}>{booking.startTime}</p>
        {booking.endTime && (
          <p className={`text-[11px] ${textMuted} leading-tight mt-0.5`}>{booking.endTime}</p>
        )}
      </div>

      {/* Card Body */}
      <div
        className={`flex-1 ${cardBg} p-3.5 rounded-2xl shadow-2xs border ${cardBorder} ${borderLeftColor} hover:shadow-sm active:scale-99 transition-all`}
      >
        {/* Top row: [Thông tin nhận diện ngắn] & Badges */}
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className={`font-bold text-[16px] ${textPrimary} leading-snug truncate`}>
            {displayTitle}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {hasConflict && (
              <span className="flex items-center gap-1 text-[10px] bg-[#FFF2F2] text-[#FF3B30] px-1.5 py-0.5 rounded border border-[#FF3B30] font-semibold animate-pulse">
                <AlertTriangle className="w-2.5 h-2.5" />
                Trùng lịch
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusInfo.badgeClass}`}>
              {booking.performerType === 'ctv' && booking.status === 'assigned'
                ? `CTV ${booking.ctvNameSnapshot || 'Linh'}`
                : statusInfo.label}
            </span>
          </div>
        </div>

        {/* Short info preview from "Thông tin lịch make" */}
        <p className={`text-[13px] ${textBody} mb-2.5 line-clamp-1 font-normal`}>
          {infoSnippet}
        </p>

        {/* Minimum required metadata: Người make & Thông báo */}
        <div className={`pt-2 border-t ${isDark ? 'border-[#2C2C2E]' : 'border-[#F2F2F7]'} flex flex-wrap items-center justify-between gap-2 text-[12px]`}>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Người make: Tôi / CTV */}
            <span className={`inline-flex items-center gap-1 font-medium ${textPrimary}`}>
              <User className={`w-3.5 h-3.5 ${textMuted}`} />
              <span className={textMuted}>Người make:</span>
              <span className={booking.performerType === 'ctv' ? 'text-[#5856D6] font-semibold' : `${textPrimary} font-semibold`}>
                {booking.performerType === 'owner'
                  ? 'Tôi'
                  : `CTV ${booking.ctvNameSnapshot || ''}`}
              </span>
            </span>

            {/* Thông báo: 30 phút trước */}
            <span className={`inline-flex items-center gap-1 ${textMuted}`}>
              <Bell className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>Thông báo:</span>
              <span className={`${textPrimary} font-medium`}>
                {getReminderLabel(booking.reminder)}
              </span>
            </span>
          </div>

          {/* Quick Call if phone exists */}
          {booking.customerPhone && (
            <button
              id={`call-btn-${booking.id}`}
              type="button"
              onClick={handlePhoneClick}
              title={`Gọi ${booking.customerPhone}`}
              style={{ color: accentConfig.hex }}
              className={`w-7 h-7 rounded-full ${btnCallBg} flex items-center justify-center hover:opacity-80 active:scale-95 transition-all cursor-pointer`}
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
