import React from 'react';
import { Booking } from '../../types';
import { getStatusInfo, formatBookingCardDate, getBookingGuestCount } from '../../utils/formatters';
import { AlertTriangle, Phone, User, Users, Calendar, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface BookingCardProps {
  booking: Booking;
  hasConflict?: boolean;
  onSelect: (booking: Booking) => void;
  showDate?: boolean;
  isPast?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  hasConflict = false,
  onSelect,
  showDate = false,
  isPast
}) => {
  const { isDark, accentConfig } = useTheme();
  const statusInfo = getStatusInfo(booking.status);
  const cardDate = showDate ? formatBookingCardDate(booking.date) : null;

  // Tự động xác định nếu ca hẹn đã qua so với ngày hôm nay
  const isPastCard = React.useMemo(() => {
    if (typeof isPast === 'boolean') return isPast;
    if (!booking.date) return false;
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return booking.date < todayStr;
  }, [isPast, booking.date]);

  // Tên khách hàng hiển thị ở dòng đầu tiên
  const customerName = booking.customerName || 'Khách makeup';

  // Thông tin chi tiết hiển thị ở dòng nhỏ hơn ở dưới
  const detailsSnippet = React.useMemo(() => {
    let text = (booking.makeupInfo || '').trim();

    if (text) {
      // Nếu text có nhiều dòng và dòng đầu tiên trùng tên khách thì bỏ dòng đó để tránh lặp
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        const first = lines[0].toLowerCase();
        const custNameLower = customerName.toLowerCase().trim();
        if (
          first === custNameLower ||
          first.replace(/^(tên\s*khách|tên|khách(?:\s*hàng)?)\s*[:：\-]\s*/i, '') === custNameLower
        ) {
          text = lines.slice(1).join(' – ');
        } else {
          text = lines.join(' – ');
        }
      } else {
        // Nếu chỉ có 1 dòng mà bắt đầu bằng tên khách hàng kèm gạch nối (ví dụ: "Chị Lan - Make tiệc...")
        const custNameLower = customerName.toLowerCase().trim();
        if (custNameLower && text.toLowerCase().startsWith(custNameLower)) {
          const after = text.slice(custNameLower.length).replace(/^[\s\-–—:|]+/, '').trim();
          if (after) {
            text = after;
          }
        }
      }
    }

    if (text) {
      return text.replace(/\n+/g, ' – ');
    }

    // Fallback nếu không có thông tin lịch riêng: hiển thị gói makeup, địa chỉ, ghi chú
    const fallbackParts = [
      booking.packageNameSnapshot && booking.packageNameSnapshot !== 'Makeup'
        ? booking.packageNameSnapshot
        : '',
      booking.customerAddress || '',
      booking.note || ''
    ].filter(Boolean);

    return fallbackParts.length > 0
      ? fallbackParts.join(' – ')
      : (booking.packageNameSnapshot || 'Chi tiết ca makeup');
  }, [booking.makeupInfo, customerName, booking.packageNameSnapshot, booking.customerAddress, booking.note]);

  const isCompleted = booking.status === 'completed';

  // Màu viền và bóng của thẻ:
  // - Trùng lịch: Viền đỏ #FF3B30
  // - Lịch đã xong: Viền chìm phẳng
  // - Các trạng thái khác: Viền theo màu đặc trưng của trạng thái
  let borderClasses = '';
  if (hasConflict) {
    borderClasses = isDark
      ? 'border-[#FF3B30] border-l-4 border-l-[#FF3B30] shadow-[0_2px_12px_rgba(255,59,48,0.25)] ring-1 ring-[#FF3B30]/30'
      : 'border-[#FF3B30] border-l-4 border-l-[#FF3B30] shadow-[0_2px_8px_rgba(255,59,48,0.12)]';
  } else if (isCompleted) {
    borderClasses = isDark
      ? 'border-[#28282C] border-l-4 border-l-[#28282C] shadow-none'
      : 'border-[#B4B8C4] border-l-4 border-l-[#B4B8C4] shadow-none';
  } else {
    borderClasses = isDark
      ? `${statusInfo.borderClass} border-l-4 shadow-sm`
      : `${statusInfo.borderClass} border-l-4 shadow-xs`;
  }

  // Thống nhất màu nền:
  // Ca đã hoàn thành có màu tối đi rõ rệt, phân biệt hoàn toàn với ca chưa hoàn thành
  const cardBg = isCompleted
    ? isDark
      ? 'bg-[#141416]'
      : 'bg-[#D4D7DE]'
    : isDark
      ? 'bg-[#1C1C1E]'
      : 'bg-white';

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (booking.customerPhone) {
      window.location.href = `tel:${booking.customerPhone}`;
    }
  };

  const textPrimary = isCompleted
    ? isDark
      ? 'text-[#C7C7CC]'
      : 'text-[#242426]'
    : isDark
      ? 'text-white'
      : 'text-[#1C1C1E]';

  const textBody = isCompleted
    ? isDark
      ? 'text-[#8E8E93]'
    : 'text-[#505055]'
    : isDark
      ? 'text-[#D1D1D6]'
      : 'text-[#3A3A3C]';

  const textMuted = isCompleted
    ? isDark
      ? 'text-[#6C6C70]'
      : 'text-[#636366]'
    : 'text-[#8E8E93]';

  const btnCallBg = isCompleted
    ? isDark
      ? 'bg-[#222226] text-[#D1D1D6] border-[#333338]'
      : 'bg-[#C0C4CE] text-[#242426] border-[#A8ACB8]'
    : isDark
      ? 'bg-[#2C2C2E] text-white border-[#38383A]'
      : 'bg-[#F2F2F7] text-[#1C1C1E] border-[#D1D1D6]';

  const guestCount = getBookingGuestCount(booking);

  return (
    <div
      id={`booking-card-${booking.id}`}
      onClick={() => onSelect(booking)}
      className="flex items-start gap-1.5 sm:gap-2 cursor-pointer group transition-all"
    >
      {/* Cột thời gian: Chỉ hiện giờ bắt đầu ca để không bị rối */}
      <div className="w-10 sm:w-11 text-right pt-1.5 shrink-0 select-none">
        <p className={`text-[13px] sm:text-[13.5px] font-black leading-tight ${
          isCompleted
            ? isDark ? 'text-[#7C7C82]' : 'text-[#55555A]'
            : isDark ? 'text-white' : 'text-[#1C1C1E]'
        }`}>
          {booking.startTime}
        </p>
      </div>

      {/* Card Body */}
      <div
        className={`flex-1 min-w-0 ${cardBg} px-3 py-2 rounded-xl border ${borderClasses} hover:opacity-95 active:scale-[0.99] transition-all`}
      >
        {/* Hàng 1: Tên khách hàng + Giá tiền + Trạng thái */}
        <div className="flex justify-between items-center gap-1.5 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isCompleted && (
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#28A745] text-white shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <h3 className={`font-bold text-[14.5px] sm:text-[15px] ${textPrimary} leading-snug truncate`}>
              {customerName}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {hasConflict && (
              <span className="flex items-center gap-0.5 text-[9px] bg-[#FFF2F2] text-[#FF3B30] px-1 py-0.5 rounded border border-[#FF3B30] font-semibold animate-pulse">
                <AlertTriangle className="w-2.5 h-2.5" />
                Trùng
              </span>
            )}
            <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold transition-colors ${statusInfo.badgeClass}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Hàng 2: Dòng nhỏ hơn ở dưới là thông tin chi tiết */}
        <p className={`text-[12px] sm:text-[12.5px] ${textBody} my-1 line-clamp-1 font-normal leading-tight`}>
          {detailsSnippet}
        </p>

        {/* Metadata dưới cùng: Ngày (nếu trong tab Booking) + CTV phụ trách + Số lượng khách + Nút gọi */}
        <div className={`pt-1.5 border-t ${
          isCompleted
            ? isDark ? 'border-[#262629]' : 'border-[#B8BCC6]'
            : isDark ? 'border-[#2C2C2E]' : 'border-[#F2F2F7]'
        } flex items-center justify-between gap-1.5 text-[11px]`}>
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Định dạng ngày CHỈ TRÊN CÁC THẺ trong tab Booking */}
            {cardDate && (
              <span className={`inline-flex items-center gap-1 ${textPrimary}`}>
                <Calendar className="w-3 h-3 text-[#FF9500]" />
                <strong className="font-bold">{cardDate.dayOfWeek}</strong>
                <span className="font-normal">{cardDate.dayMonth}</span>
              </span>
            )}

            {/* CTV phụ trách */}
            <span className={`inline-flex items-center gap-1 font-medium ${textPrimary}`}>
              <User className={`w-3 h-3 text-[#5856D6]`} />
              <span className={textMuted}>CTV:</span>
              <span className="text-[#5856D6] font-bold">
                {booking.ctvNameSnapshot || 'Chưa gán'}
              </span>
            </span>

            {/* Số lượng khách */}
            <span className={`inline-flex items-center gap-1 font-medium ${textPrimary}`}>
              <Users className="w-3 h-3 text-[#32ADE6]" />
              <span className="font-semibold text-[#32ADE6]">
                {guestCount} khách
              </span>
            </span>
          </div>

          {/* Nút gọi điện */}
          {booking.customerPhone && (
            <button
              id={`call-btn-${booking.id}`}
              type="button"
              onClick={handlePhoneClick}
              title={`Gọi ${booking.customerPhone}`}
              className={`h-7 px-3 rounded-full ${btnCallBg} border flex items-center gap-1.5 hover:opacity-85 active:scale-95 transition-all cursor-pointer shrink-0 font-bold text-[11px] shadow-2xs`}
            >
              <Phone
                className="w-3.5 h-3.5"
                style={{ color: accentConfig.hex }}
              />
              <span className={textPrimary}>Gọi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
