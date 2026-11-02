import React, { useState, useMemo } from 'react';
import { ActiveTab, CalendarMode, Booking } from './types';
import { useAppData } from './hooks/useAppData';
import { CalendarView } from './components/calendar/CalendarView';
import { BookingListView } from './components/booking/BookingListView';
import { RevenueView } from './components/revenue/RevenueView';
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
    firestoreStatus,
    firestoreError,
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
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'calendar') {
      setCalendarMode('month');
    }
    setActiveTab(tab);
  };

  // Today's anchor date
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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
        remainingAmount: status === 'completed' ? 0 : selectedBooking.remainingAmount
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
      id="app-root-container"
      style={{ minHeight: '-webkit-fill-available' }}
      className={`w-full h-full flex flex-col overflow-hidden font-sans m-0 p-0 transition-colors ${
        isDark ? 'bg-[#000000] text-white' : 'bg-white text-[#1C1C1E]'
      }`}
    >
      {/* Tab View Routing */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
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

        {activeTab === 'revenue' && (
          <RevenueView
            bookings={bookings}
            ctvs={ctvs}
            currentDate={currentDate}
            onSelectBooking={(b) => setSelectedBooking(b)}
            onOpenAddBooking={handleOpenAddModal}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            onResetDemo={resetDemoData}
            ctvs={ctvs}
            bookings={bookings}
            onSaveCTV={saveCTV}
            onDeleteCTV={deleteCTV}
            onSelectBooking={(b) => setSelectedBooking(b)}
            firestoreStatus={firestoreStatus}
            firestoreError={firestoreError}
          />
        )}
      </main>

      {/* Bottom Tab Bar with Floating Action Button */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Booking Detail Modal with inline notes, quick 6-status selector, guest count */}
      <BookingDetailModal
        booking={selectedBooking}
        hasConflict={selectedBookingConflict}
        onClose={() => setSelectedBooking(null)}
        onEdit={handleEditBooking}
        onDelete={handleDeleteBooking}
        onMarkStatus={handleStatusChange}
        onSaveBooking={handleSaveBooking}
      />

      {/* Booking Add / Edit Form Modal with mandatory CTV selection, guest count stepper, 6 statuses */}
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
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
