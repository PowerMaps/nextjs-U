
import React from 'react';
import { BookingResponseDto } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefundPreview } from './RefundPreview';

interface BookingCardProps {
  booking: BookingResponseDto;
}

export function BookingCard({ booking }: BookingCardProps) {
  const savings = booking.totalCostBeforeDiscount - booking.totalCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking #{booking.id}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Station: {booking.connector.station.name}</p>
        <p>Connector: {booking.connector.type}</p>
        <p>Start time: {new Date(booking.startTime).toLocaleString()}</p>
        <p>End time: {new Date(booking.endTime).toLocaleString()}</p>
        <p>Cost: {booking.totalCost}</p>
        {savings > 0 && <p>You saved {savings} with your subscription!</p>}
        <RefundPreview bookingId={booking.id} />
      </CardContent>
    </Card>
  );
}
