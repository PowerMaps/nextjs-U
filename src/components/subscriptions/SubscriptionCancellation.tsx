
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCancelSubscription } from '@/lib/api/hooks/subscription-hooks';

export function SubscriptionCancellation() {
  const [showOffers, setShowOffers] = useState(false);
  const cancelSubscription = useCancelSubscription();

  const handleCancel = async () => {
    await cancelSubscription.mutateAsync();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cancel Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {!showOffers ? (
          <div className="space-y-4">
            <p>Are you sure you want to cancel your subscription?</p>
            <Button onClick={() => setShowOffers(true)}>Yes, cancel</Button>
            <Button variant="outline">No, keep my subscription</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Before you go, consider these offers:</p>
            {/* Retention offers go here */}
            <div>
              <label htmlFor="feedback">Please tell us why you are cancelling:</label>
              <textarea id="feedback" className="w-full p-2 border rounded"></textarea>
            </div>
            <Button onClick={handleCancel} disabled={cancelSubscription.isPending}>
              {cancelSubscription.isPending ? 'Processing...' : 'Confirm Cancellation'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
