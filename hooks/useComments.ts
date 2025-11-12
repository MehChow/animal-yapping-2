import { useState, useEffect, useRef } from "react";
import { getComments, addComment } from "@/app/actions/comments";
import { toast } from "sonner";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    replies: number;
  };
  isLiked: boolean;
};

type UseCommentsProps = {
  videoId: string;
  isAuthenticated: boolean;
};

export const useComments = ({ videoId, isAuthenticated }: UseCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load initial comments
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, nextCursor]);

  const loadComments = async () => {
    setIsLoading(true);
    const result = await getComments(videoId);

    if (result.success) {
      setComments(result.comments);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    }

    setIsLoading(false);
  };

  const loadMoreComments = async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    const result = await getComments(videoId, nextCursor);

    if (result.success) {
      setComments((prev) => [...prev, ...result.comments]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    }

    setIsLoadingMore(false);
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    const result = await addComment({
      videoId,
      content: newComment.trim(),
    });

    if (result.success && result.comment) {
      setComments((prev) => [result.comment!, ...prev]);
      setNewComment("");
      toast.success("Comment posted!");
    } else if (result.requiresAuth) {
      setShowLoginDialog(true);
    } else {
      toast.error(result.error || "Failed to post comment");
    }

    setIsSubmitting(false);
  };

  const handleCommentUpdate = (commentId: string, updates: Partial<Comment>) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, ...updates } : comment
      )
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    toast.success("Comment deleted");
  };

  const closeLoginDialog = () => setShowLoginDialog(false);

  return {
    comments,
    newComment,
    setNewComment,
    isSubmitting,
    isLoading,
    hasMore,
    isLoadingMore,
    showLoginDialog,
    scrollContainerRef,
    observerTarget,
    handleSubmitComment,
    handleCommentUpdate,
    handleCommentDelete,
    closeLoginDialog,
  };
};

