"use client";

import { useInfinityScroll } from "@/hooks/useInfinityScroll";

export const MobileTrendingGrid = () => {
  const fetchMore = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  };

  const { items, loadMoreRef, isLoading } = useInfinityScroll({
    initialItemCount: 20,
    fetchMore,
  });

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-orange-400 mb-2">Trendings</h3>
      <div
        className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-orange-200"
      >
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="aspect-video bg-gray-800 rounded-lg border-2 border-orange-500/30 hover:border-orange-500 transition-colors flex items-center justify-center"
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
