
import React from 'react';
import { useSubscriptionPlans } from '@/lib/api/hooks/subscription-hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PlanComparison = React.memo(function PlanComparison() {
  const { data: plans, isLoading } = useSubscriptionPlans();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Plans</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              {plans?.map((plan) => (
                <TableHead key={plan.id}>{plan.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Price</TableCell>
              {plans?.map((plan) => (
                <TableCell key={plan.id}>{plan.price} {plan.currency}/{plan.billingCycle}</TableCell>
              ))}
            </TableRow>
            {/* Add more feature rows here */}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});
