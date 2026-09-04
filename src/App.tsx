import React, { useState, useMemo } from 'react';
import { ActiveTab, CalendarMode, Booking } from './types';
import { useAppData } from './hooks/useAppData';
import { CalendarView } from './components/calendar/CalendarView';
import { BookingListView } from './components/booking/BookingListView';
import { CTVListView } from './components/ctv/CTVListView';
import { SettingsView } from './components/settings/SettingsView';
import { BottomNav } from './components/layout/BottomNav';
import { BookingDetailModal } from './components/booking/BookingDetailModal';
import { BookingFormModal } from './components/booking/BookingFormModal';
import { findCTVConflicts } from './services/conflictService';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppContent() {
  const {
    bookings,
    ctvs,
    saveBooking,
    deleteBooking,
    updateBookingStatus,
    saveCTV,
    deleteCTV,
    resetDemoData
  } = useAppData();

  const { isDark } = useTheme();

  // Navigation & Calendar states
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('day');

  // Today's anchor date
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    if (y === 2026) {
      return '2026-09-03';
    }
    return d.toISOString().split('T')[0];
  }, []);

  const [currentDate, setCurrentDate] = useState<string>(todayDateStr);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);

  // Handlers
  const handleOpenAddModal = () => {
    setBookingToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setBookingToEdit(booking);
    setIsFormModalOpen(true);
  };

  const handleSaveBooking = (booking: Booking) => {
    saveBooking(booking);
    if (selectedBooking && selectedBooking.id === booking.id) {
      setSelectedBooking(booking);
    }
  };

  const handleDeleteBooking = (id: string) => {
    deleteBooking(id);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(null);
    }
  };

  const handleStatusChange = (id: string, status: Booking['status']) => {
    updateBookingStatus(id, status);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({
        ...selectedBooking,
        status,
        remainingAmount: status === 'paid' ? 0 : selectedBooking.remainingAmount
      });
    }
  };

  // Conflict check for currently opened detail modal
  const selectedBookingConflict = useMemo(() => {
    if (!selectedBooking) return false;
    const conflicts = findCTVConflicts(bookings, {
      id: selectedBooking.id,
      date: selectedBooking.date,
      startTime: selectedBooking.startTime,
      endTime: selectedBooking.endTime,
      performerType: selectedBooking.performerType,
      ctvId: selectedBooking.ctvId
    });
    return conflicts.length > 0;
  }, [selectedBooking, bookings]);

  return (
    <div
      className={`flex items-center justify-center min-h-screen w-full font-sans p-0 sm:p-4 transition-colors ${
        isDark ? 'bg-[#000000]' : 'bg-[#E5E5EA] sm:bg-[#D1D1D6]'
      }`}
    >
      {/* iPhone frame container */}
      <div
        id="app-device-frame"
        className={`w-full h-[100dvh] sm:w-[414px] sm:h-[860px] sm:max-h-[96vh] sm:rounded-[44px] sm:shadow-2xl relative flex flex-col sm:border-[9px] overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#000000] text-white sm:border-[#2C2C2E]'
            : 'bg-white text-[#1C1C1E] sm:border-[#1C1C1E]'
        }`}
      >
        {/* iOS Dynamic Island / Speaker notch simulation on Desktop frame */}
        <div
          className={`hidden sm:flex justify-center pt-2 pb-1 shrink-0 z-30 transition-colors ${
            isDark ? 'bg-[#000000]' : 'bg-white'
          }`}
        >
          <div className="w-28 h-4 bg-[#1C1C1E] rounded-full border border-white/10" />
        </div>

        {/* Tab View Routing */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'calendar' && (
            <CalendarView
              currentDate={currentDate}
              mode={calendarMode}
              bookings={bookings}
              todayDateStr={todayDateStr}
              onDateChange={setCurrentDate}
              onModeChange={setCalendarMode}
              onSelectBooking={(b) => setSelectedBooking(b)}
              onOpenAddBooking={handleOpenAddModal}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingListView
              bookings={bookings}
              onSelectBooking={(b) => setSelectedBooking(b)}
              onOpenAddBooking={handleOpenAddModal}
            />
          )}

          {activeTab === 'ctv' && (
            <CTVListView
              ctvs={ctvs}
              bookings={bookings}
              onSaveCTV={saveCTV}
              onDeleteCTV={deleteCTV}
              onSelectBooking={(b) => setSelectedBooking(b)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView onResetDemo={resetDemoData} />
          )}
        </main>

        {/* Bottom Tab Bar with Floating Action Button */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Booking Detail Modal */}
        <BookingDetailModal
          booking={selectedBooking}
          hasConflict={selectedBookingConflict}
          onClose={() => setSelectedBooking(null)}
          onEdit={handleEditBooking}
          onDelete={handleDeleteBooking}
          onMarkStatus={handleStatusChange}
        />

        {/* Booking Add / Edit Form Modal */}
        <BookingFormModal
          isOpen={isFormModalOpen}
          initialDate={currentDate}
          editBooking={bookingToEdit}
          ctvs={ctvs}
          allBookings={bookings}
          onClose={() => {
            setIsFormModalOpen(false);
            setBookingToEdit(null);
          }}
          onSave={handleSaveBooking}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
