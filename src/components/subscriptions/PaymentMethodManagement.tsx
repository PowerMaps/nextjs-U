
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentMethodManagement = React.memo(function PaymentMethodManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Add new payment method</Button>
      </CardContent>
    </Card>
  );
});
