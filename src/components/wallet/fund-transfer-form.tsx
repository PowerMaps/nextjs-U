"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export function FundTransferForm() {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTransfer = async () => {
    if (!recipientEmail || amount === '' || amount <= 0) {
      toast({
        title: "Missing Information",
        description: "Please enter recipient email and a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Transfer Successful",
        description: `Successfully transferred $${amount.toFixed(2)} to ${recipientEmail}.`,
      });
      setRecipientEmail('');
      setAmount('');
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "There was an error processing your transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Funds</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipientEmail">Recipient Email</Label>
          <Input
            id="recipientEmail"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Enter recipient's email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
            placeholder="Enter amount to transfer"
          />
        </div>
        <Button onClick={handleTransfer} className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Transfer Funds"}
        </Button>
      </CardContent>
    </Card>
  );
}