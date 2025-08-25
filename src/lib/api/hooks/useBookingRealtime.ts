
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket'; // Assuming this hook exists

export function useBookingRealtime() {
  const queryClient = useQueryClient();
  const socket = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleBookingUpdate = (data: any) => {
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['booking', data.id]);
    };

    socket.on('booking_update', handleBookingUpdate);

    return () => {
      socket.off('booking_update', handleBookingUpdate);
    };
  }, [socket, queryClient]);
}
