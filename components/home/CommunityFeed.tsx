"use client";

import { Loader2 } from "lucide-react";
import { useCommunityFeed } from "@/hooks/useCommunityFeed";
import { PostCard } from "@/components/community/PostCard";

export const CommunityFeed = () => {
  const {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreRef,
    handleLikeToggle,
    handleDelete,
  } = useCommunityFeed();

  if (isLoading) {
    return (
      <>
        <h2 className="text-purple-300 text-[5vw] font-bold text-center w-full">
          📃Bullsheet
        </h2>
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-8 animate-spin text-purple-400" />
        </div>
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <h2 className="text-purple-300 text-[5vw] font-bold text-center w-full">
          📃Bullsheet
        </h2>
        <div className="text-center py-10 text-gray-400">
          <p>No posts yet. Check back later!</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-purple-300 text-[5vw] font-bold text-center w-full">
        📃Bullsheet
      </h2>

      <div className="flex-1 w-full overflow-y-auto space-y-3 transition-all duration-300 no-scrollbar">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLikeToggle={handleLikeToggle}
            onDelete={handleDelete}
          />
        ))}
        <div ref={loadMoreRef} className="h-10" />
        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-6 animate-spin text-purple-400" />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No more posts
          </div>
        )}
      </div>
    </>
  );
};
