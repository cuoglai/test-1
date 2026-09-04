import { Booking, BookingStatus, ReminderOption } from '../types';

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(Math.max(0, amount)) + 'đ';
}

export function formatCompactCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined || amount === 0) return '0đ';
  if (amount >= 1_000_000) {
    const mil = amount / 1_000_000;
    // e.g. 4.8M or 4M
    return `${Number.isInteger(mil) ? mil : mil.toFixed(1).replace('.', ',')}M`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return `${Number.isInteger(k) ? k : k.toFixed(1).replace('.', ',')}K`;
  }
  return formatCurrency(amount);
}

export const DAY_NAMES_VI = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy'
];

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getVietnameseDayOfWeek(dateStr: string): string {
  const date = parseDateString(dateStr);
  return DAY_NAMES_VI[date.getDay()];
}

export function getVietnameseDateHeader(dateStr: string): {
  dayOfWeek: string;
  day: string;
  month: string;
  monthNumber: string;
  year: number;
  fullDateVi: string;
  compactDateVi: string;
  formattedHeader: string;
} {
  const date = parseDateString(dateStr);
  const dayOfWeek = DAY_NAMES_VI[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const monthNum = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return {
    dayOfWeek,
    day,
    month: `Tháng ${monthNum}`,
    monthNumber: monthNum,
    year,
    fullDateVi: `${dayOfWeek}, ${day} Tháng ${monthNum} ${year}`,
    compactDateVi: `${dayOfWeek}, ${day}/${monthNum}/${year}`,
    formattedHeader: `${dayOfWeek}, ngày ${day}/${monthNum}/${year}`
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return getVietnameseDateHeader(dateStr).formattedHeader;
}

export function getReminderLabel(option: ReminderOption): string {
  switch (option) {
    case 'none':
      return 'Không nhắc';
    case '15_mins':
      return '15 phút trước';
    case '30_mins':
      return '30 phút trước';
    case '1_hour':
      return '1 giờ trước';
    case '2_hours':
      return '2 giờ trước';
    case '3_hours':
      return '3 giờ trước';
    case '1_day':
      return '1 ngày trước';
    default:
      return '30 phút trước';
  }
}

export function getStatusBadgeInfo(status: BookingStatus): {
  label: string;
  badgeClass: string;
  borderClass: string;
  colorHex: string;
} {
  switch (status) {
    case 'assigned':
      return {
        label: 'Đã giao CTV',
        badgeClass: 'bg-[#F5F5FB] text-[#5856D6] border border-[#5856D6]',
        borderClass: 'border-[#5856D6]',
        colorHex: '#5856D6'
      };
    case 'completed':
    case 'paid':
      return {
        label: 'Hoàn thành',
        badgeClass: 'bg-[#F2FAF4] text-[#34C759] border border-[#34C759]',
        borderClass: 'border-[#34C759]',
        colorHex: '#34C759'
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        badgeClass: 'bg-[#FFF2F2] text-[#FF3B30] border border-[#FF3B30]',
        borderClass: 'border-[#FF3B30]',
        colorHex: '#FF3B30'
      };
    case 'deposited':
    default:
      return {
        label: 'Đã lên lịch',
        badgeClass: 'bg-[#F2F2F7] text-[#1C1C1E] border border-[#D1D1D6]',
        borderClass: 'border-[#1C1C1E]',
        colorHex: '#1C1C1E'
      };
  }
}

/**
 * Extract short recognizable customer/service name from the beginning of "Thông tin lịch make".
 * Preserves the original verbatim content completely.
 */
export function getBookingDisplayTitle(booking: Booking): string {
  if (booking.makeupInfo && booking.makeupInfo.trim()) {
    const firstLine = booking.makeupInfo.trim().split('\n')[0];
    // Split by common delimiters like '–', '-', '|', ':', ','
    const parts = firstLine.split(/\s*[\u2013\u2014\-|:,]\s*/);
    if (parts.length > 0 && parts[0].trim()) {
      return parts[0].trim();
    }
    return firstLine.slice(0, 40).trim();
  }
  return booking.customerName || 'Lịch Makeup';
}

/**
 * Reconstruct or get the full "Thông tin lịch make" for viewing or editing.
 * If makeupInfo exists, returns it verbatim.
 * No pricing, deposit, or financial logic included.
 */
export function getBookingMakeupInfo(booking: Booking): string {
  if (booking.makeupInfo && booking.makeupInfo.trim()) {
    return booking.makeupInfo;
  }
  const parts: string[] = [];
  if (booking.customerName) parts.push(booking.customerName);
  if (booking.customerPhone) parts.push(booking.customerPhone);
  if (booking.customerAddress) parts.push(booking.customerAddress);
  if (booking.quantity && booking.quantity > 1) parts.push(`${booking.quantity} người`);
  if (booking.packageNameSnapshot && booking.packageNameSnapshot !== 'Makeup') {
    parts.push(booking.packageNameSnapshot);
  }

  return parts.join(' – ');
}

/**
 * Converts a "HH:mm" 24h time string to minutes from 00:00 (0 to 1439).
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes from 00:00 to a "HH:mm" 24h formatted string.
 */
export function minutesToTime(totalMins: number): string {
  const normalized = Math.max(0, Math.min(1439, totalMins));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Validates that endTime is strictly after startTime.
 */
export function isEndTimeAfterStartTime(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return true;
  return timeToMinutes(endTime) > timeToMinutes(startTime);
}

/**
 * Calculate default end time based on start time (+ duration in minutes, default 90 mins).
 */
export function calculateDefaultEndTime(startTime: string, durationMinutes = 90): string {
  if (!startTime) return '07:30';
  const startMins = timeToMinutes(startTime);
  const endMins = (startMins + durationMinutes) % (24 * 60);
  return minutesToTime(endMins);
}

/**
 * Calculates end time from start time and duration in minutes, handling past midnight.
 */
export function calculateEndTimeFromDuration(startTime: string, durationMinutes: number): {
  endTime: string;
  isNextDay: boolean;
  displayFormatted: string;
} {
  if (!startTime) return { endTime: '10:00', isNextDay: false, displayFormatted: '10:00' };
  const startMins = timeToMinutes(startTime);
  const totalMins = startMins + durationMinutes;
  const isNextDay = totalMins >= 1440;
  const endNormalized = totalMins % 1440;
  const endTime = minutesToTime(endNormalized);
  const displayFormatted = isNextDay ? `${endTime} (hôm sau)` : endTime;
  return { endTime, isNextDay, displayFormatted };
}

