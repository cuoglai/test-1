import { Booking, BookingStatus, ReminderOption } from '../types';

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(Math.max(0, amount)) + 'đ';
}

/**
 * Định dạng tiền ngắn gọn dạng 100k, 300k, 500k, 1.000k, 1.500k
 */
export function formatKCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined || amount === 0) return '0k';
  const thousands = Math.round(amount / 1000);
  return `${new Intl.NumberFormat('vi-VN').format(thousands)}k`;
}

/**
 * Định dạng doanh thu tối ưu hiển thị trong ô lịch & tóm tắt:
 * >= 1.000.000 dạng 1,2M, 2,45M, 1M
 * < 1.000.000 dạng 350k, 500k
 */
export function formatRevenueM(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined || amount === 0) return '0đ';
  if (amount >= 1_000_000) {
    const mil = amount / 1_000_000;
    const rounded = Math.round(mil * 100) / 100;
    return `${rounded.toString().replace('.', ',')}M`;
  }
  const thousands = Math.round(amount / 1000);
  return `${new Intl.NumberFormat('vi-VN').format(thousands)}k`;
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

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!d || !m) return dateStr;
  return `${d}/${m}/${y}`;
}

export function getVietnameseDayOfWeek(dateStr: string): string {
  const date = parseDateString(dateStr);
  return DAY_NAMES_VI[date.getDay()];
}

export const SHORT_DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function getVietnameseDateHeader(dateStr: string): {
  dayOfWeek: string;
  day: string;
  dayNum: number;
  month: string;
  monthNumber: string;
  monthNum: number;
  year: number;
  fullDateVi: string;
  collapsedDateVi: string;
  compactDateVi: string;
  formattedHeader: string;
} {
  const date = parseDateString(dateStr);
  const dayOfWeek = DAY_NAMES_VI[date.getDay()];
  const shortDay = SHORT_DAYS_VI[date.getDay()];
  const dayNum = date.getDate();
  const monthNum = date.getMonth() + 1;
  const day = String(dayNum).padStart(2, '0');
  const monthStr = String(monthNum).padStart(2, '0');
  const year = date.getFullYear();

  return {
    dayOfWeek,
    day,
    dayNum,
    month: `Tháng ${monthStr}`,
    monthNumber: monthStr,
    monthNum,
    year,
    fullDateVi: `${dayOfWeek}, ${dayNum}/${monthNum}/${year}`,
    collapsedDateVi: `${shortDay},${dayNum}/${monthNum}`,
    compactDateVi: `${dayOfWeek}, ${dayNum}/${monthNum}/${year}`,
    formattedHeader: `${dayOfWeek}, ngày ${dayNum}/${monthNum}/${year}`
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

export const ALL_BOOKING_STATUSES: { key: BookingStatus; label: string; colorHex: string }[] = [
  { key: 'deposited', label: 'Đã cọc', colorHex: '#007AFF' },
  { key: 'finding_ctv', label: 'Đang tìm CTV', colorHex: '#FF9500' },
  { key: 'assigned', label: 'Đã giao CTV', colorHex: '#5856D6' },
  { key: 'rescheduled', label: 'Dời lịch', colorHex: '#32ADE6' },
  { key: 'cancelled', label: 'Hủy', colorHex: '#FF3B30' },
  { key: 'completed', label: 'Hoàn thành', colorHex: '#34C759' }
];

export function getStatusBadgeInfo(status: BookingStatus | string): {
  label: string;
  badgeClass: string;
  badgeColor: string;
  borderClass: string;
  colorHex: string;
  dot: string;
} {
  switch (status) {
    case 'deposited':
      return {
        label: 'Đã cọc',
        badgeClass: 'bg-[#007AFF]/12 text-[#007AFF] border border-[#007AFF]/35',
        badgeColor: 'bg-[#007AFF]/12 text-[#007AFF] border border-[#007AFF]/35',
        borderClass: 'border-[#007AFF]',
        colorHex: '#007AFF',
        dot: '💳'
      };
    case 'finding_ctv':
      return {
        label: 'Đang tìm CTV',
        badgeClass: 'bg-[#FF9500]/12 text-[#FF9500] border border-[#FF9500]/35',
        badgeColor: 'bg-[#FF9500]/12 text-[#FF9500] border border-[#FF9500]/35',
        borderClass: 'border-[#FF9500]',
        colorHex: '#FF9500',
        dot: '🔍'
      };
    case 'assigned':
      return {
        label: 'Đã giao CTV',
        badgeClass: 'bg-[#5856D6]/12 text-[#5856D6] border border-[#5856D6]/35',
        badgeColor: 'bg-[#5856D6]/12 text-[#5856D6] border border-[#5856D6]/35',
        borderClass: 'border-[#5856D6]',
        colorHex: '#5856D6',
        dot: '🤝'
      };
    case 'rescheduled':
      return {
        label: 'Dời lịch',
        badgeClass: 'bg-[#32ADE6]/12 text-[#32ADE6] border border-[#32ADE6]/35',
        badgeColor: 'bg-[#32ADE6]/12 text-[#32ADE6] border border-[#32ADE6]/35',
        borderClass: 'border-[#32ADE6]',
        colorHex: '#32ADE6',
        dot: '⏳'
      };
    case 'cancelled':
      return {
        label: 'Hủy',
        badgeClass: 'bg-[#FF3B30]/12 text-[#FF3B30] border border-[#FF3B30]/35',
        badgeColor: 'bg-[#FF3B30]/12 text-[#FF3B30] border border-[#FF3B30]/35',
        borderClass: 'border-[#FF3B30]',
        colorHex: '#FF3B30',
        dot: '❌'
      };
    case 'completed':
    case 'paid':
      return {
        label: 'Hoàn thành',
        badgeClass: 'bg-[#34C759]/12 text-[#34C759] border border-[#34C759]/35',
        badgeColor: 'bg-[#34C759]/12 text-[#34C759] border border-[#34C759]/35',
        borderClass: 'border-[#34C759]',
        colorHex: '#34C759',
        dot: '✅'
      };
    default:
      return {
        label: 'Đã cọc',
        badgeClass: 'bg-[#007AFF]/12 text-[#007AFF] border border-[#007AFF]/35',
        badgeColor: 'bg-[#007AFF]/12 text-[#007AFF] border border-[#007AFF]/35',
        borderClass: 'border-[#007AFF]',
        colorHex: '#007AFF',
        dot: '💳'
      };
  }
}

export const getStatusInfo = getStatusBadgeInfo;

/**
 * Định dạng ngày CHỈ TRÊN CÁC THẺ trong tab Booking:
 * Thứ (In đậm): Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7; riêng Chủ Nhật hiển thị là CN.
 * Ngày & Tháng (Font chữ thường): Dạng [ngày] thg [tháng]
 * Bỏ năm: Không hiển thị năm.
 * Ví dụ mẫu: Thứ 2 8 thg 5, CN 13 thg 9
 */
export function formatBookingCardDate(dateStr: string): {
  dayOfWeek: string;
  dayMonth: string;
  fullText: string;
} {
  if (!dateStr) {
    return { dayOfWeek: '', dayMonth: '', fullText: '' };
  }
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return { dayOfWeek: '', dayMonth: dateStr, fullText: dateStr };
  }
  const [year, month, day] = parts;
  const dateObj = new Date(year, month - 1, day);
  const dayIndex = dateObj.getDay(); // 0 = CN, 1 = Thứ 2, ..., 6 = Thứ 7
  const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayOfWeek = dayNames[dayIndex] || '';
  const dayMonth = `${day} thg ${month}`;
  return {
    dayOfWeek,
    dayMonth,
    fullText: `${dayOfWeek} ${dayMonth}`
  };
}

/**
 * Trích xuất và chuẩn hóa số điện thoại Việt Nam từ văn bản tự do.
 * Nhận diện chính xác cả khi số bị phân tách thành cụm 3-4 số, ví dụ:
 * - 0392152562
 * - 0392 152 562, 0392.152.562, 0392-152-562
 * - 039 215 2562, 039.215.2562
 * - +84 392 152 562, +84392152562
 * - Dòng "Số điện thoại: 0392152562" hay "SĐT: 0392 152 562"
 */
export function extractVietnamesePhoneNumber(text: string): string {
  if (!text) return '';

  // 1. Thử tìm theo dòng có từ khóa SĐT / Số điện thoại / Phone / Tel
  const keywordRegex = /(?:số\s*điện\s*thoại|sđt|sdt|điện\s*thoại|phone|tel|hotline)\s*[:：\-]?\s*([0-9\s.\-+()]{9,22})/i;
  const keywordMatch = text.match(keywordRegex);
  if (keywordMatch && keywordMatch[1]) {
    const raw = keywordMatch[1];
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('84') && digits.length === 11) {
      digits = '0' + digits.slice(2);
    }
    if (digits.length === 10 && /^0[35789]/.test(digits)) {
      return digits;
    }
  }

  // 2. Tìm theo cụm số bắt đầu bằng 0 hoặc +84 với các ký tự phân tách chấm, khoảng cách, gạch nối
  // Ví dụ: 0392 152 562 hoặc 0392.152.562
  const candidateRegex = /(?:(?:\+84|0)[.\s-]?[35789](?:[.\s-]?[0-9]){8})\b/g;
  const matches = text.match(candidateRegex);
  if (matches && matches.length > 0) {
    for (const match of matches) {
      let digits = match.replace(/\D/g, '');
      if (digits.startsWith('84') && digits.length === 11) {
        digits = '0' + digits.slice(2);
      }
      if (digits.length === 10 && /^0[35789]/.test(digits)) {
        return digits;
      }
    }
  }

  // 3. Quét từng dòng tìm chuỗi số thỏa mãn 10 chữ số
  const lines = text.split('\n');
  for (const line of lines) {
    const phoneCandidates = line.match(/(?:(?:\+?84|0)[0-9\s.\-]{8,18})/g);
    if (phoneCandidates) {
      for (const cand of phoneCandidates) {
        let digits = cand.replace(/\D/g, '');
        if (digits.startsWith('84') && digits.length === 11) {
          digits = '0' + digits.slice(2);
        }
        if (digits.length === 10 && /^0[35789]/.test(digits)) {
          return digits;
        }
      }
    }
  }

  return '';
}

/**
 * Tự động phân tích các trường thông tin từ mẫu dán nhanh phổ biến của thợ make:
 * Ngày makeup: T6 ngày 11/9
 * Số lượng người: 1
 * Thời gian: 7h30
 * Địa chỉ: Số nhà 37B, ngách 53 ngõ 68 Cầu Giấy
 * Số điện thoại: 0392152562
 */
export function parseBookingTemplate(text: string): {
  phone?: string;
  time?: string;
  date?: string;
  quantity?: number;
  address?: string;
  name?: string;
} {
  const result: {
    phone?: string;
    time?: string;
    date?: string;
    quantity?: number;
    address?: string;
    name?: string;
  } = {};

  if (!text) return result;

  // 1. Số điện thoại
  const phone = extractVietnamesePhoneNumber(text);
  if (phone) result.phone = phone;

  // 2. Thời gian: 7h30, 7h, 07:30, 14:00, v.v.
  const timeMatch = text.match(/(?:thời\s*gian|giờ(?:\s*make)?)\s*[:：\-]?\s*(\d{1,2})(?:[h:](\d{1,2})?)?/i);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if (!isNaN(hours) && hours >= 0 && hours < 24) {
      result.time = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
  }

  // 3. Ngày makeup: T6 ngày 11/9 hoặc ngày 11/09 hoặc 11/9/2026
  const dateMatch = text.match(/(?:ngày\s*makeup|ngày\s*make|ngày)\s*[:：\-]?\s*(?:(?:T\d|thứ\s*\d|CN)\s*)?(?:ngày\s*)?(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?/i);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const yearRaw = dateMatch[3] ? parseInt(dateMatch[3], 10) : new Date().getFullYear();
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      result.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 4. Số lượng người: 1 hoặc 2 hoặc 3 (Hỗ trợ cả quy đổi 100k=1, 200k=2 khách)
  const extractedCount = extractGuestCountFromText(text);
  if (extractedCount !== null && extractedCount > 0) {
    result.quantity = extractedCount;
  } else {
    const qtyMatch = text.match(/(?:số\s*lượng(?:\s*người)?|số\s*người)\s*[:：\-]?\s*(\d+)/i);
    if (qtyMatch) {
      const qty = parseInt(qtyMatch[1], 10);
      if (!isNaN(qty) && qty > 0) result.quantity = qty;
    }
  }

  // 5. Địa chỉ
  const addrMatch = text.match(/(?:địa\s*chỉ|nơi\s*make|địa\s*điểm)\s*[:：\-]?\s*([^\n\r]+)/i);
  if (addrMatch && addrMatch[1]) {
    result.address = addrMatch[1].trim();
  }

  // 6. Tên khách nếu có
  const nameMatch = text.match(/(?:tên\s*khách|tên|khách(?:\s*hàng)?)\s*[:：\-]?\s*([^\n\r]+)/i);
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  }

  return result;
}

/**
 * Kiểm tra xem lịch hẹn có phải là của CTV không.
 * Loại bỏ toàn bộ các lịch của 'chính tôi' (owner) để chỉ hiển thị và đếm CTV.
 */
export function isCTVBooking(booking: Booking): boolean {
  if (!booking) return false;
  // Nếu có đánh dấu là chủ tiệm (owner) thì loại bỏ hoàn toàn
  if ((booking as any).performerType === 'owner') return false;
  // Nếu không có ctvId và performerType không phải ctv
  if (!booking.ctvId && (booking as any).performerType !== 'ctv') return false;
  return true;
}

/**
 * Trích xuất số lượng khách chính xác từ ghi chú / thông tin lịch make:
 * - Dựa vào từ khóa: "2 khách", "3 người", "2 mặt", "SL: 3", "Số người: 2"
 * - Dựa vào vai trò: "1 cô dâu 1 mẹ" -> 2 khách, "cô dâu + 2 tiệc" -> 3 khách
 * - Dựa vào quy đổi tiền: 100k = 1 khách, 200k = 2 khách, 300k = 3 khách, v.v.
 */
export function extractGuestCountFromText(text: string): number | null {
  if (!text) return null;
  const lower = text.toLowerCase();

  // 1. Phân tích từ khóa số lượng trực tiếp:
  // "số lượng: 2", "số lượng người: 3", "sl: 2", "số khách: 3", "sl người: 2"
  const slMatch = lower.match(/(?:số\s*lượng(?:\s*người|\s*khách)?|số\s*(?:người|khách)|sl(?:\s*người|\s*khách)?)\s*[:：\-]?\s*(\d+)/i);
  if (slMatch) {
    const num = parseInt(slMatch[1], 10);
    if (!isNaN(num) && num > 0 && num <= 50) return num;
  }

  // 2. Cụm từ đơn vị rõ ràng: "2 khách", "3 người", "2 mặt", "3 khach", "2 nguoi", "2 mat"
  const directMatch = lower.match(/(\d+)\s*(?:khách|khach|người|nguoi|mặt|mat)\b/i);
  if (directMatch) {
    const num = parseInt(directMatch[1], 10);
    if (!isNaN(num) && num > 0 && num <= 50) return num;
  }

  // 3. Quy đổi theo mức giá CTV: 100k = 1 khách, 200k = 2 khách, 300k = 3 khách...
  // Ví dụ trong ghi chú có "200k", "300k", "100k", "công 200k", "lương 300k"
  const kMoneyMatch = lower.match(/\b([1-9]|1[0-5])00\s*k\b/i);
  if (kMoneyMatch) {
    const hundredUnits = parseInt(kMoneyMatch[1], 10); // '2' từ '200k' -> 2 khách
    if (!isNaN(hundredUnits) && hundredUnits > 0 && hundredUnits <= 20) {
      return hundredUnits;
    }
  }

  // Dạng số tiền đầy đủ: 200.000, 300.000, 100.000, 200000, 300000
  const dotMoneyMatch = lower.match(/\b([1-9]|1[0-5])00[.,]000\b/i);
  if (dotMoneyMatch) {
    const hundredUnits = parseInt(dotMoneyMatch[1], 10);
    if (!isNaN(hundredUnits) && hundredUnits > 0 && hundredUnits <= 20) {
      return hundredUnits;
    }
  }

  // 4. Phát hiện các vai trò khách trang điểm kết hợp:
  // Ví dụ: "1 dâu 1 mẹ", "1 cô dâu + 2 tiệc", "cô dâu + 1 mẹ"
  let roleCount = 0;
  const dauMatch = lower.match(/(\d+)?\s*(?:cô\s*dâu|dâu)\b/i);
  if (dauMatch) {
    roleCount += dauMatch[1] ? parseInt(dauMatch[1], 10) : 1;
  }
  const meMatch = lower.match(/(\d+)?\s*(?:mẹ|me|bác|bà)\b/i);
  if (meMatch) {
    roleCount += meMatch[1] ? parseInt(meMatch[1], 10) : 1;
  }
  const phuMatch = lower.match(/(\d+)\s*(?:phụ\s*dâu|phụ|bạn|tiệc)\b/i);
  if (phuMatch) {
    roleCount += parseInt(phuMatch[1], 10);
  }
  if (roleCount > 1) {
    return roleCount;
  }

  return null;
}

/**
 * Lấy số lượng khách chuẩn xác cho mỗi ca makeup.
 * Ưu tiên:
 * 1. Phân tích văn bản ghi chú/nội dung lịch make (bao gồm quy đổi 100k=1, 200k=2, hoặc 2 khách, 3 người, v.v.)
 * 2. Trường guestCount đã được lưu nếu > 1
 * 3. Trường quantity nếu > 1
 * 4. Trường price nếu rơi vào bội số 100k (100k -> 1, 200k -> 2, 300k -> 3)
 * 5. Mặc định 1 khách nếu không tìm thấy thông tin nào khác
 */
export function getBookingGuestCount(booking: Booking): number {
  if (!booking) return 1;

  // 1. Kiểm tra văn bản trong note và makeupInfo
  const textContent = `${booking.makeupInfo || ''} ${booking.note || ''}`;
  const fromText = extractGuestCountFromText(textContent);
  if (fromText !== null && fromText > 0) {
    return fromText;
  }

  // 2. Nếu đã lưu guestCount cụ thể và lớn hơn 1
  if (typeof booking.guestCount === 'number' && booking.guestCount > 1) {
    return booking.guestCount;
  }

  // 3. Nếu có quantity lớn hơn 1
  if (typeof booking.quantity === 'number' && booking.quantity > 1) {
    return booking.quantity;
  }

  // 4. Nếu có price thuộc các mốc 100k - 1500k chia hết cho 100k
  const price = booking.price || (booking as any).ctvRateAmount;
  if (typeof price === 'number' && price >= 100000 && price <= 1500000 && price % 100000 === 0) {
    return Math.round(price / 100000);
  }

  // 5. Nếu booking.guestCount đã có giá trị
  if (typeof booking.guestCount === 'number' && booking.guestCount > 0) {
    return booking.guestCount;
  }

  return 1;
}

/**
 * Extract short recognizable customer/service name from "Thông tin lịch make".
 * Preserves the original verbatim content completely.
 */
export function getBookingDisplayTitle(booking: Booking): string {
  if (booking.makeupInfo && booking.makeupInfo.trim()) {
    const trimmed = booking.makeupInfo.trim();

    // Nếu có dòng "Tên khách:" hoặc "Khách:"
    const nameMatch = trimmed.match(/(?:tên\s*khách|tên|khách(?:\s*hàng)?)\s*[:：\-]\s*([^\n\r]+)/i);
    if (nameMatch && nameMatch[1].trim()) {
      return nameMatch[1].trim();
    }

    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    const firstLine = lines[0];

    // Nếu dòng đầu là "Ngày makeup: ...", tìm địa chỉ hoặc thông tin khách thay vì hiện "Ngày makeup"
    if (/^ngày\s*makeup/i.test(firstLine)) {
      const addrMatch = trimmed.match(/địa\s*chỉ\s*[:：\-]\s*([^\n\r]+)/i);
      if (addrMatch && addrMatch[1].trim()) {
        const shortAddr = addrMatch[1].trim().split(',').slice(-2).join(',').trim();
        return `Khách – ${shortAddr || addrMatch[1].trim()}`;
      }
      return 'Lịch Makeup';
    }

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

