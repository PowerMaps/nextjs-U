
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionOnboardingWizardProps {
  onStart: () => void;
}

export function SubscriptionOnboardingWizard({ onStart }: SubscriptionOnboardingWizardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Subscriptions!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Unlock exclusive benefits and save on your charging sessions.</p>
        <Button onClick={onStart}>Choose a Plan</Button>
      </CardContent>
    </Card>
  );
}
