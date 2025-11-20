"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/shorts", label: "Shorts" },
  { href: "/about", label: "About" },
  { href: "/donate", label: "Donate" },
  { href: "/explore", label: "Explore" },
];

type MobileMenuProps = {
  isAdmin?: boolean;
};

export const MobileMenu: React.FC<MobileMenuProps> = ({ isAdmin = false }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="lg:hidden text-white hover:bg-white/10 rounded-md p-2 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-6 cursor-pointer" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[300px] bg-black/95 backdrop-blur-md"
      >
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="py-6 px-2 border-b border-white/10">
            <SheetClose asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="relative aspect-video w-16">
                  <Image
                    src="/logo.jpg"
                    alt="Logo"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <SheetTitle className="text-white text-2xl font-bold">
                  ANIMAL YAPPING
                </SheetTitle>
              </Link>
            </SheetClose>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navigationItems.map((item) => (
              <SheetClose asChild key={item.href}>
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-white text-lg px-4 py-3 rounded-md hover:bg-white/10 transition-colors"
                  )}
                >
                  {item.label}
                </Link>
              </SheetClose>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "text-white text-lg px-4 py-3 rounded-md hover:bg-white/10 transition-colors"
                )}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
