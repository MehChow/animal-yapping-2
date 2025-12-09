"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { isVideoTypeValue, VideoType } from "@/utils/video-utils";

type UseVideoTypeReturn = {
  selectedType: VideoType;
  handleTypeChange: (value: string) => void;
};

const DEFAULT_TYPE: VideoType = "Normal";

export const useVideoType = (initialType: VideoType = DEFAULT_TYPE): UseVideoTypeReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<VideoType>(initialType);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  const updatedParams = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString());
    return params;
  }, [searchParams]);

  const handleTypeChange = useCallback(
    (value: string) => {
      const validValue: VideoType = isVideoTypeValue(value) ? value : DEFAULT_TYPE;
      setSelectedType(validValue);

      if (validValue === DEFAULT_TYPE) {
        updatedParams.delete("type");
      } else {
        updatedParams.set("type", validValue);
      }

      const queryString = updatedParams.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, updatedParams],
  );

  return { selectedType, handleTypeChange };
};

