
'use client';

import React from 'react';
import { BookingAnalytics } from '@/components/bookings/BookingAnalytics';
import { BookingCard } from '@/components/bookings/BookingCard';
import { useUserBookings } from '@/lib/api/hooks/booking-hooks';
import { useBookingRealtime } from '@/lib/api/hooks/useBookingRealtime';

export default function BookingsPage() {
  const { data: bookingsData, isLoading } = useUserBookings();
  useBookingRealtime();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <BookingAnalytics />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bookingsData?.items?.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
