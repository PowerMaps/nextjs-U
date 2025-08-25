
import React, { useState, useEffect } from 'react';
import { useTopUpWallet, useWalletBalance } from '@/lib/api/hooks/wallet-hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Wallet, Info } from 'lucide-react';

interface TopUpModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  suggestedAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  trigger?: React.ReactNode;
}

export function TopUpModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  suggestedAmount = 0,
  minAmount = 1,
  maxAmount = 1000,
  trigger
}: TopUpModalProps) {
  const [amount, setAmount] = useState(suggestedAmount || 10);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [errors, setErrors] = useState<string[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);
  
  const topUpWallet = useTopUpWallet();
  const { balance, currency } = useWalletBalance();

  // Use controlled or uncontrolled mode
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;
  const setOpen = isControlled ? (onClose || (() => {})) : setInternalOpen;

  // Update amount when suggestedAmount changes
  useEffect(() => {
    if (suggestedAmount > 0) {
      setAmount(Math.max(suggestedAmount, minAmount));
    }
  }, [suggestedAmount, minAmount]);

  const validateAmount = (value: number): string[] => {
    const validationErrors: string[] = [];
    
    if (value < minAmount) {
      validationErrors.push(`Minimum top-up amount is ${minAmount} ${currency}`);
    }
    
    if (value > maxAmount) {
      validationErrors.push(`Maximum top-up amount is ${maxAmount} ${currency}`);
    }
    
    if (isNaN(value) || value <= 0) {
      validationErrors.push('Please enter a valid amount');
    }
    
    return validationErrors;
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setAmount(numValue);
    setErrors(validateAmount(numValue));
  };

  const handleTopUp = async () => {
    const validationErrors = validateAmount(amount);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await topUpWallet.mutateAsync({ 
        amount, 
        paymentMethod,
        paymentDetails: { method: paymentMethod }
      });
      
      onSuccess?.();
      if (isControlled) {
        onClose?.();
      } else {
        setInternalOpen(false);
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const quickAmounts = [10, 25, 50, 100];
  const isProcessing = topUpWallet.isPending;

  const dialogContent = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Top Up Wallet
        </DialogTitle>
        <DialogDescription>
          Add funds to your wallet to complete your booking
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Current Balance */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Balance:</span>
              <span className="font-semibold">{balance.toFixed(2)} {currency}</span>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Amount Alert */}
        {suggestedAmount > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You need at least {suggestedAmount.toFixed(2)} {currency} more to complete your booking.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Amount Buttons */}
        <div>
          <Label className="text-sm font-medium">Quick amounts:</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant={amount === quickAmount ? "default" : "outline"}
                size="sm"
                onClick={() => handleAmountChange(quickAmount.toString())}
                disabled={isProcessing}
              >
                {quickAmount}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Custom amount ({currency})</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount || ''}
            onChange={(e) => handleAmountChange(e.target.value)}
            min={minAmount}
            max={maxAmount}
            step="0.01"
            disabled={isProcessing}
          />
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={paymentMethod === 'credit_card' ? "default" : "outline"}
              className="justify-start"
              onClick={() => setPaymentMethod('credit_card')}
              disabled={isProcessing}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Credit Card
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTopUp} 
            disabled={isProcessing || errors.length > 0 || amount < minAmount}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Top Up ${amount.toFixed(2)} ${currency}`
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  // If controlled mode, don't render Dialog wrapper
  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        {dialogContent}
      </Dialog>
    );
  }

  // Uncontrolled mode with trigger
  return (
    <Dialog open={internalOpen} onOpenChange={setInternalOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">Top up</Button>
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
}
