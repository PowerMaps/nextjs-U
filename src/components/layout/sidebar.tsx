"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { BarChart3, Car, CreditCard, Home, Map, MapPin, Settings, User, X } from "lucide-react";
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
      icon: <Home className="w-5 h-5" />,
    },
    {
      title: "My Vehicles",
      href: "/dashboard/vehicles",
      icon: <Car className="w-5 h-5" />,
    },
    {
      title: "Route Planning",
      href: "/dashboard/map",
      icon: <Map className="w-5 h-5" />,
    },
    {
      title: "Charging Stations",
      href: "/dashboard/stations",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      title: "Wallet",
      href: "/dashboard/wallet",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="w-5 h-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="w-5 h-5" />,
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
          "group fixed top-0 h-full left-0 z-50",
          "flex flex-col items-start justify-between",
          "border-r bg-background transition-all duration-150 md:z-0",
          open
            ? "w-64 translate-x-0"
            : "-translate-x-full md:translate-x-0 md:w-16 md:hover:w-64 items-center"
        )}
      >
        <div className="w-full">
          {/* Header - Mobile close button */}
          <div className="flex items-center justify-between h-16 px-2 border-b md:hidden">
            <Link href="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xl font-bold">PowerMaps</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>

          <div className="hidden h-16 lg:block"></div>

          {/* Navigation */}
          <nav className="w-full">
            <ul>
              {
                navItems.map((item: NavItem) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex items-center rounded-md h-10 p-2 text-sm font-medium transition-all hover:bg-accent gap-2",
                        open ? "justify-start" : "justify-center md:group-hover:justify-start",
                        pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                      title={!open ? item.title : undefined}
                    >
                      <span>{item.icon}</span>
                      <span
                        className={cn(
                          open
                            ? "block"
                            : "hidden md:group-hover:block"
                        )}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))
              }
            </ul>
          </nav>
        </div>

        {/* User info at bottom */}
        <div
          className={cn(
            "w-full px-2 py-4 border-t",
            "flex items-center gap-3 transition-all duration-300",
            open ? "justify-start" : "justify-center md:group-hover:justify-start",
          )}
        >
          <span className="flex items-center justify-center w-8 h-8 bg-red-300 rounded-full bg-primary text-primary-foreground">JD</span>
          <div
            className={cn(
              "min-w-0 transition-all duration-300",
              open
                ? "block"
                : "hidden md:group-hover:block"
            )}
          >
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs truncate text-muted-foreground">john@example.com</p>
          </div>
        </div>
      </aside>
    </>
  );
}
