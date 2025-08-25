
import React, { useState } from 'react';
import { BookingResponseDto } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BookingModificationModalProps {
  booking: BookingResponseDto;
}

export function BookingModificationModal({ booking }: BookingModificationModalProps) {
  const [startTime, setStartTime] = useState(booking.startTime);
  const [endTime, setEndTime] = useState(booking.endTime);

  const handleModify = async () => {
    // Implement booking modification logic here
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Modify</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modify your booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <Button onClick={handleModify}>Confirm modification</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
