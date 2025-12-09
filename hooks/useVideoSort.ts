"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_VIDEO_SORT, VideoSortValue } from "@/types/video-sort";

type UseVideoSortReturn = {
  selectedSort: VideoSortValue;
  handleSortChange: (value: VideoSortValue) => void;
};

export const useVideoSort = (initialSort: VideoSortValue): UseVideoSortReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedSort, setSelectedSort] = useState<VideoSortValue>(
    initialSort ?? DEFAULT_VIDEO_SORT,
  );

  useEffect(() => {
    setSelectedSort(initialSort ?? DEFAULT_VIDEO_SORT);
  }, [initialSort]);

  const updatedParams = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString());
    return params;
  }, [searchParams]);

  const handleSortChange = useCallback(
    (value: VideoSortValue) => {
      setSelectedSort(value);

      if (value === DEFAULT_VIDEO_SORT) {
        updatedParams.delete("sort");
      } else {
        updatedParams.set("sort", value);
      }

      const queryString = updatedParams.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, updatedParams],
  );

  return { selectedSort, handleSortChange };
};

