
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket'; // Assuming this hook exists

export function useSubscriptionRealtime() {
  const queryClient = useQueryClient();
  const socket = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleSubscriptionUpdate = (data: any) => {
      queryClient.invalidateQueries(['subscription']);
      queryClient.invalidateQueries(['subscription-plans']);
    };

    socket.on('subscription_update', handleSubscriptionUpdate);

    return () => {
      socket.off('subscription_update', handleSubscriptionUpdate);
    };
  }, [socket, queryClient]);
}
