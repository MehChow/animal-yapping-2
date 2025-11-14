"use client";

import { useInfinityScroll } from "@/hooks/useInfinityScroll";
import Image from "next/image";

export const CommunityFeed = () => {
  const fetchMore = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  };

  const { items, loadMoreRef, isLoading } = useInfinityScroll({
    initialItemCount: 5,
    fetchMore,
  });

  return (
    <div className="flex flex-col gap-3 h-full transition-all duration-300">
      <h2 className="text-2xl font-semibold text-blue-400 text-center pb-1">
        Posts
      </h2>
      <div
        className="flex-1 overflow-y-auto space-y-3 pr-2 transition-all duration-300 [&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-blue-200"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="border-0 rounded-lg p-4 bg-gray-900 transition-all duration-300"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full relative">
                <Image
                  src="/default_icon.png"
                  alt="User"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">[Admin name]</p>
                <p className="text-xs text-gray-400">[Post date]</p>
              </div>
            </div>
            <div className="space-y-1 mb-3">
              <div className="h-2 bg-gray-700 rounded w-full" />
              <div className="h-2 bg-gray-700 rounded w-5/6" />
              <div className="h-2 bg-gray-700 rounded w-4/6" />
            </div>
            {item.id % 2 === 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg aspect-video mb-3 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Image</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-gray-400">♥ [like count]</span>
            </div>
          </div>
        ))}
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
