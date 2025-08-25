import React from 'react';
import { useWalletBalance } from '@/lib/api/hooks/wallet-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { TopUpModal } from './TopUpModal';

interface WalletBalanceDisplayProps {
  showTopUpButton?: boolean;
  showRefreshButton?: boolean;
  compact?: boolean;
  className?: string;
  requiredAmount?: number;
}

export function WalletBalanceDisplay({
  showTopUpButton = true,
  showRefreshButton = true,
  compact = false,
  className = '',
  requiredAmount
}: WalletBalanceDisplayProps) {
  const { 
    balance, 
    currency, 
    isBalanceLoading, 
    refreshBalance,
    error 
  } = useWalletBalance();

  const isInsufficient = requiredAmount ? balance < requiredAmount : false;
  const shortfall = requiredAmount ? Math.max(0, requiredAmount - balance) : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span className={`font-medium ${isInsufficient ? 'text-destructive' : ''}`}>
          {isBalanceLoading ? '...' : `${balance.toFixed(2)} ${currency}`}
        </span>
        {isInsufficient && (
          <Badge variant="destructive" className="text-xs">
            Need {shortfall.toFixed(2)} more
          </Badge>
        )}
        {showRefreshButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshBalance}
            disabled={isBalanceLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isBalanceLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Wallet Balance
        </CardTitle>
        {showRefreshButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshBalance}
            disabled={isBalanceLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isBalanceLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${isInsufficient ? 'text-destructive' : ''}`}>
                {isBalanceLoading ? '...' : `${balance.toFixed(2)} ${currency}`}
              </div>
              {error && (
                <p className="text-xs text-muted-foreground text-destructive">
                  Failed to load balance
                </p>
              )}
            </div>
            {balance > 0 && (
              <div className="text-right">
                <TrendingUp className="h-4 w-4 text-green-500 inline" />
              </div>
            )}
          </div>

          {/* Insufficient funds warning */}
          {isInsufficient && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <TrendingDown className="h-4 w-4" />
                <span className="font-medium">Insufficient Funds</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                You need {shortfall.toFixed(2)} {currency} more for this transaction
              </p>
            </div>
          )}

          {/* Action buttons */}
          {showTopUpButton && (
            <div className="flex gap-2">
              <TopUpModal 
                suggestedAmount={shortfall > 0 ? shortfall : undefined}
                trigger={
                  <Button 
                    variant={isInsufficient ? "default" : "outline"} 
                    size="sm" 
                    className="flex-1"
                  >
                    Top Up Wallet
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}