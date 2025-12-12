"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { getUserIconUrl } from "@/utils/user-utils";

type ProfileIconPreviewProps = {
  previewUrl: string | null;
  initials: string;
  onRemove: () => void;
};

export const ProfileIconPreview: React.FC<ProfileIconPreviewProps> = ({
  previewUrl,
  initials,
  onRemove,
}) => {
  return (
    <div className="relative size-24 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
      {previewUrl ? (
        <Image
          src={
            previewUrl.startsWith("data:")
              ? previewUrl
              : getUserIconUrl(previewUrl)
          }
          alt="Icon preview"
          fill
          className="object-cover rounded-full"
        />
      ) : (
        <span className="text-lg font-semibold pointer-events-none">
          {initials}
        </span>
      )}

      {previewUrl && (
        <div
          className="absolute top-0 right-0 size-6 rounded-full bg-red-400 flex items-center justify-center cursor-pointer hover:bg-red-500 transition-colors"
          onClick={onRemove}
        >
          <X className="size-4 text-white" />
        </div>
      )}
    </div>
  );
};
