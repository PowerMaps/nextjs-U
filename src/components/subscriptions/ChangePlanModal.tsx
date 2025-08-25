
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SubscriptionUpgrade } from './SubscriptionUpgrade';
import { SubscriptionDowngrade } from './SubscriptionDowngrade';

interface ChangePlanModalProps {
  newPlanId: string;
  isUpgrade: boolean;
}

export function ChangePlanModal({ newPlanId, isUpgrade }: ChangePlanModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{isUpgrade ? 'Upgrade' : 'Downgrade'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change your plan</DialogTitle>
        </DialogHeader>
        {
          isUpgrade ? (
            <SubscriptionUpgrade newPlanId={newPlanId} onSuccess={() => {}} />
          ) : (
            <SubscriptionDowngrade newPlanId={newPlanId} onSuccess={() => {}} />
          )
        }
      </DialogContent>
    </Dialog>
  );
}
