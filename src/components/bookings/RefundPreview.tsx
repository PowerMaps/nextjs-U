
import React from 'react';
import { Button } from '@/components/ui/button';

interface RefundPreviewProps {
  bookingId: string;
}

export function RefundPreview({ bookingId }: RefundPreviewProps) {
  const [refundAmount, setRefundAmount] = React.useState<number | null>(null);

  const handlePreview = async () => {
    // Implement refund preview logic here
    setRefundAmount(10.0);
  };

  return (
    <div>
      <Button onClick={handlePreview}>Cancel booking</Button>
      {refundAmount !== null && <p>You will be refunded {refundAmount}</p>}
    </div>
  );
}
