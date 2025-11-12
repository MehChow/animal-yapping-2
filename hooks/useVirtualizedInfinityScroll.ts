"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseVirtualizedInfinityScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  initialItemCount?: number;
  fetchMore: () => Promise<void>;
}

interface VirtualizedItem {
  index: number;
  offsetTop: number;
}

export const useVirtualizedInfinityScroll = ({
  itemHeight,
  containerHeight,
  overscan = 3,
  initialItemCount = 20,
  fetchMore,
}: UseVirtualizedInfinityScrollOptions) => {
  const [items, setItems] = useState<any[]>(
    Array.from({ length: initialItemCount }, (_, i) => ({ id: i }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Calculate visible range
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscan
  );
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems: VirtualizedItem[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    visibleItems.push({
      index: i,
      offsetTop: i * itemHeight,
    });
  }

  const totalHeight = items.length * itemHeight;

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Load more when reaching bottom
  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          fetchMore().then(() => {
            // Simulate adding more items
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
    visibleItems,
    totalHeight,
    handleScroll,
    loadMoreRef,
    isLoading,
  };
};

