"use client";

import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-0 sm:p-2 md:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}