"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getPosts, togglePostLike, deletePost } from "@/app/actions/posts";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Heart, Loader2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type PostImage = {
  id: string;
  imageKey: string;
  order: number;
};

type Post = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  images: PostImage[];
  _count: {
    likes: number;
  };
  isLiked: boolean;
};

const getImageUrl = (imageKey: string): string => {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  return publicUrl ? `${publicUrl}/${imageKey}` : "";
};

const PostImageCarousel = ({ images }: { images: PostImage[] }) => {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
        <Image
          src={getImageUrl(images[0].imageKey)}
          alt="Post image"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-white/20">
              <Image
                src={getImageUrl(image.imageKey)}
                alt="Post image"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 bg-white/50 border-0 text-black hover:bg-white/70" />
      <CarouselNext className="right-2 bg-white/50 border-0 text-black hover:bg-white/70" />
    </Carousel>
  );
};

const PostCard = ({
  post,
  onLikeToggle,
  onDelete,
}: {
  post: Post;
  onLikeToggle: (postId: string) => void;
  onDelete: (postId: string) => void;
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(post.isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(post._count.likes);

  const handleLikeClick = async () => {
    setIsLiking(true);
    // Optimistic update
    setLocalIsLiked(!localIsLiked);
    setLocalLikeCount((prev) => (localIsLiked ? prev - 1 : prev + 1));

    try {
      const result = await togglePostLike(post.id);
      if (result.success) {
        setLocalIsLiked(result.isLiked ?? false);
        setLocalLikeCount(result.likeCount ?? 0);
        onLikeToggle(post.id);
      } else {
        // Revert on error
        setLocalIsLiked(post.isLiked);
        setLocalLikeCount(post._count.likes);
        toast.error(result.error || "Failed to like post");
      }
    } catch (error) {
      // Revert on error
      setLocalIsLiked(post.isLiked);
      setLocalLikeCount(post._count.likes);
      toast.error("Something went wrong");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeleteClick = async (postId: string) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deletePost(postId);
      if (result.success) {
        onDelete(postId);
        toast.success("Post deleted successfully");
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error || "Failed to delete post");
      }
    } catch (error) {
      toast.error("Something went wrong while deleting the post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border-0 rounded-lg p-4 bg-gray-900 transition-all duration-300">
      {/* Author Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full relative overflow-hidden shrink-0">
          <Image
            src={post.author.image || "/default_icon.png"}
            alt={post.author.name || "User"}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {post.author.name || "Anonymous"}
          </p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              aria-label="Post options"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="text-red-400 focus:text-red-300 focus:bg-red-950"
            >
              Delete post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-lg font-bold">
              🗑️Delete Post
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white">
              Are you sure you want to delete this post?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white cursor-pointer hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteClick(post.id)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white cursor-pointer"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Content */}
      <p className="text-sm text-white/90 mb-3 whitespace-pre-wrap wrap-break-word">
        {post.content}
      </p>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="mb-3">
          <PostImageCarousel images={post.images} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-colors cursor-pointer",
            localIsLiked
              ? "text-red-400 hover:text-red-300"
              : "text-gray-400 hover:text-red-400"
          )}
          aria-label={localIsLiked ? "Unlike post" : "Like post"}
        >
          <Heart className={cn("size-4", localIsLiked && "fill-current")} />
          <span>{localLikeCount}</span>
        </button>
      </div>
    </div>
  );
};

export const CommunityFeed = () => {
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

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  if (isLoading) {
    return (
      <>
        <h2 className="text-purple-300 text-2xl font-bold text-center w-full">
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
        <h2 className="text-purple-300 text-2xl font-bold text-center w-full">
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
      <h2 className="text-purple-300 text-2xl font-bold text-center w-full">
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
