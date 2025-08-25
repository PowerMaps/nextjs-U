
import React from 'react';
import { useCurrentSubscription } from '@/lib/api/hooks/subscription-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SubscriptionDashboard = React.memo(function SubscriptionDashboard() {
  const { data: subscription, isLoading } = useCurrentSubscription();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!subscription) {
    return <div>No active subscription</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p>Plan: {subscription.plan.name}</p>
          <p>Status: {subscription.status}</p>
          <p>Next billing date: {new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
});
