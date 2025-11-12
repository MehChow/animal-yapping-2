"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseInfinityScrollOptions {
  initialItemCount?: number;
  fetchMore: () => Promise<void>;
}

export const useInfinityScroll = ({
  initialItemCount = 10,
  fetchMore,
}: UseInfinityScrollOptions) => {
  const [items, setItems] = useState<any[]>(
    Array.from({ length: initialItemCount }, (_, i) => ({ id: i }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          fetchMore().then(() => {
            // Simulate adding more items (12 for desktop grid = 3 rows)
            setItems((prev) => [
              ...prev,
              ...Array.from({ length: 12 }, (_, i) => ({
                id: prev.length + i,
              })),
            ]);
            setIsLoading(false);
          });
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, fetchMore]);

  return {
    items,
    loadMoreRef,
    isLoading,
  };
};

