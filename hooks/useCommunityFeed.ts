import { useState, useCallback, useEffect, useRef } from "react";
import { getPosts } from "@/app/actions/posts";
import { Post } from "@/types/post";

interface UseCommunityFeedReturn {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  handleLikeToggle: (postId: string) => void;
  handleDelete: (postId: string) => void;
  refetch: () => void;
}

export const useCommunityFeed = (): UseCommunityFeedReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (cursor?: string) => {
    const isInitial = !cursor;
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await getPosts({ cursor, limit: 10 });
      if (result.success && result.posts) {
        if (isInitial) {
          setPosts(result.posts);
        } else {
          setPosts((prev) => [...prev, ...result.posts!]);
        }
        setNextCursor(result.nextCursor);
        setHasMore(!!result.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchPosts(); // Refetch from the beginning
  }, [fetchPosts]);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Listen for profile updates and refetch posts
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Refetch posts to get updated user images
      refetch();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [refetch]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoadingMore) {
          fetchPosts(nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [nextCursor, hasMore, isLoadingMore, fetchPosts]);

  const handleLikeToggle = (postId: string) => {
    // This could be used to refresh data if needed
  };

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreRef,
    handleLikeToggle,
    handleDelete,
    refetch,
  };
};
