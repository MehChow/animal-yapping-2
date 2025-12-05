import { useState } from "react";
import { togglePostLike, deletePost } from "@/app/actions/posts";
import { toast } from "sonner";
import { PostInteraction } from "@/types/post";

interface UsePostInteractionsProps {
  post: PostInteraction;
  onLikeToggle: (postId: string) => void;
  onDelete: (postId: string) => void;
}

interface UsePostInteractionsReturn {
  isLiking: boolean;
  isDeleting: boolean;
  showDeleteDialog: boolean;
  localIsLiked: boolean;
  localLikeCount: number;
  setShowDeleteDialog: (show: boolean) => void;
  handleLikeClick: () => Promise<void>;
  handleDeleteClick: () => Promise<void>;
}

export const usePostInteractions = ({
  post,
  onLikeToggle,
  onDelete,
}: UsePostInteractionsProps): UsePostInteractionsReturn => {
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

  const handleDeleteClick = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deletePost(post.id);
      if (result.success) {
        onDelete(post.id);
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

  return {
    isLiking,
    isDeleting,
    showDeleteDialog,
    localIsLiked,
    localLikeCount,
    setShowDeleteDialog,
    handleLikeClick,
    handleDeleteClick,
  };
};
