import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { AuthUserBlock } from "./AuthUserBlock";
import { MobileMenu } from "./MobileMenu";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = session?.user?.role === "Admin";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md supports-backdrop-filter:bg-black/40">
      <div className="container relative flex h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        {/* Mobile Menu (shown on screens < 1024px) */}
        <div className="lg:hidden">
          <MobileMenu isAdmin={isAdmin} />
        </div>

        {/* Desktop Logo (hidden on mobile, shown on desktop) */}
        <div className="hidden lg:flex lg:items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="relative aspect-video w-16">
              <Image src="/logo.jpg" alt="Logo" fill className="rounded-lg" />
            </div>
            <span className="text-white text-2xl font-bold">
              ANIMAL YAPPING
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Menu (hidden on mobile, shown on desktop) - Truly centered */}
        <NavigationMenu className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
          <NavigationMenuList>
            {/* Explore */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/explore"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-white hover:text-white/80 hover:bg-white/10 focus:bg-white/10 bg-transparent focus:text-purple-300"
                  )}
                >
                  Explore
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* About */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/about"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-white hover:text-white/80 hover:bg-white/10 focus:bg-white/10 bg-transparent focus:text-purple-300"
                  )}
                >
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Donate */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/donate"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-white hover:text-white/80 hover:bg-white/10 focus:bg-white/10 bg-transparent focus:text-purple-300"
                  )}
                >
                  Donate
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Admin */}
            {isAdmin && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/admin"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-white hover:text-white/80 hover:bg-white/10 focus:bg-white/10 bg-transparent focus:text-purple-300"
                    )}
                  >
                    Admin
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Buttons (always visible) */}
        <div className="flex items-center">
          {session?.user ? <AuthUserBlock /> : <GoogleLoginButton />}
        </div>
      </div>
    </header>
  );
}
