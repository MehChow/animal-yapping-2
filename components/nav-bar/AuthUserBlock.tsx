import Image from "next/image";
import { LogoutButton } from "./LogoutButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProfileSettingsDialog } from "@/components/dialog/ProfileSettingsDialog";

export async function AuthUserBlock() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const getImageUrl = (imageKey: string): string => {
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    return publicUrl ? `${publicUrl}/${imageKey}` : "";
  };

  const userIcon = session?.user?.image ?? null;
  const displayName = session?.user?.name ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {session?.user && (
        <ProfileSettingsDialog displayName={displayName} imageUrl={userIcon} />
      )}
      <div
        className="relative size-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden"
        aria-label="Current profile icon"
      >
        {userIcon ? (
          <Image
            src={getImageUrl(userIcon)}
            alt="User Icon"
            fill
            sizes="32px"
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-xs font-semibold text-white">{initials}</span>
        )}
      </div>
      <LogoutButton />
    </div>
  );
}
