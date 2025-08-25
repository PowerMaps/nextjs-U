
'use client';

import React from 'react';
import { SubscriptionDashboard } from '@/components/subscriptions/SubscriptionDashboard';
import { PlanComparison } from '@/components/subscriptions/PlanComparison';
import { PlanCard } from '@/components/subscriptions/PlanCard';
import { BillingHistory } from '@/components/subscriptions/BillingHistory';
import { PaymentMethodManagement } from '@/components/subscriptions/PaymentMethodManagement';
import { UsageStats } from '@/components/subscriptions/UsageStats';
import { SubscriptionValueDashboard } from '@/components/subscriptions/SubscriptionValueDashboard';
import { SubscriptionOnboardingWizard }m '@/components/subscriptions/SubscriptionOnboardingWizard';
import { SubscriptionCancellation } from '@/components/subscriptions/SubscriptionCancellation';
import { SubscriptionPauseResume } from '@/components/subscriptions/SubscriptionPauseResume';
import { useSubscriptionPlans, useSubscribe, useCurrentSubscription } from '@/lib/api/hooks/subscription-hooks';
import { useSubscriptionRealtime } from '@/lib/api/hooks/useSubscriptionRealtime';

export default function SubscriptionsPage() {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const subscribe = useSubscribe();
  const [error, setError] = React.useState<string | null>(null);
  const { data: currentSubscription, isLoading: isSubscriptionLoading } = useCurrentSubscription();
  const [isPaused, setIsPaused] = React.useState(false);

  useSubscriptionRealtime();

  const handleSelectPlan = (planId: string) => {
    subscribe.mutate({ planId }, {
      onError: (error) => {
        setError(error.message);
      }
    });
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    // Call API to pause/resume subscription
  };

  if (isLoading || isSubscriptionLoading) {
    return <div>Loading...</div>;
  }

  if (!currentSubscription) {
    return (
      <div className="space-y-8">
        <SubscriptionOnboardingWizard onStart={() => {}} />
        <PlanComparison />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans?.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SubscriptionDashboard />
      <PlanComparison />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans?.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
        ))}
      </div>
      <BillingHistory />
      <PaymentMethodManagement />
      <UsageStats />
      <SubscriptionValueDashboard />
      <SubscriptionCancellation />
      <SubscriptionPauseResume isPaused={isPaused} onTogglePause={handleTogglePause} />
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => handleSelectPlan(subscribe.variables.planId)}>Retry</Button>
        </div>
      )}
    </div>
  );
}
