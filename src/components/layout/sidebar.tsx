"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import {
  BarChart3,
  Car,
  CreditCard,
  Home,
  Map,
  MapPin,
  Settings,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "My Vehicles",
      href: "/dashboard/vehicles",
      icon: <Car className="h-5 w-5" />,
    },
    {
      title: "Route Planning",
      href: "/dashboard/map",
      icon: <Map className="h-5 w-5" />,
    },
    {
      title: "Charging Stations",
      href: "/dashboard/stations",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      title: "Wallet",
      href: "/dashboard/wallet",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "group fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 md:z-0",
          open 
            ? "w-64 translate-x-0" 
            : "-translate-x-full md:translate-x-0 md:w-16 md:hover:w-64"
        )}
      >
        {/* Header - Mobile close button */}
        <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
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
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Desktop Logo - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-primary flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span 
              className={cn(
                "text-xl font-bold transition-all duration-300",
                open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              ChargeTN
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group/item relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                    pathname === item.href && "bg-accent text-accent-foreground",
                    "gap-3"
                  )}
                  title={!open ? item.title : undefined}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <span 
                    className={cn(
                      "transition-all duration-300",
                      open 
                        ? "opacity-100" 
                        : "opacity-0 md:group-hover:opacity-100"
                    )}
                  >
                    {item.title}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  {!open && (
                    <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover/item:pointer-events-auto transition-opacity duration-200 whitespace-nowrap z-50 md:group-hover:hidden">
                      {item.title}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info at bottom */}
        <div className="border-t p-4">
          <div 
            className={cn(
              "flex items-center gap-3 transition-all duration-300"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex-shrink-0">
              <span className="flex h-full w-full items-center justify-center text-sm font-medium">
                JD
              </span>
            </div>
            <div 
              className={cn(
                "min-w-0 transition-all duration-300",
                open 
                  ? "opacity-100" 
                  : "opacity-0 md:group-hover:opacity-100"
              )}
            >
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}