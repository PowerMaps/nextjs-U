"use client";

import { Sidebar } from 'lucide-react';
import React, { useState } from 'react';
import Navbar from '../layout/navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Navbar onMenuClick={handleMenuClick} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}