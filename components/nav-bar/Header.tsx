import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { AuthUserBlock } from "./AuthUserBlock";
import { SearchBar } from "./SearchBar";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = session?.user?.role === "Admin";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md supports-backdrop-filter:bg-black/40">
      <div className="container relative flex h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        {/* Desktop Logo (hidden on mobile, shown on desktop) */}
        <div className="hidden lg:flex lg:items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="relative aspect-video w-16">
              <Image
                src="/logo.jpg"
                alt="Logo"
                fill
                className="rounded-lg"
                sizes="5vw"
              />
            </div>
            <span className="text-white text-2xl font-bold">
              ANIMAL YAPPING
            </span>
          </Link>
        </div>

        <SearchBar />

        {/* Auth Buttons (always visible) */}
        <div className="flex items-center">
          {session?.user ? (
            <AuthUserBlock user={session.user} isAdmin={isAdmin} />
          ) : (
            <GoogleLoginButton />
          )}
        </div>
      </div>
    </header>
  );
}
