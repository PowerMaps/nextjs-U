import React, { useState } from 'react';
import { WalletPaymentComponent } from '../WalletPaymentComponent';
import { WalletBalanceDisplay } from '../WalletBalanceDisplay';
import { useWalletValidation } from '@/lib/api/hooks/wallet-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Example component demonstrating wallet integration for booking payments
 * This shows how to use the wallet components and hooks together
 */
export function WalletIntegrationExample() {
  const [bookingAmount, setBookingAmount] = useState(25.00);
  const [mockBookingId, setMockBookingId] = useState('booking_123');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { validateSufficientFunds, balance, currency } = useWalletValidation();

  const validation = validateSufficientFunds(bookingAmount);

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
    setErrorMessage('');
  };

  const handlePaymentFailed = (error: string) => {
    setPaymentStatus('failed');
    setErrorMessage(error);
  };

  const handleInsufficientFunds = (shortfall: number) => {
    setErrorMessage(`You need ${shortfall.toFixed(2)} ${currency} more to complete this booking.`);
  };

  const resetDemo = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Integration Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This demo shows how the wallet integration works for booking payments.
            Try different amounts to see validation and payment flows.
          </p>
        </CardContent>
      </Card>

      {/* Wallet Balance Display */}
      <WalletBalanceDisplay 
        requiredAmount={bookingAmount}
        showTopUpButton={true}
        showRefreshButton={true}
      />

      {/* Booking Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="booking-amount">Booking Amount ({currency})</Label>
              <Input
                id="booking-amount"
                type="number"
                value={bookingAmount}
                onChange={(e) => setBookingAmount(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="booking-id">Booking ID</Label>
              <Input
                id="booking-id"
                value={mockBookingId}
                onChange={(e) => setMockBookingId(e.target.value)}
                placeholder="booking_123"
              />
            </div>
          </div>

          {/* Validation Status */}
          <div className="space-y-2">
            <Label>Validation Status</Label>
            <Alert variant={validation.isValid ? "default" : "destructive"}>
              {validation.isValid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {validation.message}
                {!validation.isValid && (
                  <div className="mt-1 text-xs">
                    Shortfall: {validation.shortfall.toFixed(2)} {currency}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      {paymentStatus !== 'idle' && (
        <Alert variant={paymentStatus === 'success' ? "default" : "destructive"}>
          {paymentStatus === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {paymentStatus === 'success' 
              ? `Payment of ${bookingAmount.toFixed(2)} ${currency} processed successfully!`
              : `Payment failed: ${errorMessage}`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Component */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <WalletPaymentComponent
            bookingId={mockBookingId}
            amount={bookingAmount}
            currency={currency}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailed={handlePaymentFailed}
            onInsufficientFunds={handleInsufficientFunds}
            showBalanceInfo={false} // We're showing it separately above
          />
        </CardContent>
      </Card>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={resetDemo} variant="outline">
              Reset Demo
            </Button>
            <Button 
              onClick={() => setBookingAmount(10)} 
              variant="outline"
              size="sm"
            >
              Set $10
            </Button>
            <Button 
              onClick={() => setBookingAmount(balance + 10)} 
              variant="outline"
              size="sm"
            >
              Set Over Balance
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Try setting an amount higher than your balance to see insufficient funds handling</p>
            <p>• Use the top-up modal to add funds and see real-time balance updates</p>
            <p>• Payment processing is simulated - no actual charges will occur</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}