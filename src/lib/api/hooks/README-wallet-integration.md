# Wallet Integration Documentation

This document describes the wallet integration components and hooks for booking payment processing.

## Overview

The wallet integration provides a complete solution for handling booking payments, including:

- Real-time wallet balance checking
- Payment validation before booking confirmation
- Insufficient funds handling with top-up integration
- Booking payment and refund processing
- Comprehensive error handling and user feedback

## Components

### WalletPaymentComponent

A comprehensive payment component that handles the entire booking payment flow.

```tsx
import { WalletPaymentComponent } from '@/components/wallet/WalletPaymentComponent';

<WalletPaymentComponent
  bookingId="booking_123"
  amount={25.50}
  currency="USD"
  onPaymentSuccess={() => console.log('Payment successful')}
  onPaymentFailed={(error) => console.log('Payment failed:', error)}
  onInsufficientFunds={(shortfall) => console.log('Need more:', shortfall)}
  showBalanceInfo={true}
/>
```

**Props:**
- `bookingId?: string` - The booking ID for payment processing
- `amount: number` - Payment amount
- `currency?: string` - Currency code (default: 'USD')
- `onPaymentSuccess: () => void` - Success callback
- `onPaymentFailed?: (error: string) => void` - Error callback
- `onInsufficientFunds?: (shortfall: number) => void` - Insufficient funds callback
- `showBalanceInfo?: boolean` - Show wallet balance card (default: true)
- `disabled?: boolean` - Disable payment button

### WalletBalanceDisplay

A flexible component for displaying wallet balance with optional top-up functionality.

```tsx
import { WalletBalanceDisplay } from '@/components/wallet/WalletBalanceDisplay';

<WalletBalanceDisplay
  showTopUpButton={true}
  showRefreshButton={true}
  compact={false}
  requiredAmount={50.00}
/>
```

**Props:**
- `showTopUpButton?: boolean` - Show top-up button (default: true)
- `showRefreshButton?: boolean` - Show refresh button (default: true)
- `compact?: boolean` - Use compact layout (default: false)
- `className?: string` - Additional CSS classes
- `requiredAmount?: number` - Required amount for validation

### TopUpModal

Enhanced modal for wallet top-up with suggested amounts and validation.

```tsx
import { TopUpModal } from '@/components/wallet/TopUpModal';

<TopUpModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => console.log('Top-up successful')}
  suggestedAmount={25.00}
  minAmount={1}
  maxAmount={1000}
/>
```

**Props:**
- `isOpen?: boolean` - Control modal visibility (controlled mode)
- `onClose?: () => void` - Close callback
- `onSuccess?: () => void` - Success callback
- `suggestedAmount?: number` - Suggested top-up amount
- `minAmount?: number` - Minimum top-up amount (default: 1)
- `maxAmount?: number` - Maximum top-up amount (default: 1000)
- `trigger?: React.ReactNode` - Custom trigger element (uncontrolled mode)

## Hooks

### useWalletBalance

Enhanced hook for real-time wallet balance checking.

```tsx
import { useWalletBalance } from '@/lib/api/hooks/wallet-hooks';

const {
  balance,
  currency,
  isBalanceLoading,
  refreshBalance,
  error
} = useWalletBalance({
  refetchInterval: 30000,
  enableRealTime: true
});
```

**Options:**
- `refetchInterval?: number` - Refresh interval in ms (default: 30000)
- `enableRealTime?: boolean` - Enable real-time updates (default: true)

**Returns:**
- `balance: number` - Current wallet balance
- `currency: string` - Wallet currency
- `isBalanceLoading: boolean` - Loading state
- `refreshBalance: () => void` - Manual refresh function
- `error: any` - Error state

### useWalletValidation

Hook for wallet balance validation with booking-specific logic.

```tsx
import { useWalletValidation } from '@/lib/api/hooks/wallet-hooks';

const {
  balance,
  currency,
  validateSufficientFunds,
  checkBalanceForBooking,
  refreshBalance
} = useWalletValidation();

// Validate any amount
const validation = validateSufficientFunds(50.00);

// Validate for booking (includes buffer)
const bookingValidation = checkBalanceForBooking(50.00);
```

**Returns:**
- `balance: number` - Current wallet balance
- `currency: string` - Wallet currency
- `validateSufficientFunds: (amount: number) => ValidationResult` - General validation
- `checkBalanceForBooking: (amount: number) => ValidationResult` - Booking validation
- `refreshBalance: () => void` - Manual refresh function

**ValidationResult:**
```tsx
interface ValidationResult {
  isValid: boolean;
  shortfall: number;
  message: string;
}
```

### useBookingPayment

Hook for processing booking payments with wallet integration.

```tsx
import { useBookingPayment } from '@/lib/api/hooks/wallet-hooks';

const bookingPayment = useBookingPayment();

// Process payment
await bookingPayment.mutateAsync({
  bookingId: 'booking_123',
  amount: 50.00,
  walletId: 'wallet_456' // optional
});
```

**Mutation Variables:**
- `bookingId: string` - Booking ID
- `amount: number` - Payment amount
- `walletId?: string` - Wallet ID (optional)

**Response:**
- `success: boolean` - Payment success status
- `transactionId: string` - Transaction ID
- `newBalance: number` - Updated wallet balance
- `booking: any` - Updated booking data

### useBookingRefund

Hook for processing booking refunds.

```tsx
import { useBookingRefund } from '@/lib/api/hooks/wallet-hooks';

const bookingRefund = useBookingRefund();

// Process refund
await bookingRefund.mutateAsync({
  bookingId: 'booking_123',
  refundAmount: 40.00 // optional, calculated by backend if not provided
});
```

**Mutation Variables:**
- `bookingId: string` - Booking ID
- `refundAmount?: number` - Refund amount (optional)

**Response:**
- `success: boolean` - Refund success status
- `refundAmount: number` - Actual refund amount
- `transactionId: string` - Transaction ID
- `newBalance: number` - Updated wallet balance

## Utilities

### Wallet Validation Utilities

```tsx
import { 
  validateBookingPayment, 
  calculateSuggestedTopUp,
  analyzeWalletHealth 
} from '@/lib/utils/wallet-validation';

// Validate booking payment with buffer
const validation = validateBookingPayment(100, 110, 'USD');

// Calculate suggested top-up amount
const suggestion = calculateSuggestedTopUp(20, 25, 10, 1000);

// Analyze wallet health
const health = analyzeWalletHealth(balance, recentTransactions, 'USD');
```

## Integration Examples

### Basic Booking Payment Flow

```tsx
import React, { useState } from 'react';
import { WalletPaymentComponent } from '@/components/wallet/WalletPaymentComponent';
import { useCreateBooking } from '@/lib/api/hooks/booking-hooks';

function BookingForm() {
  const [bookingData, setBookingData] = useState({
    connectorId: 'conn_123',
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-01T12:00:00Z',
    estimatedCost: 25.50
  });

  const createBooking = useCreateBooking();

  const handlePaymentSuccess = () => {
    // Booking and payment completed successfully
    console.log('Booking confirmed and paid');
  };

  const handlePaymentFailed = (error: string) => {
    // Handle payment failure
    console.error('Payment failed:', error);
  };

  const handleCreateBooking = async () => {
    try {
      const booking = await createBooking.mutateAsync(bookingData);
      // Booking created, now show payment component
      return booking.id;
    } catch (error) {
      console.error('Booking creation failed:', error);
    }
  };

  return (
    <div>
      {/* Booking form fields */}
      
      <WalletPaymentComponent
        bookingId={bookingData.bookingId}
        amount={bookingData.estimatedCost}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailed={handlePaymentFailed}
      />
    </div>
  );
}
```

### Wallet Balance Monitoring

```tsx
import React from 'react';
import { WalletBalanceDisplay } from '@/components/wallet/WalletBalanceDisplay';
import { useWalletValidation } from '@/lib/api/hooks/wallet-hooks';

function BookingPreview({ estimatedCost }: { estimatedCost: number }) {
  const { checkBalanceForBooking } = useWalletValidation();
  const validation = checkBalanceForBooking(estimatedCost);

  return (
    <div>
      <WalletBalanceDisplay 
        requiredAmount={estimatedCost}
        compact={true}
      />
      
      {!validation.isValid && (
        <div className="text-red-500 text-sm mt-2">
          {validation.message}
        </div>
      )}
    </div>
  );
}
```

## Error Handling

The wallet integration includes comprehensive error handling:

1. **Network Errors**: Automatic retry with exponential backoff
2. **Insufficient Funds**: Clear messaging with top-up options
3. **Payment Failures**: Specific error messages with suggested actions
4. **Validation Errors**: Real-time validation with helpful feedback

## Testing

Run the wallet integration tests:

```bash
npm test src/lib/api/hooks/__tests__/wallet-integration.test.ts
```

The test suite covers:
- Balance checking and validation
- Payment processing flows
- Error handling scenarios
- Utility functions

## API Endpoints

The wallet integration expects these API endpoints:

- `GET /wallet/my-wallet` - Get current user's wallet
- `POST /wallet/booking-payment` - Process booking payment
- `POST /wallet/booking-refund` - Process booking refund
- `POST /wallet/top-up` - Top up wallet balance

## Requirements Satisfied

This implementation satisfies the following requirements from the booking feature spec:

- **5.1**: Wallet balance checking before booking confirmation
- **5.2**: Insufficient funds handling with top-up integration  
- **5.3**: Wallet payment processing for bookings
- **5.4**: Refund processing for cancelled bookings

## Next Steps

1. Integrate with booking form components
2. Add wallet transaction history
3. Implement subscription payment integration
4. Add wallet analytics and spending insights