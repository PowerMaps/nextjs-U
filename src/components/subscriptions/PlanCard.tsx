
import React from 'react';
import { SubscriptionPlanResponseDto } from '@/lib/api/hooks/subscription-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PlanCardProps {
  plan: SubscriptionPlanResponseDto;
  onSelect: (planId: string) => void;
}

export const PlanCard = React.memo(function PlanCard({ plan, onSelect }: PlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p>{plan.price} {plan.currency}/{plan.billingCycle}</p>
          <ul>
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <Button onClick={() => onSelect(plan.id)}>Select</Button>
      </CardContent>
    </Card>
  );
});
