"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import NotificationDropdown from "./notification-dropdown";
import UserDropdown from "./user-dropdown";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  
  // Determine if we're on the dashboard
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left section: Logo and menu button */}
        <div className="flex items-center gap-4">
          {isDashboard && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
          
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-primary"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xl font-bold">ChargeTN</span>
          </Link>
        </div>

        {/* Center section: Search (expands on mobile) */}
        <div className={`${searchOpen ? "absolute inset-x-0 top-0 bg-background px-4" : "hidden md:block"} flex-1 md:mx-8`}>
          {searchOpen ? (
            <div className="flex h-16 items-center">
              <div className="relative flex w-full items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="ml-2">
                <X className="h-5 w-5" />
                <span className="sr-only">Close search</span>
              </Button>
            </div>
          ) : (
            <div className="relative hidden w-full max-w-md md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          )}
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center gap-2">
          {!searchOpen && (
            <>
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="md:hidden">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              
              <ThemeToggle />
              <LanguageSwitcher />
              
              {isDashboard ? (
                <>
                  <NotificationDropdown />
                  <UserDropdown />
                </>
              ) : (
                <div className="hidden items-center gap-4 md:flex">
                  <Link href="/auth/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Register</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}