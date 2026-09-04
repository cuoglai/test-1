import { useState, useEffect, useCallback } from 'react';
import { Booking, CTV, MakeupPackage, Customer, BookingStatus } from '../types';
import {
  getBookings,
  getCTVs,
  getPackages,
  getCustomers,
  saveBooking,
  deleteBooking,
  updateBookingStatus,
  savePackage,
  deletePackage,
  saveCTV,
  deleteCTV,
  resetDemoData
} from '../services/storageService';

export function useAppData() {
  const [bookings, setBookings] = useState<Booking[]>(() => getBookings());
  const [ctvs, setCtvs] = useState<CTV[]>(() => getCTVs());
  const [packages, setPackages] = useState<MakeupPackage[]>(() => getPackages());
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());

  const refreshAll = useCallback(() => {
    setBookings(getBookings());
    setCtvs(getCTVs());
    setPackages(getPackages());
    setCustomers(getCustomers());
  }, []);

  useEffect(() => {
    refreshAll();
    const handleStorageChange = () => {
      refreshAll();
    };
    window.addEventListener('makeup_storage_change', handleStorageChange);
    return () => {
      window.removeEventListener('makeup_storage_change', handleStorageChange);
    };
  }, [refreshAll]);

  const handleSaveBooking = useCallback((booking: Booking) => {
    const saved = saveBooking(booking);
    refreshAll();
    return saved;
  }, [refreshAll]);

  const handleDeleteBooking = useCallback((id: string) => {
    deleteBooking(id);
    refreshAll();
  }, [refreshAll]);

  const handleStatusChange = useCallback((id: string, status: BookingStatus) => {
    updateBookingStatus(id, status);
    refreshAll();
  }, [refreshAll]);

  const handleSavePackage = useCallback((pkg: MakeupPackage) => {
    savePackage(pkg);
    refreshAll();
  }, [refreshAll]);

  const handleDeletePackage = useCallback((id: string) => {
    deletePackage(id);
    refreshAll();
  }, [refreshAll]);

  const handleSaveCTV = useCallback((ctv: CTV) => {
    saveCTV(ctv);
    refreshAll();
  }, [refreshAll]);

  const handleDeleteCTV = useCallback((id: string) => {
    deleteCTV(id);
    refreshAll();
  }, [refreshAll]);

  const handleResetDemo = useCallback(() => {
    resetDemoData();
    refreshAll();
  }, [refreshAll]);

  return {
    bookings,
    ctvs,
    packages,
    customers,
    saveBooking: handleSaveBooking,
    deleteBooking: handleDeleteBooking,
    updateBookingStatus: handleStatusChange,
    savePackage: handleSavePackage,
    deletePackage: handleDeletePackage,
    saveCTV: handleSaveCTV,
    deleteCTV: handleDeleteCTV,
    resetDemoData: handleResetDemo,
    refreshAll
  };
}
