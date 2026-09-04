import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Booking, CTV, MakeupPackage, ReminderOption, PerformerType } from '../../types';
import { findCTVConflicts } from '../../services/conflictService';
import {
  getBookingDisplayTitle,
  getBookingMakeupInfo,
  calculateEndTimeFromDuration,
  formatDateString,
  timeToMinutes
} from '../../utils/formatters';
import { IOSWheelTimePicker } from './IOSWheelTimePicker';
import { useTheme } from '../../contexts/ThemeContext';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  Bell,
  FileText,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Timer
} from 'lucide-react';

interface BookingFormModalProps {
  isOpen: boolean;
  initialDate?: string;
  editBooking?: Booking | null;
  packages?: MakeupPackage[];
  ctvs: CTV[];
  allBookings: Booking[];
  onClose: () => void;
  onSave: (booking: Booking) => void;
}

const REMINDER_CHOICES: { value: ReminderOption; label: string }[] = [
  { value: '15_mins', label: '15 phút' },
  { value: '30_mins', label: '30 phút' },
  { value: '1_hour', label: '1 giờ' },
  { value: '2_hours', label: '2 giờ' },
  { value: '1_day', label: '1 ngày' }
];

// Exact duration choices requested: 45 phút, 2 giờ (default), 4 giờ, 6 giờ
const DURATION_OPTIONS = [
  { label: '45 phút', minutes: 45 },
  { label: '2 giờ', minutes: 120, isDefault: true },
  { label: '4 giờ', minutes: 240 },
  { label: '6 giờ', minutes: 360 }
];

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  initialDate,
  editBooking,
  ctvs,
  allBookings,
  onClose,
  onSave
}) => {
  const { isDark, accentConfig } = useTheme();

  // 1. Thông tin lịch make (ô note lớn, tự do nhiều dòng, tự động mở rộng chiều cao)
  const [makeupInfo, setMakeupInfo] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Reset to auto first so scrollHeight shrinks when text is deleted
    el.style.height = 'auto';
    // Calculate border difference
    const borderAdjustment = el.offsetHeight - el.clientHeight;
    // Auto expand without any max-height cap or scrollbar
    const newHeight = Math.max(el.scrollHeight + borderAdjustment, 90);
    el.style.height = `${newHeight}px`;
  }, []);

  // 2. Ngày
  const [date, setDate] = useState('');

  // 3. Giờ bắt đầu (24h format e.g. "10:30")
  const [startTime, setStartTime] = useState('10:30');
  const [isWheelPickerOpen, setIsWheelPickerOpen] = useState(false);

  // 4. Thời lượng ca (mặc định: 120 phút = 2 giờ)
  const [durationMinutes, setDurationMinutes] = useState(120);

  // 6. Người make: Tôi / CTV
  const [performerType, setPerformerType] = useState<PerformerType>('owner');
  const [ctvId, setCtvId] = useState('');

  // 7. Thông báo trước (mặc định 30 phút)
  const [reminder, setReminder] = useState<ReminderOption>('30_mins');

  // 8. Ghi chú thêm
  const [note, setNote] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isOpen) return;

    if (editBooking) {
      setMakeupInfo(editBooking.makeupInfo ?? getBookingMakeupInfo(editBooking));
      setDate(editBooking.date);
      const start = editBooking.startTime || '10:30';
      setStartTime(start);

      // Duration
      if (editBooking.startTime && editBooking.endTime) {
        let diff = timeToMinutes(editBooking.endTime) - timeToMinutes(editBooking.startTime);
        if (diff <= 0) diff += 1440;
        // Match closest option or keep
        setDurationMinutes(diff > 0 ? diff : 120);
      } else {
        setDurationMinutes(120);
      }

      setPerformerType(editBooking.performerType || 'owner');
      setCtvId(editBooking.ctvId || ctvs[0]?.id || '');
      setReminder(editBooking.reminder || '30_mins');
      setNote(editBooking.note || '');
    } else {
      setMakeupInfo('');
      const todayStr = initialDate || formatDateString(new Date());
      setDate(todayStr);
      setStartTime('10:30');
      setDurationMinutes(120); // Default 2 hours
      setPerformerType('owner');
      setCtvId(ctvs[0]?.id || '');
      setReminder('30_mins');
      setNote('');
    }
    setIsWheelPickerOpen(false);
    setErrors({});
  }, [isOpen, editBooking, initialDate, ctvs]);

  // Tự động mở rộng chiều cao theo toàn bộ nội dung khi mở modal hoặc thay đổi nội dung
  useEffect(() => {
    if (isOpen) {
      adjustTextareaHeight();
      const raf = requestAnimationFrame(() => {
        adjustTextareaHeight();
      });
      const timer = setTimeout(() => {
        adjustTextareaHeight();
      }, 50);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [isOpen, makeupInfo, adjustTextareaHeight]);

  // 5. Giờ kết thúc tự động tính: Giờ bắt đầu + Thời lượng ca
  const endCalculation = useMemo(() => {
    return calculateEndTimeFromDuration(startTime, durationMinutes);
  }, [startTime, durationMinutes]);

  // Conflict check for CTV
  const conflicts = findCTVConflicts(allBookings, {
    id: editBooking?.id,
    date,
    startTime,
    endTime: endCalculation.endTime,
    performerType,
    ctvId
  });

  const selectedCTV = ctvs.find((c) => c.id === ctvId) || ctvs[0];

  // Quick date chips
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setDate(formatDateString(d));
    if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
  };

  // Friendly date label
  const formattedDateLabel = useMemo(() => {
    if (!date) return 'Chọn ngày';
    const today = formatDateString(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateString(tomorrow);

    if (date === today) return 'Hôm nay';
    if (date === tomorrowStr) return 'Ngày mai';

    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }, [date]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!makeupInfo.trim()) {
      newErrors.makeupInfo = 'Vui lòng nhập thông tin khách / lịch make.';
    }
    if (!date) {
      newErrors.date = 'Vui lòng chọn ngày makeup.';
    }
    if (!startTime) {
      newErrors.startTime = 'Vui lòng chọn giờ bắt đầu.';
    }
    if (performerType === 'ctv' && !ctvId && ctvs.length > 0) {
      newErrors.ctvId = 'Vui lòng chọn CTV thực hiện.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const displayTitle = getBookingDisplayTitle({ makeupInfo } as any);
    const phoneMatch = makeupInfo.match(/(?:0|\+84)[3|5|7|8|9][0-9]{8}\b/);
    const customerPhone = phoneMatch ? phoneMatch[0] : editBooking?.customerPhone || '';

    const bookingData: Booking = {
      id: editBooking?.id || 'b-' + Date.now().toString(36),
      customerId: editBooking?.customerId,

      date,
      startTime,
      endTime: endCalculation.endTime,

      makeupInfo: makeupInfo.trim(),
      customerName: displayTitle || editBooking?.customerName || 'Khách makeup',
      customerPhone,
      customerAddress: editBooking?.customerAddress || '',
      quantity: editBooking?.quantity || 1,

      packageId: editBooking?.packageId || '',
      packageNameSnapshot: editBooking?.packageNameSnapshot || 'Makeup',
      packagePrice: 0,
      deposit: 0,
      surcharge: 0,
      totalAmount: 0,
      remainingAmount: 0,

      performerType,
      ctvId: performerType === 'ctv' ? (ctvId || selectedCTV?.id) : undefined,
      ctvNameSnapshot: performerType === 'ctv' ? (selectedCTV?.name || 'CTV') : undefined,

      reminder,
      note: note.trim(),
      status: editBooking?.status || (performerType === 'ctv' ? 'assigned' : 'deposited'),

      createdAt: editBooking?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    onSave(bookingData);
    onClose();
  };

  if (!isOpen) return null;

  // Unified theme tokens
  const sheetBg = isDark ? 'bg-[#141416]' : 'bg-[#F2F2F7]';
  const cardBg = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]';
  const textPrimary = isDark ? 'text-white' : 'text-[#1C1C1E]';
  const textSecondary = isDark ? 'text-[#8E8E93]' : 'text-[#636366]';
  const inputBg = isDark ? 'bg-[#2C2C2E]' : 'bg-[#F2F2F7]';
  const dividerCol = isDark ? 'divide-[#2C2C2E]' : 'divide-[#E5E5EA]';

  return (
    <div
      id="booking-form-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        id="booking-form-sheet"
        className={`${sheetBg} w-full sm:max-w-lg rounded-t-[28px] sm:rounded-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border ${cardBorder}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 pt-4 pb-3 border-b ${cardBorder} flex justify-between items-center ${cardBg} shrink-0`}>
          <div>
            <h2 className={`text-[17px] font-bold ${textPrimary}`}>
              {editBooking ? 'Chỉnh sửa lịch Makeup' : 'Tạo lịch mới'}
            </h2>
            <p className={`text-[12px] ${textSecondary}`}>Đặt lịch makeup nhanh và tự động</p>
          </div>
          <button
            id="close-booking-form-btn"
            type="button"
            onClick={onClose}
            className={`w-9 h-9 rounded-full ${inputBg} flex items-center justify-center ${textPrimary} hover:opacity-80 active:scale-95 transition-all cursor-pointer`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body: Exact sequence requested by user */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">

          {/* ============================================================ */}
          {/* 1. THÔNG TIN LỊCH MAKE (Đưa lên đầu tiên ngay dưới tiêu đề)   */}
          {/* ============================================================ */}
          <div className={`${cardBg} p-3.5 rounded-2xl border ${cardBorder} shadow-xs space-y-2`}>
            <div className="flex justify-between items-center">
              <label
                htmlFor="booking-input-makeup-info"
                className={`text-[13px] font-bold ${textSecondary} flex items-center gap-1.5`}
              >
                <FileText className="w-4 h-4" style={{ color: accentConfig.hex }} />
                Thông tin lịch make <span className="text-[#FF3B30]">*</span>
              </label>
              <span className={`text-[11px] ${textSecondary}`}>Tự do nhiều dòng</span>
            </div>

            <textarea
              ref={textareaRef}
              id="booking-input-makeup-info"
              rows={3}
              value={makeupInfo}
              onChange={(e) => {
                setMakeupInfo(e.target.value);
                if (errors.makeupInfo) setErrors((prev) => ({ ...prev, makeupInfo: '' }));
                adjustTextareaHeight();
              }}
              placeholder="Nhập tên khách, SĐT, địa chỉ, số người, ghi chú...&#10;Ví dụ: Chị Lan – 0912345678 – Make tiệc cưới tại nhà"
              className={`w-full p-3 rounded-xl ${inputBg} border border-transparent focus:outline-none text-[15px] ${textPrimary} leading-relaxed placeholder:${textSecondary}/60 min-h-[90px] resize-none overflow-hidden`}
              style={{
                borderColor: errors.makeupInfo ? '#FF3B30' : undefined
              }}
            />
            {errors.makeupInfo && (
              <p className="text-[11px] text-[#FF3B30] font-medium">{errors.makeupInfo}</p>
            )}
          </div>

          {/* ============================================================ */}
          {/* 2 & 3. NGÀY VÀ GIỜ BẮT ĐẦU                                  */}
          {/* ============================================================ */}
          <div className={`${cardBg} rounded-2xl border ${cardBorder} shadow-xs divide-y ${dividerCol} overflow-hidden`}>
            
            {/* Row 2: Ngày */}
            <div className="flex items-center justify-between p-3.5 relative">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: accentConfig.lightBg, color: accentConfig.hex }}
                >
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className={`text-[14px] font-bold ${textPrimary} block leading-tight`}>
                    Ngày makeup
                  </span>
                  <span className="text-[13px] font-semibold" style={{ color: accentConfig.hex }}>
                    {formattedDateLabel}
                  </span>
                </div>
              </div>

              {/* Quick shortcut chips */}
              <div className="flex items-center gap-1.5 z-20">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className={`text-[11px] font-semibold px-2.5 h-7 rounded-lg ${inputBg} ${textPrimary} border ${cardBorder} active:scale-95 transition-all`}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className={`text-[11px] font-semibold px-2.5 h-7 rounded-lg ${inputBg} ${textPrimary} border ${cardBorder} active:scale-95 transition-all`}
                >
                  Ngày mai
                </button>
              </div>

              {/* Native Date Picker trigger overlay */}
              <input
                id="booking-input-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                }}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                aria-label="Chọn ngày"
              />
            </div>

            {/* Row 3: Giờ bắt đầu (Bấm để mở Wheel Picker) */}
            <div className="p-3.5">
              <div
                id="btn-toggle-time-picker"
                onClick={() => setIsWheelPickerOpen(!isWheelPickerOpen)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: accentConfig.lightBg, color: accentConfig.hex }}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[14px] font-bold ${textPrimary} block leading-tight`}>
                      Giờ bắt đầu
                    </span>
                    <span className={`text-[12px] ${textSecondary}`}>Định dạng 24 giờ</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[20px] font-black tracking-tight px-3 py-1 rounded-xl font-mono"
                    style={{ backgroundColor: accentConfig.lightBg, color: accentConfig.hex }}
                  >
                    {startTime}
                  </span>
                  {isWheelPickerOpen ? (
                    <ChevronUp className={`w-4 h-4 ${textSecondary}`} />
                  ) : (
                    <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
                  )}
                </div>
              </div>

              {/* iPhone Wheel Picker (Cố định, không lệch) */}
              {isWheelPickerOpen && (
                <div className="mt-3 pt-3 border-t border-dashed" style={{ borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }}>
                  <IOSWheelTimePicker
                    value={startTime}
                    onChange={(newTime) => {
                      setStartTime(newTime);
                      if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: '' }));
                    }}
                    onClose={() => setIsWheelPickerOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
          {errors.date && <p className="text-[11px] text-[#FF3B30] font-medium px-1">{errors.date}</p>}
          {errors.startTime && <p className="text-[11px] text-[#FF3B30] font-medium px-1">{errors.startTime}</p>}

          {/* ============================================================ */}
          {/* 4. THỜI LƯỢNG CA (45 phút, 2 giờ [mặc định], 4 giờ, 6 giờ)  */}
          {/* ============================================================ */}
          <div className={`${cardBg} p-3.5 rounded-2xl border ${cardBorder} shadow-xs space-y-2.5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" style={{ color: accentConfig.hex }} />
                <span className={`text-[13px] font-bold ${textSecondary}`}>
                  Thời lượng ca
                </span>
              </div>
              <span
                className="text-[12px] font-bold px-2.5 py-0.5 rounded-lg font-mono"
                style={{ backgroundColor: accentConfig.lightBg, color: accentConfig.hex }}
              >
                {DURATION_OPTIONS.find((d) => d.minutes === durationMinutes)?.label || `${durationMinutes} phút`}
              </span>
            </div>

            {/* 4 nút lựa chọn gọn và đồng nhất: 45 phút, 2 giờ, 4 giờ, 6 giờ */}
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = durationMinutes === opt.minutes;
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => setDurationMinutes(opt.minutes)}
                    style={
                      isSelected
                        ? { backgroundColor: accentConfig.hex, color: '#FFFFFF' }
                        : undefined
                    }
                    className={`h-11 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'shadow-xs scale-[1.02]'
                        : `${inputBg} ${textPrimary} hover:opacity-80 active:scale-95 border ${cardBorder}`
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 5. GIỜ KẾT THÚC TỰ ĐỘNG (Không cho chỉnh thủ công)           */}
          {/* ============================================================ */}
          <div className={`${cardBg} p-3.5 rounded-2xl border ${cardBorder} shadow-xs flex items-center justify-between`}>
            <div>
              <span className={`text-[12px] font-bold ${textSecondary} block leading-tight`}>
                Giờ kết thúc (Tự động tính)
              </span>
              <p className={`text-[11px] ${textSecondary} mt-0.5`}>
                {startTime} + {DURATION_OPTIONS.find((d) => d.minutes === durationMinutes)?.label || `${durationMinutes}p`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[18px] font-black text-[#34C759] tracking-tight bg-[#34C759]/10 px-3 py-1 rounded-xl font-mono">
                {endCalculation.displayFormatted}
              </span>
              {endCalculation.isNextDay && (
                <p className="text-[10px] font-bold text-[#FF9500] mt-0.5">Sang ngày hôm sau</p>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 6. NGƯỜI MAKE: TÔI / CTV                                    */}
          {/* ============================================================ */}
          <div className={`${cardBg} p-3.5 rounded-2xl border ${cardBorder} shadow-xs space-y-2.5`}>
            <span className={`text-[12px] font-bold ${textSecondary} block`}>
              Người make
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="performer-owner-btn"
                type="button"
                onClick={() => setPerformerType('owner')}
                style={
                  performerType === 'owner'
                    ? { backgroundColor: accentConfig.hex, color: '#FFFFFF' }
                    : undefined
                }
                className={`h-11 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  performerType === 'owner'
                    ? 'shadow-xs scale-[1.01]'
                    : `${inputBg} ${textSecondary} hover:${textPrimary} border ${cardBorder}`
                }`}
              >
                <span>👑</span>
                Tôi
              </button>

              <button
                id="performer-ctv-btn"
                type="button"
                onClick={() => setPerformerType('ctv')}
                className={`h-11 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  performerType === 'ctv'
                    ? 'bg-[#5856D6] text-white shadow-xs scale-[1.01]'
                    : `${inputBg} ${textSecondary} hover:${textPrimary} border ${cardBorder}`
                }`}
              >
                <span>🤝</span>
                CTV
              </button>
            </div>

            {/* Chọn CTV khi chọn mục CTV */}
            {performerType === 'ctv' && (
              <div className={`pt-2 border-t ${cardBorder} space-y-2`}>
                <label className={`block text-[11px] font-bold ${textSecondary}`}>
                  Chọn CTV thực hiện
                </label>
                <select
                  id="booking-select-ctv"
                  value={ctvId}
                  onChange={(e) => setCtvId(e.target.value)}
                  className={`w-full h-11 px-3 rounded-xl ${inputBg} border ${cardBorder} text-[14px] font-semibold ${textPrimary} focus:outline-none`}
                >
                  {ctvs.map((ctv) => (
                    <option key={ctv.id} value={ctv.id}>
                      {ctv.name} ({ctv.phone})
                    </option>
                  ))}
                </select>

                {conflicts.length > 0 && (
                  <div className="p-2.5 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF3B30] shrink-0" />
                    <p className="text-[11px] text-[#FF3B30] font-medium leading-tight">
                      CTV {selectedCTV?.name} đang có lịch trùng lúc {conflicts[0].overlapStart} – {conflicts[0].overlapEnd}!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* 7. THÔNG BÁO TRƯỚC                                          */}
          {/* ============================================================ */}
          <div className={`${cardBg} p-3.5 rounded-2xl border ${cardBorder} shadow-xs space-y-2`}>
            <div className="flex justify-between items-center">
              <span className={`text-[12px] font-bold ${textSecondary} flex items-center gap-1.5`}>
                <Bell className="w-3.5 h-3.5" style={{ color: accentConfig.hex }} />
                Thông báo trước
              </span>
              <span className={`text-[11px] ${textSecondary}`}>Mặc định 30 phút</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {REMINDER_CHOICES.map((choice) => {
                const isSelected = reminder === choice.value;
                return (
                  <button
                    key={choice.value}
                    id={`reminder-option-${choice.value}`}
                    type="button"
                    onClick={() => setReminder(choice.value)}
                    style={
                      isSelected
                        ? { backgroundColor: accentConfig.hex, color: '#FFFFFF' }
                        : undefined
                    }
                    className={`h-9 px-3 rounded-xl text-[12px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'shadow-xs'
                        : `${inputBg} ${textPrimary} border ${cardBorder} hover:opacity-80`
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    {choice.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 8. GHI CHÚ THÊM                                             */}
          {/* ============================================================ */}
          <div className={`${cardBg} p-3.5 rounded-2xl border ${cardBorder} shadow-xs space-y-1.5`}>
            <label
              htmlFor="booking-input-note"
              className={`block text-[12px] font-bold ${textSecondary}`}
            >
              Ghi chú thêm
            </label>
            <textarea
              id="booking-input-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: “Khách thích tông cam đào”, “Đến sớm 15 phút”…"
              className={`w-full p-2.5 rounded-xl ${inputBg} border border-transparent text-[13px] ${textPrimary} focus:outline-none resize-none transition-all placeholder:${textSecondary}/60`}
            />
          </div>

        </form>

        {/* ============================================================ */}
        {/* 9. NÚT "LƯU LỊCH MAKEUP" (Dưới cùng, to rõ, 1 chạm)         */}
        {/* ============================================================ */}
        <div className={`p-4 border-t ${cardBorder} ${cardBg} shrink-0`}>
          <button
            id="save-booking-submit-btn"
            type="button"
            onClick={() => handleSubmit()}
            style={{ backgroundColor: accentConfig.hex }}
            className="w-full h-12 rounded-xl text-white font-extrabold text-[15px] shadow-md hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            LƯU LỊCH MAKEUP
          </button>
        </div>
      </div>
    </div>
  );
};
