
import React, { useState, useEffect } from 'react';
import { useWalletValidation, useBookingPayment } from '@/lib/api/hooks/wallet-hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { TopUpModal } from './TopUpModal';

interface WalletPaymentComponentProps {
  bookingId?: string;
  amount: number;
  currency?: string;
  onPaymentSuccess: () => void;
  onPaymentFailed?: (error: string) => void;
  onInsufficientFunds?: (shortfall: number) => void;
  showBalanceInfo?: boolean;
  disabled?: boolean;
}

export function WalletPaymentComponent({ 
  bookingId, 
  amount, 
  currency = 'USD',
  onPaymentSuccess, 
  onPaymentFailed,
  onInsufficientFunds,
  showBalanceInfo = true,
  disabled = false
}: WalletPaymentComponentProps) {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [paymentAttempted, setPaymentAttempted] = useState(false);
  
  const { 
    balance, 
    currency: walletCurrency, 
    validateSufficientFunds, 
    refreshBalance 
  } = useWalletValidation();
  
  const bookingPayment = useBookingPayment();

  // Validate funds whenever amount or balance changes
  const validation = validateSufficientFunds(amount);

  useEffect(() => {
    if (!validation.isValid && onInsufficientFunds) {
      onInsufficientFunds(validation.shortfall);
    }
  }, [validation.isValid, validation.shortfall, onInsufficientFunds]);

  const handlePayment = async () => {
    if (!bookingId) {
      onPaymentFailed?.('Booking ID is required for payment');
      return;
    }

    setPaymentAttempted(true);

    // Refresh balance before payment to ensure accuracy
    await refreshBalance();
    
    // Re-validate after refresh
    const currentValidation = validateSufficientFunds(amount);
    if (!currentValidation.isValid) {
      onPaymentFailed?.(currentValidation.message);
      setShowTopUpModal(true);
      return;
    }

    try {
      await bookingPayment.mutateAsync({ 
        bookingId, 
        amount 
      });
      onPaymentSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentFailed?.(errorMessage);
    } finally {
      setPaymentAttempted(false);
    }
  };

  const handleTopUpSuccess = () => {
    setShowTopUpModal(false);
    refreshBalance();
  };

  const isProcessing = bookingPayment.isPending || paymentAttempted;

  return (
    <div className="space-y-4">
      {showBalanceInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {balance.toFixed(2)} {walletCurrency}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshBalance}
                disabled={isProcessing}
              >
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!validation.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validation.message}
            <Button
              variant="link"
              className="p-0 h-auto ml-2 text-destructive underline"
              onClick={() => setShowTopUpModal(true)}
            >
              Top up wallet
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Payment Amount:</span>
          <span className="font-medium">{amount.toFixed(2)} {currency}</span>
        </div>
        
        {validation.isValid && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Remaining Balance:</span>
            <span>{(balance - amount).toFixed(2)} {walletCurrency}</span>
          </div>
        )}
      </div>

      <Button 
        onClick={handlePayment} 
        disabled={disabled || !validation.isValid || isProcessing || !bookingId}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : validation.isValid ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Pay {amount.toFixed(2)} {currency}
          </>
        ) : (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Insufficient Funds
          </>
        )}
      </Button>

      {showTopUpModal && (
        <TopUpModal 
          isOpen={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          onSuccess={handleTopUpSuccess}
          suggestedAmount={validation.shortfall}
        />
      )}
    </div>
  );
}
