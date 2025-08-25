
import React from 'react';
import { useBookings } from '@/lib/api/hooks/booking-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BookingAnalytics() {
  const { data: bookings, isLoading } = useBookings();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalBookings = bookings?.length || 0;
  const totalSpent = bookings?.reduce((acc, booking) => acc + booking.totalCost, 0) || 0;
  const totalSavings = bookings?.reduce((acc, booking) => acc + (booking.totalCostBeforeDiscount - booking.totalCost), 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Total bookings: {totalBookings}</p>
        <p>Total spent: {totalSpent}</p>
        <p>Total savings: {totalSavings}</p>
      </CardContent>
    </Card>
  );
}
