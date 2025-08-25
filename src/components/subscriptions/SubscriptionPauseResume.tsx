
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionPauseResumeProps {
  isPaused: boolean;
  onTogglePause: () => void;
}

export function SubscriptionPauseResume({ isPaused, onTogglePause }: SubscriptionPauseResumeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pause/Resume Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{isPaused ? 'Your subscription is currently paused.' : 'You can pause your subscription at any time.'}</p>
        <Button onClick={onTogglePause}>
          {isPaused ? 'Resume Subscription' : 'Pause Subscription'}
        </Button>
      </CardContent>
    </Card>
  );
}
