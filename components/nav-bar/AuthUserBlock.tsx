import Image from "next/image";
import { LogoutButton } from "./LogoutButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function AuthUserBlock() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userIcon = session?.user?.image
    ? session?.user?.image
    : "/default_icon.png";

  return (
    <div className="flex items-center gap-2">
      <div className="relative size-8 rounded-full">
        <Image src={userIcon} alt="User Icon" fill className="rounded-full" />
      </div>
      <LogoutButton />
    </div>
  );
}
