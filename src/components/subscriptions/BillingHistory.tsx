
import React from 'react';
import { useSubscriptionHistory } from '@/lib/api/hooks/subscription-hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const BillingHistory = React.memo(function BillingHistory() {
  const { data: history, isLoading } = useSubscriptionHistory();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{item.plan.name}</TableCell>
                <TableCell>{item.plan.price} {item.plan.currency}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});
