"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Map, Wallet } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="flex space-x-4">
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Trip
      </Button>
      <Button variant="outline">
        <Map className="mr-2 h-4 w-4" />
        Find Station
      </Button>
      <Button variant="outline">
        <Wallet className="mr-2 h-4 w-4" />
        View Wallet
      </Button>
    </div>
  );
}