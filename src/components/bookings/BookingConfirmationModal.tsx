
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookingResponseDto } from '@/lib/api/types';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingResponseDto;
}

export function BookingConfirmationModal({ isOpen, onClose, booking }: BookingConfirmationModalProps) {
  const savings = booking.totalCostBeforeDiscount - booking.totalCost;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Confirmed!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Your booking for {booking.connector.station.name} has been confirmed.</p>
          <p>Start time: {new Date(booking.startTime).toLocaleString()}</p>
          <p>End time: {new Date(booking.endTime).toLocaleString()}</p>
          <p>Total cost: {booking.totalCost} {booking.currency}</p>
          {savings > 0 && <p className="text-green-500">You saved {savings} {booking.currency} with your subscription!</p>}
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
