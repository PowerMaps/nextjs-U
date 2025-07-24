"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export function TopUpForm() {
  const [amount, setAmount] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTopUp = async () => {
    if (amount === '' || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to top up.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Top-up Successful",
        description: `You have successfully topped up $${amount.toFixed(2)}.`,
      });
      setAmount('');
    } catch (error) {
      toast({
        title: "Top-up Failed",
        description: "There was an error processing your top-up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Up Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
            placeholder="Enter amount"
          />
        </div>
        {/* Placeholder for payment method selection */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="border p-4 rounded-md text-muted-foreground">
            Payment method selection coming soon...
          </div>
        </div>
        <Button onClick={handleTopUp} className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Top Up Now"}
        </Button>
      </CardContent>
    </Card>
  );
}