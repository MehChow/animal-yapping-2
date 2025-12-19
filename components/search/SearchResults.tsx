"use client";

import { Loader2 } from "lucide-react";
import { Video } from "@/types/video";
import { SearchResultCard } from "./SearchResultCard";
import { useSearchResults } from "@/hooks/useSearchResults";

type SearchResultsProps = {
  query: string;
  initialVideos: Video[];
  initialNextCursor?: string;
};

export const SearchResults = ({
  query,
  initialVideos,
  initialNextCursor,
}: SearchResultsProps) => {
  const { videos, isLoading, isLoadingMore, hasMore, loadMoreRef } =
    useSearchResults({
      query,
      initialVideos,
      initialNextCursor,
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      <div className="flex flex-col gap-4">
        {videos.map((video) => (
          <SearchResultCard key={video.id} video={video} />
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-10" />

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="size-6 animate-spin text-purple-400" />
        </div>
      )}

      {/* End of results */}
      {!hasMore && videos.length > 0 && (
        <div className="text-center py-6 text-zinc-500 text-sm">
          No more results
        </div>
      )}
    </div>
  );
};
