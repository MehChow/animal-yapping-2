import Image from "next/image";
import { LogoutButton } from "./LogoutButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProfileSettingsDialog } from "@/components/dialog/ProfileSettingsDialog";
import { getUserIconUrl } from "@/utils/user-utils";

export async function AuthUserBlock() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userIcon = session?.user?.image;
  const displayName = session?.user?.name;
  const initials = displayName?.slice(0, 2).toUpperCase();

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

      <p className="text-sm text-white"> {displayName} </p>

      {/* Profile settings */}
      <ProfileSettingsDialog
        displayName={displayName ?? ""}
        initials={initials ?? ""}
        imageUrl={userIcon}
      />

      <LogoutButton />
    </div>
  );
}
