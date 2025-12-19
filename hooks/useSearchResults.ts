"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { searchVideosAction } from "@/app/actions/search";
import { Video } from "@/types/video";

type UseSearchResultsOptions = {
  query: string;
  initialVideos?: Video[];
  initialNextCursor?: string;
};

type UseSearchResultsReturn = {
  videos: Video[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
};

export const useSearchResults = ({
  query,
  initialVideos,
  initialNextCursor,
}: UseSearchResultsOptions): UseSearchResultsReturn => {
  const hasInitialData = initialVideos !== undefined;

  const [videos, setVideos] = useState<Video[]>(initialVideos || []);
  const [nextCursor, setNextCursor] = useState<string | undefined>(
    initialNextCursor
  );
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialNextCursor);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchVideos = useCallback(
    async (cursor?: string) => {
      if (!query.trim()) return;

      const isInitial = !cursor;
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await searchVideosAction({ query, cursor, limit: 10 });
        if (result.success && result.videos) {
          if (isInitial) {
            setVideos(result.videos as Video[]);
          } else {
            setVideos((prev) => [...prev, ...(result.videos as Video[])]);
          }
          setNextCursor(result.nextCursor);
          setHasMore(!!result.nextCursor);
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [query]
  );

  // Initial fetch only if initial data wasn't provided
  useEffect(() => {
    if (!hasInitialData && query.trim()) {
      fetchVideos();
    }
  }, [fetchVideos, hasInitialData, query]);

  // Reset when query changes
  useEffect(() => {
    if (hasInitialData) {
      setVideos(initialVideos || []);
      setNextCursor(initialNextCursor);
      setHasMore(!!initialNextCursor);
    }
  }, [query, hasInitialData, initialVideos, initialNextCursor]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoadingMore) {
          fetchVideos(nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [nextCursor, hasMore, isLoadingMore, fetchVideos]);

  return {
    videos,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreRef,
  };
};

