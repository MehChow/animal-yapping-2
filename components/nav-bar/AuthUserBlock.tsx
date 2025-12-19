import Image from "next/image";
import { LogoutButton } from "./LogoutButton";
import { ProfileSettingsDialog } from "@/components/dialog/ProfileSettingsDialog";
import { getUserIconUrl } from "@/utils/user-utils";
import { NonNullUserSession } from "@/types/session";
import Link from "next/link";
import { LayoutDashboardIcon } from "lucide-react";

interface AuthUserBlockProps {
  user: NonNullUserSession["user"];
  isAdmin: boolean;
}

export function AuthUserBlock({ user, isAdmin }: AuthUserBlockProps) {
  const { id: userId, image: userIcon, name: displayName } = user;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative size-8 rounded-full border border-white/20 
            bg-white/10 flex items-center justify-center overflow-hidden"
        aria-label="Current profile icon"
      >
        {/* User has custom icon */}
        {userIcon ? (
          <Image
            src={getUserIconUrl(userIcon)}
            alt="User Icon"
            fill
            sizes="32px"
            className="rounded-full object-cover"
          />
        ) : (
          // Default icon
          <span className="text-xs font-semibold text-white">{initials}</span>
        )}
      </div>

      <p className="text-sm text-white"> {displayName}</p>

      {/* Profile settings */}
      <ProfileSettingsDialog
        displayName={displayName}
        initials={initials}
        imageUrl={userIcon}
        userId={userId}
      />

      {isAdmin && (
        <Link
          href="/admin"
          className="text-sm text-white flex items-center gap-2 hover:bg-white/10 rounded-full p-2"
        >
          <LayoutDashboardIcon className="size-4" />
        </Link>
      )}

      <LogoutButton />
    </div>
  );
}
