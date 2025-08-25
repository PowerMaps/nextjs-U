/**
 * Wallet validation utilities for booking payments
 */

export interface WalletValidationResult {
  isValid: boolean;
  canProceed: boolean;
  shortfall: number;
  message: string;
  severity: 'info' | 'warning' | 'error';
  suggestedAction?: string;
}

export interface PaymentValidationOptions {
  amount: number;
  balance: number;
  currency: string;
  bufferAmount?: number; // Minimum buffer to keep in wallet
  allowOverdraft?: boolean;
  overdraftLimit?: number;
}

/**
 * Validates if wallet has sufficient funds for a payment
 */
export function validateWalletPayment(options: PaymentValidationOptions): WalletValidationResult {
  const { 
    amount, 
    balance, 
    currency, 
    bufferAmount = 0, 
    allowOverdraft = false, 
    overdraftLimit = 0 
  } = options;

  const requiredAmount = amount + bufferAmount;
  const availableAmount = balance + (allowOverdraft ? overdraftLimit : 0);
  const shortfall = Math.max(0, requiredAmount - balance);
  
  // Check if payment is possible with current balance
  if (balance >= requiredAmount) {
    return {
      isValid: true,
      canProceed: true,
      shortfall: 0,
      message: `Payment of ${amount.toFixed(2)} ${currency} can be processed`,
      severity: 'info'
    };
  }

  // Check if payment is possible with overdraft
  if (allowOverdraft && availableAmount >= requiredAmount) {
    const overdraftUsed = requiredAmount - balance;
    return {
      isValid: true,
      canProceed: true,
      shortfall: 0,
      message: `Payment will use ${overdraftUsed.toFixed(2)} ${currency} overdraft`,
      severity: 'warning'
    };
  }

  // Insufficient funds
  return {
    isValid: false,
    canProceed: false,
    shortfall,
    message: `Insufficient funds. Need ${shortfall.toFixed(2)} ${currency} more`,
    severity: 'error',
    suggestedAction: 'top-up'
  };
}

/**
 * Validates booking payment with specific business rules
 */
export function validateBookingPayment(
  estimatedCost: number,
  balance: number,
  currency: string = 'USD'
): WalletValidationResult {
  // Keep a small buffer for potential price changes
  const bufferPercentage = 0.05; // 5% buffer
  const bufferAmount = estimatedCost * bufferPercentage;
  
  return validateWalletPayment({
    amount: estimatedCost,
    balance,
    currency,
    bufferAmount,
    allowOverdraft: false
  });
}

/**
 * Calculates suggested top-up amount based on shortfall and user patterns
 */
export function calculateSuggestedTopUp(
  shortfall: number,
  userAverageSpending?: number,
  minTopUp: number = 10,
  maxTopUp: number = 1000
): number {
  if (shortfall <= 0) return minTopUp;

  // Base suggestion is shortfall + 20% buffer
  let suggestion = shortfall * 1.2;

  // If we have user spending data, suggest enough for 2-3 more transactions
  if (userAverageSpending && userAverageSpending > 0) {
    suggestion = Math.max(suggestion, shortfall + (userAverageSpending * 2));
  }

  // Round up to nearest 5 or 10
  if (suggestion < 50) {
    suggestion = Math.ceil(suggestion / 5) * 5;
  } else {
    suggestion = Math.ceil(suggestion / 10) * 10;
  }

  // Ensure within bounds
  return Math.max(minTopUp, Math.min(maxTopUp, suggestion));
}

/**
 * Formats wallet validation message for display
 */
export function formatValidationMessage(result: WalletValidationResult): {
  title: string;
  description: string;
  actionText?: string;
} {
  switch (result.severity) {
    case 'info':
      return {
        title: 'Payment Ready',
        description: result.message,
      };
    
    case 'warning':
      return {
        title: 'Payment Notice',
        description: result.message,
      };
    
    case 'error':
      return {
        title: 'Insufficient Funds',
        description: result.message,
        actionText: result.suggestedAction === 'top-up' ? 'Top Up Wallet' : undefined,
      };
    
    default:
      return {
        title: 'Payment Status',
        description: result.message,
      };
  }
}

/**
 * Checks if a refund amount is valid
 */
export function validateRefundAmount(
  originalAmount: number,
  refundAmount: number,
  refundPolicy?: {
    maxRefundPercentage?: number;
    minimumRefund?: number;
    cancellationFee?: number;
  }
): WalletValidationResult {
  const { 
    maxRefundPercentage = 1.0, 
    minimumRefund = 0, 
    cancellationFee = 0 
  } = refundPolicy || {};

  const maxRefund = originalAmount * maxRefundPercentage - cancellationFee;
  const actualRefund = Math.max(minimumRefund, Math.min(maxRefund, refundAmount));

  if (actualRefund === refundAmount) {
    return {
      isValid: true,
      canProceed: true,
      shortfall: 0,
      message: `Refund of ${refundAmount.toFixed(2)} will be processed`,
      severity: 'info'
    };
  }

  return {
    isValid: false,
    canProceed: false,
    shortfall: refundAmount - actualRefund,
    message: `Refund amount adjusted to ${actualRefund.toFixed(2)} based on policy`,
    severity: 'warning'
  };
}

/**
 * Utility to check wallet health and provide recommendations
 */
export function analyzeWalletHealth(
  balance: number,
  recentTransactions: Array<{ amount: number; type: string; date: string }>,
  currency: string = 'USD'
): {
  status: 'healthy' | 'low' | 'critical';
  message: string;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  
  // Calculate average monthly spending
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSpending = recentTransactions
    .filter(t => t.type === 'PAYMENT' && new Date(t.date) > thirtyDaysAgo)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const averageMonthlySpending = recentSpending;
  const daysOfSpendingLeft = averageMonthlySpending > 0 ? (balance / averageMonthlySpending) * 30 : Infinity;

  let status: 'healthy' | 'low' | 'critical';
  let message: string;

  if (balance <= 0) {
    status = 'critical';
    message = 'Your wallet is empty';
    recommendations.push('Add funds immediately to continue using services');
  } else if (daysOfSpendingLeft < 7) {
    status = 'critical';
    message = `Low balance: ${balance.toFixed(2)} ${currency}`;
    recommendations.push('Your balance may not last a week based on recent spending');
    recommendations.push('Consider topping up soon');
  } else if (daysOfSpendingLeft < 14) {
    status = 'low';
    message = `Moderate balance: ${balance.toFixed(2)} ${currency}`;
    recommendations.push('Consider topping up to avoid interruptions');
  } else {
    status = 'healthy';
    message = `Good balance: ${balance.toFixed(2)} ${currency}`;
    if (averageMonthlySpending > 0) {
      recommendations.push(`Based on your spending, this should last ${Math.floor(daysOfSpendingLeft)} days`);
    }
  }

  return { status, message, recommendations };
}