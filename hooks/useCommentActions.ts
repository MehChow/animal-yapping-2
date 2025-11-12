import { useState } from "react";
import {
  toggleCommentLike,
  addComment,
  deleteComment,
  getComments,
} from "@/app/actions/comments";
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

type UseCommentActionsProps = {
  comment: Comment;
  videoId: string;
  isAuthenticated: boolean;
  canDelete: boolean;
  onUpdate: (commentId: string, updates: Partial<Comment>) => void;
  onDelete: (commentId: string) => void;
};

export const useCommentActions = ({
  comment,
  videoId,
  isAuthenticated,
  canDelete,
  onUpdate,
  onDelete,
}: UseCommentActionsProps) => {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment._count.likes);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    const result = await toggleCommentLike(comment.id);

    if (result.requiresAuth) {
      setShowLoginDialog(true);
      return;
    }

    if (result.success) {
      const newIsLiked = result.isLiked!;
      setIsLiked(newIsLiked);
      setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

      onUpdate(comment.id, {
        _count: {
          ...comment._count,
          likes: newIsLiked ? likeCount + 1 : likeCount - 1,
        },
        isLiked: newIsLiked,
      });
    } else {
      toast.error(result.error || "Failed to update like");
    }
  };

  const handleReply = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    setShowReplyInput(true);
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    setIsSubmittingReply(true);

    const result = await addComment({
      videoId,
      content: replyContent.trim(),
      parentId: comment.id,
    });

    if (result.success && result.comment) {
      setReplies((prev) => [result.comment!, ...prev]);
      setReplyContent("");
      setShowReplyInput(false);
      setShowReplies(true);
      toast.success("Reply posted!");

      // Update reply count
      onUpdate(comment.id, {
        _count: {
          ...comment._count,
          replies: comment._count.replies + 1,
        },
      });
    } else if (result.requiresAuth) {
      setShowLoginDialog(true);
    } else {
      toast.error(result.error || "Failed to post reply");
    }

    setIsSubmittingReply(false);
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const result = await deleteComment(comment.id);

    if (result.success) {
      onDelete(comment.id);
    } else if (result.requiresAuth) {
      setShowLoginDialog(true);
    } else {
      toast.error(result.error || "Failed to delete comment");
    }
  };

  const loadReplies = async () => {
    if (isLoadingReplies || replies.length > 0) {
      setShowReplies(!showReplies);
      return;
    }

    setIsLoadingReplies(true);
    setShowReplies(true);

    const result = await getComments(videoId, undefined, comment.id);

    if (result.success) {
      setReplies(result.comments);
    } else {
      toast.error("Failed to load replies");
    }

    setIsLoadingReplies(false);
  };

  const handleReplyUpdate = (replyId: string, updates: Partial<Comment>) => {
    setReplies((prev) =>
      prev.map((reply) =>
        reply.id === replyId ? { ...reply, ...updates } : reply
      )
    );
  };

  const handleReplyDelete = (replyId: string) => {
    setReplies((prev) => prev.filter((reply) => reply.id !== replyId));
    onUpdate(comment.id, {
      _count: {
        ...comment._count,
        replies: comment._count.replies - 1,
      },
    });
  };

  const cancelReply = () => {
    setShowReplyInput(false);
    setReplyContent("");
  };

  const closeLoginDialog = () => setShowLoginDialog(false);

  return {
    isLiked,
    likeCount,
    showReplyInput,
    replyContent,
    setReplyContent,
    isSubmittingReply,
    showLoginDialog,
    replies,
    showReplies,
    isLoadingReplies,
    handleLike,
    handleReply,
    handleSubmitReply,
    handleDelete,
    loadReplies,
    handleReplyUpdate,
    handleReplyDelete,
    cancelReply,
    closeLoginDialog,
  };
};

