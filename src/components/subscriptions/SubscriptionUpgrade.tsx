
import React from 'react';
import { useChangePlan } from '@/lib/api/hooks/subscription-hooks';
import { Button } from '@/components/ui/button';

interface SubscriptionUpgradeProps {
  newPlanId: string;
  onSuccess: () => void;
}

export function SubscriptionUpgrade({ newPlanId, onSuccess }: SubscriptionUpgradeProps) {
  const changePlan = useChangePlan();

  const handleUpgrade = async () => {
    await changePlan.mutateAsync({ planId: newPlanId });
    onSuccess();
  };

  return (
    <div>
      <p>Pro-rated cost: $XX.XX</p>
      <Button onClick={handleUpgrade} disabled={changePlan.isPending}>
        {changePlan.isPending ? 'Processing...' : 'Upgrade'}
      </Button>
    </div>
  );
}
