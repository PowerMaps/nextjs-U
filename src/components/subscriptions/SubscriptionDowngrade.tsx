
import React from 'react';
import { useChangePlan } from '@/lib/api/hooks/subscription-hooks';
import { Button } from '@/components/ui/button';

interface SubscriptionDowngradeProps {
  newPlanId: string;
  onSuccess: () => void;
}

export function SubscriptionDowngrade({ newPlanId, onSuccess }: SubscriptionDowngradeProps) {
  const changePlan = useChangePlan();

  const handleDowngrade = async () => {
    await changePlan.mutateAsync({ planId: newPlanId });
    onSuccess();
  };

  return (
    <div>
      <p>Credit for next billing cycle: $XX.XX</p>
      <Button onClick={handleDowngrade} disabled={changePlan.isPending}>
        {changePlan.isPending ? 'Processing...' : 'Downgrade'}
      </Button>
    </div>
  );
}
