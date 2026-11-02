import React, { useState, useEffect, useRef } from 'react';
import { Booking, BookingStatus } from '../../types';
import {
  getStatusBadgeInfo,
  getBookingDisplayTitle,
  getBookingMakeupInfo,
  formatDate,
  getBookingGuestCount,
  ALL_BOOKING_STATUSES
} from '../../utils/formatters';
import {
  X,
  Phone,
  User,
  Users,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Clipboard,
  CheckCircle2
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';

interface BookingDetailModalProps {
  booking: Booking | null;
  hasConflict?: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onMarkStatus: (id: string, status: BookingStatus) => void;
  onSaveBooking?: (booking: Booking) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  hasConflict,
  onClose,
  onEdit,
  onDelete,
  onMarkStatus,
  onSaveBooking
}) => {
  const { isDark, accentConfig } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedInfo, setCopiedInfo] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);
  const [pastedNote, setPastedNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // State chỉnh sửa ghi chú trực tiếp
  const [noteText, setNoteText] = useState(booking?.note || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (booking) {
      setNoteText(booking.note || '');
      setIsEditingNote(false);
    }
  }, [booking?.id, booking?.note]);

  if (!booking) return null;

  const statusInfo = getStatusBadgeInfo(booking.status);
  const displayTitle = getBookingDisplayTitle(booking);
  const fullMakeupInfo = getBookingMakeupInfo(booking);

  // Detect phone if present in customerPhone or text
  const phoneMatch = fullMakeupInfo.match(/(?:0|\+84)[3|5|7|8|9][0-9]{8}\b/);
  const activePhone = booking.customerPhone || (phoneMatch ? phoneMatch[0] : null);

  const handleCopyInfo = () => {
    navigator.clipboard.writeText(fullMakeupInfo);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2000);
  };

  // Sao chép riêng cho ô ghi chú
  const handleCopyNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!noteText.trim()) return;
    navigator.clipboard.writeText(noteText);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  // Dán riêng cho ô ghi chú
  const handlePasteNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!navigator.clipboard?.readText) {
        alert('Trình duyệt chưa hỗ trợ tự động đọc bộ nhớ tạm. Bạn có thể nhấn giữ vào ô ghi chú để dán.');
        return;
      }
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) return;

      const newText = noteText ? `${noteText.trim()}\n${clipboardText.trim()}` : clipboardText.trim();
      setNoteText(newText);
      setPastedNote(true);
      setTimeout(() => setPastedNote(false), 2000);

      // Tự động lưu
      if (onSaveBooking) {
        onSaveBooking({
          ...booking,
          note: newText,
          updatedAt: Date.now()
        });
        setNoteSavedFeedback(true);
        setTimeout(() => setNoteSavedFeedback(false), 1500);
      }
    } catch (err) {
      console.warn('Lỗi đọc clipboard:', err);
    }
  };

  // Lưu ghi chú khi người dùng blur hoặc thay đổi
  const handleSaveNote = () => {
    if (noteText !== (booking.note || '')) {
      if (onSaveBooking) {
        onSaveBooking({
          ...booking,
          note: noteText.trim(),
          updatedAt: Date.now()
        });
        setNoteSavedFeedback(true);
        setTimeout(() => setNoteSavedFeedback(false), 1500);
      }
    }
  };

  const sheetBg = isDark ? 'bg-[#141416]' : 'bg-[#F2F2F7]';
  const cardBg = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const cardBorder = isDark ? 'border-[#2C2C2E]' : 'border-[#E5E5EA]';
  const textPrimary = isDark ? 'text-white' : 'text-[#1C1C1E]';
  const textSecondary = isDark ? 'text-[#8E8E93]' : 'text-[#8E8E93]';
  const inputBg = isDark ? 'bg-[#2C2C2E]' : 'bg-[#F2F2F7]';

  const guestCount = getBookingGuestCount(booking);

  return (
    <>
      <div
        id="booking-detail-backdrop"
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
        onClick={onClose}
      >
        <div
          id="booking-detail-sheet"
          style={{
            maxHeight: 'calc(100% - max(env(safe-area-inset-top, 0px), 44px) - 12px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)'
          }}
          className={`${sheetBg} w-full sm:max-w-md rounded-t-[28px] sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden border ${cardBorder}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* iOS Pull Indicator / Grabber Handle */}
          <div className="w-full flex justify-center pt-2.5 pb-1 shrink-0">
            <div className="w-9 h-1 rounded-full bg-[#8E8E93]/40" />
          </div>

          {/* Header Bar */}
          <div className={`px-5 pt-1 pb-3 border-b ${cardBorder} flex justify-between items-center ${cardBg} shrink-0`}>
            <div className="flex items-center gap-2">
              <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${statusInfo.badgeClass}`}>
                {statusInfo.label}
              </span>
              {hasConflict && (
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF2F2] text-[#FF3B30] border border-[#FF3B30]">
                  <AlertTriangle className="w-3 h-3" /> Trùng lịch CTV
                </span>
              )}
            </div>
            <button
              id="close-detail-modal-btn"
              type="button"
              onClick={onClose}
              className={`w-8 h-8 rounded-full ${inputBg} flex items-center justify-center ${textPrimary} hover:opacity-80 active:scale-95 transition-all cursor-pointer`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-3.5">
            {/* 1. Ngày & Giờ Display Banner */}
            <div className={`${cardBg} p-3.5 rounded-2xl border ${cardBorder}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: accentConfig.hex }} />
                  <span className={`text-[18px] font-extrabold tracking-tight ${textPrimary}`}>
                    {booking.startTime} {booking.endTime ? `– ${booking.endTime}` : ''}
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${textSecondary}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(booking.date)}</span>
                </div>
              </div>
            </div>

            {/* 2. Tên khách hàng */}
            <div className={`${cardBg} p-3.5 rounded-2xl border ${cardBorder}`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary} flex items-center gap-1.5 mb-1`}>
                <User className="w-3.5 h-3.5" style={{ color: accentConfig.hex }} />
                Tên khách hàng
              </span>
              <h2 className={`text-[17px] font-bold ${textPrimary}`}>
                {booking.customerName || 'Khách makeup'}
              </h2>
            </div>

            {/* 3. Thông tin chi tiết */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className={`text-[11px] font-bold tracking-wider uppercase ${textSecondary} flex items-center gap-1.5`}>
                  <FileText className="w-3.5 h-3.5" style={{ color: accentConfig.hex }} />
                  Thông tin chi tiết
                </p>
                <button
                  type="button"
                  onClick={handleCopyInfo}
                  style={{ color: accentConfig.hex }}
                  className="text-[11px] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedInfo ? (
                    <>
                      <Check className="w-3 h-3 text-[#34C759]" />
                      <span className="text-[#34C759]">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              <div className={`p-4 rounded-2xl ${cardBg} border ${cardBorder} shadow-2xs`}>
                <p className={`text-[14.5px] ${textPrimary} leading-relaxed whitespace-pre-wrap font-normal select-text`}>
                  {fullMakeupInfo || 'Không có thông tin chi tiết'}
                </p>
              </div>

              {/* Gọi khách nếu có số điện thoại */}
              {activePhone && (
                <div className="pt-1">
                  <a
                    id="detail-call-link"
                    href={`tel:${activePhone}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/30 text-[13px] font-bold hover:bg-[#34C759]/20 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Gọi khách: {activePhone}
                  </a>
                </div>
              )}
            </div>

            {/* 4. Thông số: CTV phụ trách | Số lượng khách */}
            <div className="grid grid-cols-2 gap-2">
              {/* CTV phụ trách */}
              <div className={`p-2.5 ${cardBg} border ${cardBorder} rounded-xl`}>
                <p className={`text-[10px] ${textSecondary} uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1`}>
                  <User className="w-3 h-3 text-[#5856D6]" /> CTV
                </p>
                <p className="text-[13.5px] font-bold text-[#5856D6] truncate">
                  {booking.ctvNameSnapshot || 'Chưa gán'}
                </p>
              </div>

              {/* Số lượng khách */}
              <div className={`p-2.5 ${cardBg} border ${cardBorder} rounded-xl`}>
                <p className={`text-[10px] ${textSecondary} uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1`}>
                  <Users className="w-3 h-3 text-[#32ADE6]" /> Số khách
                </p>
                <p className={`text-[13.5px] font-black text-[#32ADE6] font-mono truncate`}>
                  {guestCount} khách
                </p>
              </div>
            </div>

            {/* 5. Cập nhật Trạng thái (6 trạng thái chuẩn) */}
            <div className={`${cardBg} p-3 rounded-2xl border ${cardBorder} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary}`}>
                  Trạng thái lịch hẹn
                </span>
                <span className="text-[11px] font-bold" style={{ color: statusInfo.colorHex }}>
                  ● {statusInfo.label}
                </span>
              </div>

              {/* 6 nút chọn trạng thái */}
              <div className="grid grid-cols-3 gap-1.5">
                {ALL_BOOKING_STATUSES.map((st) => {
                  const isCurrent = booking.status === st.key;
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => onMarkStatus(booking.id, st.key)}
                      style={
                        isCurrent
                          ? { backgroundColor: st.colorHex, color: '#FFFFFF', borderColor: st.colorHex }
                          : undefined
                      }
                      className={`h-8 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                        isCurrent
                          ? 'shadow-xs scale-[1.01]'
                          : `${inputBg} ${textPrimary} ${cardBorder} hover:opacity-80 active:scale-95`
                      }`}
                    >
                      {isCurrent && <Check className="w-3 h-3 stroke-[3]" />}
                      <span className="truncate">{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Ghi chú (Chạm vào sửa trực tiếp, có nút Sao chép & Dán) */}
            <div className={`${cardBg} p-3.5 rounded-2xl border ${cardBorder} space-y-2`}>
              <div className="flex items-center justify-between">
                <p className={`text-[11px] font-bold tracking-wider uppercase ${textSecondary} flex items-center gap-1`}>
                  <FileText className="w-3 h-3" />
                  Ghi chú (Chạm để sửa trực tiếp)
                </p>

                {/* Cụm nút: Sao chép & Dán riêng biệt */}
                <div className="flex items-center gap-1.5">
                  {noteSavedFeedback && (
                    <span className="text-[10px] font-bold text-[#34C759] flex items-center gap-0.5 animate-in fade-in">
                      <CheckCircle2 className="w-3 h-3" /> Đã lưu
                    </span>
                  )}

                  {/* Nút Sao chép ghi chú */}
                  <button
                    type="button"
                    onClick={handleCopyNote}
                    title="Sao chép ghi chú"
                    className={`h-6.5 px-2 rounded-md text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                      copiedNote
                        ? 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30'
                        : `${inputBg} ${textPrimary} ${cardBorder} hover:opacity-80`
                    }`}
                  >
                    {copiedNote ? (
                      <>
                        <Check className="w-3 h-3 text-[#34C759]" />
                        <span className="text-[#34C759]">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" style={{ color: accentConfig.hex }} />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>

                  {/* Nút Dán vào ghi chú */}
                  <button
                    type="button"
                    onClick={handlePasteNote}
                    title="Dán từ bộ nhớ tạm"
                    className={`h-6.5 px-2 rounded-md text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                      pastedNote
                        ? 'bg-[#34C759]/15 text-[#34C759] border-[#34C759]/30'
                        : `${inputBg} ${textPrimary} ${cardBorder} hover:opacity-80`
                    }`}
                  >
                    {pastedNote ? (
                      <>
                        <Check className="w-3 h-3 text-[#34C759]" />
                        <span className="text-[#34C759]">Đã dán</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3 h-3" style={{ color: accentConfig.hex }} />
                        <span>Dán</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Ô chỉnh sửa trực tiếp không cần bấm nút Chỉnh sửa */}
              <div
                onClick={() => {
                  setIsEditingNote(true);
                  setTimeout(() => noteTextareaRef.current?.focus(), 50);
                }}
                className="cursor-text"
              >
                {isEditingNote ? (
                  <textarea
                    ref={noteTextareaRef}
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onBlur={() => {
                      handleSaveNote();
                      setIsEditingNote(false);
                    }}
                    placeholder="Nhập ghi chú cho ca này (tự động lưu khi bấm ra ngoài)..."
                    className={`w-full p-2.5 rounded-xl ${inputBg} border border-[var(--color-accent)] text-[13.5px] ${textPrimary} leading-relaxed focus:outline-none resize-none transition-all`}
                  />
                ) : (
                  <div
                    className={`p-2.5 rounded-xl ${inputBg} border border-transparent hover:border-dashed hover:border-black/20 dark:hover:border-white/20 transition-all min-h-[50px]`}
                  >
                    {noteText ? (
                      <p className={`text-[13.5px] ${textPrimary} whitespace-pre-wrap leading-relaxed`}>
                        {noteText}
                      </p>
                    ) : (
                      <p className={`text-[12.5px] ${textSecondary} italic flex items-center gap-1`}>
                        <Edit3 className="w-3.5 h-3.5 opacity-60" /> Chạm vào đây để nhập ghi chú...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className={`p-4 border-t ${cardBorder} ${cardBg} space-y-2 shrink-0`}>
            <div className="flex items-center gap-2">
              <button
                id="edit-booking-btn"
                type="button"
                onClick={() => {
                  onEdit(booking);
                  onClose();
                }}
                style={{ backgroundColor: accentConfig.hex }}
                className="flex-1 h-11 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa toàn bộ</span>
              </button>

              <button
                id="close-booking-btn"
                type="button"
                onClick={onClose}
                className={`flex-1 h-11 rounded-xl border ${cardBorder} ${inputBg} ${textPrimary} font-bold text-[14px] flex items-center justify-center gap-1.5 hover:opacity-85 active:scale-95 transition-all cursor-pointer shadow-2xs`}
              >
                <X className="w-4 h-4" />
                <span>Thoát</span>
              </button>

              <button
                id="delete-booking-btn"
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-[28%] sm:w-[30%] h-11 rounded-xl bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30 font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-1 hover:bg-[#FF3B30]/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span className="truncate">Xóa</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa lịch Makeup?"
        message={`Bạn có chắc muốn xóa lịch "${displayTitle}" vào ngày ${booking.date}? Thao tác này không thể hoàn tác.`}
        confirmText="Xác nhận xóa"
        cancelText="Giữ lại"
        isDestructive={true}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete(booking.id);
          onClose();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
