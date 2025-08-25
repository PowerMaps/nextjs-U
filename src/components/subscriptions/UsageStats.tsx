import React from 'react';
import { useCurrentSubscription } from '@/lib/api/hooks/subscription-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

export const UsageStats = React.memo(function UsageStats() {
  const { data: subscription, isLoading } = useCurrentSubscription();
  const { toast } = useToast();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!subscription) {
    return null;
  }

  const sessionUsage = (subscription.usage.sessions / subscription.plan.maxSessions) * 100;
  const energyUsage = (subscription.usage.energy / subscription.plan.maxEnergy) * 100;

  if (sessionUsage > 80) {
    toast({
      title: 'You are approaching your session limit',
      description: `You have used ${subscription.usage.sessions} out of ${subscription.plan.maxSessions} sessions.`,
    });
  }

  if (energyUsage > 80) {
    toast({
      title: 'You are approaching your energy limit',
      description: `You have used ${subscription.usage.energy} out of ${subscription.plan.maxEnergy} kWh.`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p>Sessions: {subscription.usage.sessions} / {subscription.plan.maxSessions}</p>
          <Progress value={sessionUsage} />
        </div>
        <div>
          <p>Energy: {subscription.usage.energy} / {subscription.plan.maxEnergy} kWh</p>
          <Progress value={energyUsage} />
        </div>
      </CardContent>
    </Card>
  );
});