"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import Footer from "./footer";
import { cn } from "@/lib/utils/cn";
import { OfflineIndicator } from "@/components/ui/offline-indicator";

import { SessionTimeoutModal } from "@/components/auth/session-timeout-modal";
import { useAuthStore } from "@/lib/store/auth-store";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { updateLastActivity } = useAuthStore();

  // Track user activity
  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    const resetTimer = () => updateLastActivity();

    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [updateLastActivity]);
""

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <main 
          className={cn(
            "flex-1 overflow-auto transition-all duration-300",
            sidebarOpen ? "md:ml-64" : "md:ml-16"
          )}
        >
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
      
        {/* Offline status indicator */}
      <OfflineIndicator />
      <SessionTimeoutModal />
    </div>
  );
}