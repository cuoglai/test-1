import React, { useState, useMemo } from 'react';
import { Booking, CTV } from '../../types';
import {
  getStatusBadgeInfo,
  formatDisplayDate,
  isCTVBooking,
  getBookingGuestCount
} from '../../utils/formatters';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Users,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Search,
  Clock,
  MapPin,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RevenueViewProps {
  bookings: Booking[];
  ctvs?: CTV[];
  currentDate: string;
  onSelectBooking: (booking: Booking) => void;
  onOpenAddBooking: () => void;
}

const WEEKDAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const RevenueView: React.FC<RevenueViewProps> = ({
  bookings,
  ctvs = [],
  currentDate,
  onSelectBooking,
  onOpenAddBooking
}) => {
  const { isDark, accentConfig } = useTheme();

  // Helper lấy chữ cái đầu tên CTV cho avatar
  const getInitials = (fullName: string): string => {
    if (!fullName) return 'CTV';
    const clean = fullName.trim().replace(/^CTV\s+/i, '');
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'CTV';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // State mở/thu gọn danh sách ca của từng CTV
  const [expandedCtvIds, setExpandedCtvIds] = useState<Set<string>>(new Set());

  const toggleCtvExpand = (id: string) => {
    setExpandedCtvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(ctvStatsList.map((c) => c.id));
    setExpandedCtvIds(allIds);
  };

  const collapseAll = () => {
    setExpandedCtvIds(new Set());
  };

  // Parse initial anchor date
  const [initialYear, initialMonth, initialDay] = useMemo(() => {
    const parts = (currentDate || '2026-09-04').split('-').map(Number);
    return [parts[0] || 2026, parts[1] || 9, parts[2] || 4];
  }, [currentDate]);

  // Year & Month state
  const [year, setYear] = useState<number>(initialYear);
  const [month, setMonth] = useState<number>(initialMonth);

  // Selected date on calendar table
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);

  // CTV search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Month navigation
  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    const dStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setSelectedDate(dStr);
  };

  const ymPrefix = `${year}-${String(month).padStart(2, '0')}`;

  // 1. Chỉ lọc lịch CTV (loại bỏ hoàn toàn các lịch của 'chính tôi'/owner)
  const ctvOnlyBookings = useMemo(() => {
    return bookings.filter(isCTVBooking);
  }, [bookings]);

  // 2. Lịch trong tháng của CTV
  const monthBookings = useMemo(() => {
    return ctvOnlyBookings.filter((b) => b.date && b.date.startsWith(ymPrefix));
  }, [ctvOnlyBookings, ymPrefix]);

  // 3. Ca hợp lệ (không hủy) để tính toán thống kê
  const activeMonthBookings = useMemo(() => {
    return monthBookings.filter((b) => b.status !== 'cancelled');
  }, [monthBookings]);

  // 4. Tổng số ca và tổng số khách chuẩn xác (tính từ ghi chú, mức 100k=1 khách, 200k=2 khách)
  const totalShifts = activeMonthBookings.length;
  const totalGuests = useMemo(() => {
    return activeMonthBookings.reduce((acc, b) => acc + getBookingGuestCount(b), 0);
  }, [activeMonthBookings]);

  // 5. Map ngày -> danh sách booking để hiển thị trên bảng lịch tháng
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    monthBookings.forEach((b) => {
      if (!b.date) return;
      const list = map.get(b.date) || [];
      list.push(b);
      map.set(b.date, list);
    });
    return map;
  }, [monthBookings]);

  // 6. Xây dựng ma trận bảng lịch tháng (Calendar Grid 7 cột: T2 - CN)
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    const totalDays = lastDayOfMonth.getDate();
    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Preceding padding days from prev month
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 2, dayNum);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      days.push({
        dateStr: `${d.getFullYear()}-${mStr}-${dStr}`,
        dayNum,
        isCurrentMonth: false
      });
    }

    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
      const mStr = String(month).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      days.push({
        dateStr: `${year}-${mStr}-${dStr}`,
        dayNum: i,
        isCurrentMonth: true
      });
    }

    // Trailing days to fill full weeks (35 or 42 cells)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month, i);
        const mStr = String(d.getMonth() + 1).padStart(2, '0');
        const dStr = String(d.getDate()).padStart(2, '0');
        days.push({
          dateStr: `${d.getFullYear()}-${mStr}-${dStr}`,
          dayNum: i,
          isCurrentMonth: false
        });
      }
    }

    return days;
  }, [year, month]);

  // Danh sách các ca makeup trong ngày đang chọn trên bảng lịch
  const selectedDateBookings = useMemo(() => {
    const list = bookingsByDate.get(selectedDate) || [];
    return [...list].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [bookingsByDate, selectedDate]);

  const selectedDateGuestCount = useMemo(() => {
    return selectedDateBookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + getBookingGuestCount(b), 0);
  }, [selectedDateBookings]);

  // 7. Nhóm theo từng CTV và tính chuẩn số ca & số khách
  const ctvStatsList = useMemo(() => {
    const map = new Map<string, { ctvInfo?: CTV; bookings: Booking[] }>();

    // Khởi tạo các CTV đã đăng ký
    ctvs.forEach((ctv) => {
      map.set(ctv.id, { ctvInfo: ctv, bookings: [] });
    });

    // Gom ca makeup theo CTV
    monthBookings.forEach((b) => {
      const ctvId = b.ctvId || 'unassigned';
      if (!map.has(ctvId)) {
        map.set(ctvId, {
          ctvInfo: {
            id: ctvId,
            name: b.ctvName || b.ctvNameSnapshot || 'CTV',
            phone: '',
            active: true,
            color: '#8E8E93'
          },
          bookings: []
        });
      }
      map.get(ctvId)!.bookings.push(b);
    });

    const list = Array.from(map.entries()).map(([id, data]) => {
      const activeShifts = data.bookings.filter((b) => b.status !== 'cancelled');
      const shiftCount = activeShifts.length;
      // Tính chính xác số lượng khách theo ghi chú & quy đổi 100k=1 khách
      const guestCount = activeShifts.reduce((acc, b) => acc + getBookingGuestCount(b), 0);
      const completedCount = activeShifts.filter((b) => b.status === 'completed').length;
      const sortedBookings = [...data.bookings].sort((a, b) => {
        const dateComp = a.date.localeCompare(b.date);
        if (dateComp !== 0) return dateComp;
        return a.startTime.localeCompare(b.startTime);
      });

      return {
        id,
        name: data.ctvInfo?.name || 'CTV',
        phone: data.ctvInfo?.phone || '',
        color: data.ctvInfo?.color || '#007AFF',
        totalBookings: data.bookings.length,
        shiftCount,
        guestCount,
        completedCount,
        bookings: sortedBookings
      };
    });

    const filtered = searchQuery.trim()
      ? list.filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery.trim())
        )
      : list;

    return filtered.sort((a, b) => b.shiftCount - a.shiftCount || b.guestCount - a.guestCount);
  }, [ctvs, monthBookings, searchQuery]);

  const activeCtvCount = useMemo(() => {
    return ctvStatsList.filter((c) => c.shiftCount > 0).length;
  }, [ctvStatsList]);

  // Colors & Styles
  const pageBg = isDark ? 'bg-[#000000]' : 'bg-[#F2F2F7]';
  const cardBg = isDark ? 'bg-[#1C1C1E] border-[#2C2C2E]' : 'bg-white border-[#E5E5EA]';
  const innerCardBg = isDark ? 'bg-[#2C2C2E]/60 border-[#3A3A3C]' : 'bg-[#F9F9FB] border-[#E5E5EA]';
  const textPrimary = isDark ? 'text-white' : 'text-[#1C1C1E]';
  const textSecondary = isDark ? 'text-[#8E8E93]' : 'text-[#8E8E93]';
  const inputBg = isDark ? 'bg-[#2C2C2E] border-[#3A3A3C] text-white' : 'bg-white border-[#E5E5EA] text-[#1C1C1E]';

  return (
    <div
      id="ctv-stats-view-container"
      className={`flex-1 flex flex-col h-full min-h-0 overflow-y-auto ${pageBg} select-none`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 16px) + 68px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 12px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 12px)'
      }}
    >
      {/* 1. Header & Month Navigation */}
      <div className="flex flex-col gap-2.5 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-[21px] sm:text-[23px] font-bold tracking-tight ${textPrimary}`}>
              Thống kê CTV
            </h1>
            <p className={`text-[12px] ${textSecondary}`}>
              Bảng lịch điều phối & số lượng ca, khách của từng CTV
            </p>
          </div>

          <button
            type="button"
            onClick={handleCurrentMonth}
            style={{ color: accentConfig.hex }}
            className="text-[12.5px] font-semibold px-2.5 py-1 rounded-lg border border-current hover:opacity-80 active:scale-95 transition-all cursor-pointer"
          >
            Tháng này
          </button>
        </div>

        {/* Month Selector Bar */}
        <div className={`flex items-center justify-between p-1.5 sm:p-2 rounded-2xl border ${cardBg} shadow-2xs`}>
          <button
            type="button"
            onClick={handlePrevMonth}
            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center ${innerCardBg} active:scale-95 transition-all cursor-pointer`}
          >
            <ChevronLeft className={`w-5 h-5 ${textPrimary}`} />
          </button>

          <div className="text-center">
            <span className={`text-[15px] font-bold ${textPrimary}`}>
              Tháng {String(month).padStart(2, '0')}/{year}
            </span>
            <p className={`text-[11px] ${textSecondary}`}>
              {totalShifts} ca · {totalGuests} khách
            </p>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center ${innerCardBg} active:scale-95 transition-all cursor-pointer`}
          >
            <ChevronRight className={`w-5 h-5 ${textPrimary}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-3.5">
        {/* Tổng ca */}
        <div className={`p-2.5 sm:p-3 rounded-2xl border ${cardBg} shadow-2xs flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-semibold ${textSecondary}`}>
              Tổng ca
            </span>
            <div
              className="w-5.5 h-5.5 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: accentConfig.lightBg }}
            >
              <CalendarDays className="w-3.5 h-3.5" style={{ color: accentConfig.hex }} />
            </div>
          </div>
          <div>
            <span className={`text-[19px] sm:text-[21px] font-extrabold ${textPrimary} leading-none tracking-tight`}>
              {totalShifts}
            </span>
            <span className={`text-[10.5px] font-medium ${textSecondary} ml-1`}>ca</span>
          </div>
        </div>

        {/* Tổng khách */}
        <div className={`p-2.5 sm:p-3 rounded-2xl border ${cardBg} shadow-2xs flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-semibold ${textSecondary}`}>
              Tổng khách
            </span>
            <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-950/70 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className={`text-[19px] sm:text-[21px] font-extrabold ${textPrimary} leading-none tracking-tight`}>
              {totalGuests}
            </span>
            <span className={`text-[10.5px] font-medium ${textSecondary} ml-1`}>khách</span>
          </div>
        </div>

        {/* CTV có lịch */}
        <div className={`p-2.5 sm:p-3 rounded-2xl border ${cardBg} shadow-2xs flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-semibold ${textSecondary}`}>
              CTV có lịch
            </span>
            <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-950/70 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className={`text-[19px] sm:text-[21px] font-extrabold ${textPrimary} leading-none tracking-tight`}>
              {activeCtvCount}
            </span>
            <span className={`text-[10.5px] font-medium ${textSecondary} ml-1`}>CTV</span>
          </div>
        </div>
      </div>

      {/* 3. BẢNG LỊCH THÁNG NHƯ CŨ (Calendar Table Grid) */}
      <div className={`rounded-2xl border ${cardBg} shadow-2xs p-2.5 sm:p-3.5 mb-3.5`}>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" style={{ color: accentConfig.hex }} />
            <h2 className={`text-[13.5px] font-bold ${textPrimary}`}>
              Bảng lịch tháng {String(month).padStart(2, '0')}/{year}
            </h2>
          </div>
          <span className={`text-[11px] ${textSecondary}`}>
            Chạm vào ngày để xem chi tiết
          </span>
        </div>

        {/* Weekday headers: T2 -> CN */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {WEEKDAY_NAMES.map((name) => (
            <span
              key={name}
              className={`text-[11px] font-bold uppercase ${textSecondary} py-0.5`}
            >
              {name}
            </span>
          ))}
        </div>

        {/* 7-column Calendar Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarGrid.map((day) => {
            const dayBookings = bookingsByDate.get(day.dateStr) || [];
            const dayCount = dayBookings.length;
            const dayGuests = dayBookings
              .filter((b) => b.status !== 'cancelled')
              .reduce((sum, b) => sum + getBookingGuestCount(b), 0);
            const isSelected = day.dateStr === selectedDate;

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDate(day.dateStr)}
                style={
                  isSelected
                    ? {
                        backgroundColor: accentConfig.lightBg,
                        borderColor: accentConfig.hex
                      }
                    : undefined
                }
                className={`min-h-[52px] sm:min-h-[58px] rounded-xl p-1 flex flex-col items-center justify-between border transition-all cursor-pointer ${
                  !day.isCurrentMonth
                    ? 'opacity-30 border-transparent bg-transparent'
                    : isSelected
                    ? 'shadow-xs ring-1 ring-offset-0'
                    : isDark
                    ? 'bg-[#2C2C2E]/40 border-[#2C2C2E] hover:bg-[#2C2C2E]/70'
                    : 'bg-[#F9F9FB] border-[#E5E5EA] hover:bg-slate-100/70'
                }`}
              >
                {/* Day number */}
                <span
                  style={isSelected ? { color: accentConfig.hex } : undefined}
                  className={`text-[12px] font-bold leading-none ${
                    isSelected ? '' : textPrimary
                  }`}
                >
                  {day.dayNum}
                </span>

                {/* Booking & Guest pill if has bookings */}
                {dayCount > 0 ? (
                  <div className="flex flex-col items-center w-full gap-0.5 mt-0.5">
                    <span
                      style={{
                        backgroundColor: isSelected ? accentConfig.hex : undefined,
                        color: isSelected ? '#FFFFFF' : accentConfig.hex
                      }}
                      className={`text-[9px] font-black px-1 py-0.2 rounded-md leading-none ${
                        isSelected ? '' : isDark ? 'bg-white/10' : 'bg-black/6'
                      }`}
                    >
                      {dayCount} ca
                    </span>
                    <span
                      className={`text-[8.5px] font-semibold leading-none ${
                        isDark ? 'text-blue-300' : 'text-blue-600'
                      }`}
                    >
                      {dayGuests} kh
                    </span>
                  </div>
                ) : (
                  <div className="h-3" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CHI TIẾT CA MAKE NGÀY ĐANG CHỌN TRÊN BẢNG LỊCH */}
      <div className={`rounded-2xl border ${cardBg} shadow-2xs p-3 sm:p-3.5 mb-3.5`}>
        <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className={`text-[13.5px] font-bold ${textPrimary}`}>
              Lịch CTV ngày {formatDisplayDate(selectedDate)}
            </h2>
          </div>
          <span className="text-[11.5px] font-bold text-amber-600 dark:text-amber-400">
            {selectedDateBookings.length} ca · {selectedDateGuestCount} khách
          </span>
        </div>

        {selectedDateBookings.length === 0 ? (
          <div className={`p-4 text-center rounded-xl ${innerCardBg}`}>
            <p className={`text-[12.5px] ${textSecondary}`}>
              Ngày {formatDisplayDate(selectedDate)} chưa có lịch điều phối CTV nào.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateBookings.map((b) => {
              const badge = getStatusBadgeInfo(b.status);
              const guestNum = getBookingGuestCount(b);

              return (
                <div
                  key={b.id}
                  onClick={() => onSelectBooking(b)}
                  className={`p-2.5 rounded-xl border ${innerCardBg} hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-1.5`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[12.5px] font-extrabold ${textPrimary}`}>
                        {b.startTime} - {b.endTime}
                      </span>
                      <span className="text-[11.5px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded-md">
                        {b.ctvNameSnapshot || b.ctvName || 'CTV'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                        isDark ? 'bg-blue-950/70 text-blue-300' : 'bg-blue-50 text-blue-700'
                      }`}>
                        👥 {guestNum} khách
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${badge.badgeColor}`}>
                        <span>{badge.dot}</span>
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-bold truncate ${textPrimary}`}>
                      {b.customerName}
                      {b.packageNameSnapshot && (
                        <span className={`font-normal ${textSecondary} ml-1.5`}>
                          ({b.packageNameSnapshot})
                        </span>
                      )}
                    </span>
                  </div>

                  {b.customerAddress && (
                    <div className="flex items-center gap-1 text-[11.5px] text-[#8E8E93] truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{b.customerAddress}</span>
                    </div>
                  )}

                  {b.note && (
                    <div className={`flex items-start gap-1 text-[11px] p-1.5 rounded-lg ${
                      isDark ? 'bg-[#1C1C1E] text-slate-300' : 'bg-white text-slate-700'
                    }`}>
                      <FileText className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                      <span className="line-clamp-1 italic">{b.note}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. THỐNG KÊ LỊCH MAKEUP MỖI CTV (Số ca, số khách) */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <h2 className={`text-[14px] font-bold ${textPrimary}`}>
              Thống kê ca & khách theo từng CTV
            </h2>
          </div>

          <button
            type="button"
            onClick={expandedCtvIds.size === ctvStatsList.length ? collapseAll : expandAll}
            className={`text-[11.5px] font-semibold text-[#8E8E93] hover:${textPrimary} cursor-pointer`}
          >
            {expandedCtvIds.size === ctvStatsList.length ? 'Thu gọn' : 'Mở tất cả'}
          </button>
        </div>

        {/* Search CTV input */}
        <div className="relative mb-2.5">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm CTV theo tên, SĐT..."
            className={`w-full pl-9 pr-3 py-1.5 text-[12.5px] rounded-xl border outline-hidden transition-all ${inputBg}`}
          />
        </div>

        {ctvStatsList.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${cardBg} shadow-2xs`}>
            <Sparkles className={`w-8 h-8 ${textSecondary} mx-auto mb-1.5 opacity-40`} />
            <p className={`text-[14px] font-bold ${textPrimary}`}>
              Không có CTV nào
            </p>
            <p className={`text-[12px] ${textSecondary} mt-0.5`}>
              {searchQuery ? 'Không tìm thấy CTV phù hợp với từ khóa.' : 'Chưa có CTV nào được tạo trong hệ thống.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {ctvStatsList.map((ctv) => {
              const isExpanded = expandedCtvIds.has(ctv.id);
              const shiftShare = totalShifts > 0 ? Math.round((ctv.shiftCount / totalShifts) * 100) : 0;
              const guestShare = totalGuests > 0 ? Math.round((ctv.guestCount / totalGuests) * 100) : 0;

              return (
                <div
                  key={ctv.id}
                  className={`rounded-2xl border ${cardBg} shadow-2xs overflow-hidden transition-all`}
                >
                  {/* CTV Header Card */}
                  <div
                    onClick={() => toggleCtvExpand(ctv.id)}
                    className="p-3 sm:p-3.5 cursor-pointer hover:opacity-95 active:bg-black/5 dark:active:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      {/* Left: Avatar & CTV info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[13px] text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: ctv.color || '#007AFF' }}
                        >
                          {getInitials(ctv.name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-[14.5px] font-bold truncate ${textPrimary}`}>
                            {ctv.name}
                          </h3>
                          <p className={`text-[11.5px] truncate ${textSecondary}`}>
                            {ctv.phone || 'Chưa cập nhật SĐT'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Số ca & Số khách */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span
                              className="px-2 py-0.5 rounded-lg text-[12px] font-extrabold leading-tight"
                              style={{
                                backgroundColor: accentConfig.lightBg,
                                color: accentConfig.hex
                              }}
                            >
                              {ctv.shiftCount} ca
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[12px] font-extrabold leading-tight ${
                                isDark ? 'bg-blue-950/70 text-blue-300' : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {ctv.guestCount} khách
                            </span>
                          </div>
                          <span className={`text-[10px] ${textSecondary} block mt-0.5`}>
                            {ctv.completedCount} hoàn thành
                          </span>
                        </div>

                        <div className={`p-1.5 rounded-lg ${innerCardBg}`}>
                          {isExpanded ? (
                            <ChevronUp className={`w-3.5 h-3.5 ${textSecondary}`} />
                          ) : (
                            <ChevronDown className={`w-3.5 h-3.5 ${textSecondary}`} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Workload progress bar */}
                    {totalShifts > 0 && (
                      <div className="mt-2.5">
                        <div className="flex justify-between items-center text-[10px] font-medium mb-1">
                          <span className={textSecondary}>Tỷ trọng công việc</span>
                          <span style={{ color: accentConfig.hex }} className="font-bold">
                            {shiftShare}% số ca ({guestShare}% lượng khách)
                          </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#2C2C2E]' : 'bg-[#E5E5EA]'}`}>
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.max(shiftShare, 3)}%`,
                              backgroundColor: ctv.color || accentConfig.hex
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expandable shift list for this CTV */}
                  {isExpanded && (
                    <div className={`border-t ${isDark ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]'} p-3 space-y-2`}>
                      <div className="flex items-center justify-between pb-0.5">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary}`}>
                          Danh sách ca ({ctv.bookings.length})
                        </span>
                        <span className={`text-[10.5px] ${textSecondary}`}>
                          Chạm ca để xem/sửa
                        </span>
                      </div>

                      {ctv.bookings.length === 0 ? (
                        <div className={`p-3 text-center rounded-xl ${innerCardBg}`}>
                          <p className={`text-[12px] ${textSecondary}`}>
                            CTV này chưa có lịch makeup nào trong tháng {String(month).padStart(2, '0')}/{year}.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {ctv.bookings.map((booking) => {
                            const badge = getStatusBadgeInfo(booking.status);
                            const guestNum = getBookingGuestCount(booking);

                            return (
                              <div
                                key={booking.id}
                                onClick={() => onSelectBooking(booking)}
                                className={`p-2.5 rounded-xl border ${innerCardBg} hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex flex-col gap-1`}
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-[#8E8E93]" />
                                    <span className={`text-[12px] font-bold ${textPrimary}`}>
                                      {booking.startTime} - {booking.endTime}
                                    </span>
                                    <span className={`text-[11px] ${textSecondary}`}>
                                      · {formatDisplayDate(booking.date)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-extrabold ${
                                      isDark ? 'bg-blue-950/70 text-blue-300' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                      👥 {guestNum} khách
                                    </span>

                                    <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold flex items-center gap-1 ${badge.badgeColor}`}>
                                      <span>{badge.dot}</span>
                                      <span>{badge.label}</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className={`text-[12.5px] font-bold truncate ${textPrimary}`}>
                                    {booking.customerName}
                                    {booking.packageNameSnapshot && (
                                      <span className={`font-normal ${textSecondary} ml-1.5`}>
                                        ({booking.packageNameSnapshot})
                                      </span>
                                    )}
                                  </span>
                                </div>

                                {booking.customerAddress && (
                                  <div className="flex items-center gap-1 text-[11px] text-[#8E8E93] truncate">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{booking.customerAddress}</span>
                                  </div>
                                )}

                                {booking.note && (
                                  <div className={`flex items-start gap-1 text-[10.5px] p-1.5 rounded-lg ${
                                    isDark ? 'bg-[#1C1C1E] text-slate-300' : 'bg-white text-slate-700'
                                  }`}>
                                    <FileText className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                                    <span className="line-clamp-1 italic">{booking.note}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
