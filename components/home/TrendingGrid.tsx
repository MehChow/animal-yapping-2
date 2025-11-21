"use client";

import { useInfinityScroll } from "@/hooks/useInfinityScroll";

export const TrendingGrid = () => {
  const fetchMore = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  };

  const { items, loadMoreRef, isLoading } = useInfinityScroll({
    initialItemCount: 9,
    fetchMore,
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
      <h2 className="text-2xl font-semibold text-orange-400 text-center mb-4">
        🔥Trendings
      </h2>

      <div
        className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-0
 "
      >
        <div className="grid grid-cols-1 gap-2 transition-all duration-300">
          {items.map((item) => (
            <div
              key={item.id}
              className="aspect-video bg-gray-800 rounded-lg border-0 hover:brightness-110 transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              <span className="text-gray-500 text-xs">#{item.id + 1}</span>
            </div>
          ))}
        </div>
        <div ref={loadMoreRef} className="h-10" />
        {isLoading && (
          <div className="text-center py-2 text-gray-400 text-sm">
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
};
