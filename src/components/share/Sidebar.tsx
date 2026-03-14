"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Grip, ShoppingBasket, Menu, X, Settings } from "lucide-react";
import { LogoutModal } from "../Dialogs/LogoutModal";
import { useState } from "react";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    name: "All Campaigns",
    href: "/all-campaigns",
    icon: LayoutDashboard,
  },
  { name: "Student List", href: "/student-list", icon: Grip },
  { name: "Donations", href: "/donations", icon: ShoppingBasket },
  { name: "Setting", href: "/setting", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button - শুধু mobile এ এবং sidebar close থাকলে দেখাবে */}
      {!isMobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-[#212121] text-white shadow-lg hover:bg-[#313131] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Overlay - mobile এ sidebar open থাকলে */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-screen fixed top-0 left-0 flex-col bg-[#CAE7FF] z-50 transition-transform duration-300",
          "w-[280px] sm:w-[300px] lg:w-[300px]",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header with Logo - Logo সবসময় center এ */}
        <div className="h-[80px] flex items-center justify-center relative px-4">
  <div className="relative mt-5 h-[80px] w-[150px]">
    <Image
      src="/images/mainLogo.png"
      alt="Logo"
      fill
      priority
      className="object-contain"
    />
  </div>

  {/* Close Button */}
  {isMobileMenuOpen && (
    <button
      onClick={toggleMobileMenu}
      className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white hover:bg-slate-600/50 transition-colors"
      aria-label="Close menu"
    >
      <X className="h-6 w-6" />
    </button>
  )}
</div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 flex flex-col items-center justify-start px-3 overflow-y-auto mt-10">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex w-[97%] mx-auto items-center justify-start gap-2 space-y-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#0024DA] text-white"
                    : "text-black hover:bg-slate-600/50 hover:text-white",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-200 flex-shrink-0",
                    isActive ? "text-white" : "",
                  )}
                />
                <span
                  className={cn(
                    "font-normal text-sm sm:text-base leading-[120%] transition-colors duration-200",
                    isActive ? "text-white font-medium" : "",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout fixed at bottom */}
        <div className="p-4 sm:p-6">
          <LogoutModal />
        </div>
      </div>
    </>
  );
}
