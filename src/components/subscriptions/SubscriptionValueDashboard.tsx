import React from 'react';
import { useBookings } from '@/lib/api/hooks/booking-hooks';
import { useCurrentSubscription, useSubscriptionPlans } from '@/lib/api/hooks/subscription-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const SubscriptionValueDashboard = React.memo(function SubscriptionValueDashboard() {
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: subscription, isLoading: subscriptionLoading } = useCurrentSubscription();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();

  if (bookingsLoading || subscriptionLoading || plansLoading) {
    return <div>Loading...</div>;
  }

  const totalSavings = bookings?.reduce((acc, booking) => acc + (booking.totalCostBeforeDiscount - booking.totalCost), 0) || 0;

  const upgradeSuggestion = () => {
    if (!subscription || !plans) return null;

    const currentPlanIndex = plans.findIndex(plan => plan.id === subscription.plan.id);
    if (currentPlanIndex === -1 || currentPlanIndex === plans.length - 1) return null;

    const nextPlan = plans[currentPlanIndex + 1];

    if (subscription.usage.sessions > subscription.plan.maxSessions * 0.8 || subscription.usage.energy > subscription.plan.maxEnergy * 0.8) {
      return (
        <div className="mt-4">
          <p>You are frequently exceeding your limits. Consider upgrading to the {nextPlan.name} plan.</p>
          <Button>Upgrade to {nextPlan.name}</Button>
        </div>
      );
    }

    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Value</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Total savings: {totalSavings}</p>
        {subscription && (
          <div>
            <p>Current plan: {subscription.plan.name}</p>
            <p>You have used {subscription.usage.sessions} out of {subscription.plan.maxSessions} sessions.</p>
            <p>You have used {subscription.usage.energy} out of {subscription.plan.maxEnergy} kWh.</p>
          </div>
        )}
        {upgradeSuggestion()}
      </CardContent>
    </Card>
  );
});