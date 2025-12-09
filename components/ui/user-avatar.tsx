import Image from "next/image";
import { cn } from "@/lib/utils";
import { getUserIconUrl } from "@/utils/user-utils";

type UserAvatarProps = {
  name?: string | null;
  imageKey?: string | null;
  sizeClass?: string;
  textClassName?: string;
  className?: string;
  imageSizes?: string;
};

export const UserAvatar = ({
  name,
  imageKey,
  sizeClass = "size-10",
  textClassName = "text-xs",
  className,
  imageSizes = "64px",
}: UserAvatarProps) => {
  const initials =
    (name?.trim()?.slice(0, 2).toUpperCase() || "??").padEnd(2, "?");
  const imageUrl = getUserIconUrl(imageKey);
  const containerClass = cn(
    "relative rounded-full overflow-hidden flex items-center justify-center bg-white/10 border border-white/20 text-white font-semibold shrink-0",
    sizeClass,
    className
  );

  if (!imageUrl) {
    return (
      <div className={containerClass} aria-label={`Initials for ${name || "user"}`}>
        <span className={cn(textClassName)}>{initials}</span>
      </div>
    );
  }

  return (
    <div className={containerClass} aria-label={`Profile image for ${name || "user"}`}>
      <Image
        src={imageUrl}
        alt={name || "User"}
        fill
        className="object-cover"
        sizes={imageSizes}
      />
    </div>
  );
};

