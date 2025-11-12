"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Reply, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@/lib/auth-client";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useCommentActions } from "@/hooks/useCommentActions";

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

type CommentItemProps = {
  comment: Comment;
  videoId: string;
  onUpdate: (commentId: string, updates: Partial<Comment>) => void;
  onDelete: (commentId: string) => void;
  isReply?: boolean;
};

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  videoId,
  onUpdate,
  onDelete,
  isReply = false,
}) => {
  const { data: session } = useSession();

  const isOwner = session?.user?.id === comment.user.id;
  const isAdmin = (session?.user as any)?.role === "Admin";
  const canDelete = isOwner || isAdmin;

  const {
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
  } = useCommentActions({
    comment,
    videoId,
    isAuthenticated: !!session,
    canDelete,
    onUpdate,
    onDelete,
  });

  return (
    <>
      <div
        className={`${isReply ? "ml-8 pl-4 border-l-2 border-white/10" : ""}`}
      >
        <div className="flex gap-3">
          {/* User Avatar */}
          {comment.user.image ? (
            <img
              src={comment.user.image}
              alt={comment.user.name || "User"}
              className="size-8 rounded-full shrink-0"
            />
          ) : (
            <div className="size-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
              {comment.user.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}

          {/* Comment Content */}
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">
                {comment.user.name || "Anonymous"}
              </span>
              <span className="text-white/40">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Comment Text */}
            <p className="text-white/80 whitespace-pre-wrap wrap-break-word">
              {comment.content}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLike}
                variant="ghost"
                size="sm"
                className={`h-8 px-2 cursor-pointer hover:bg-white/10 ${
                  isLiked ? "text-red-500" : "text-white/60"
                }`}
              >
                <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
                {likeCount > 0 && <span className="ml-1">{likeCount}</span>}
              </Button>

              {!isReply && (
                <Button
                  onClick={handleReply}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-white/60 hover:bg-white/10 cursor-pointer"
                >
                  <Reply className="size-4" />
                  <span className="ml-1">Reply</span>
                </Button>
              )}

              {canDelete && (
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            {/* Reply Input */}
            {showReplyInput && (
              <div className="space-y-2 pt-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none min-h-[60px] text-sm"
                  maxLength={2000}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={cancelReply}
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || isSubmittingReply}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReply ? (
                      <>
                        <Loader2 className="size-3 mr-1 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Reply"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Show Replies Button */}
            {!isReply && comment._count.replies > 0 && (
              <Button
                onClick={loadReplies}
                variant="ghost"
                size="sm"
                className="h-8 text-purple-400 hover:bg-white/10 cursor-pointer"
              >
                {isLoadingReplies ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : showReplies ? (
                  `Hide ${comment._count.replies} ${
                    comment._count.replies === 1 ? "reply" : "replies"
                  }`
                ) : (
                  `View ${comment._count.replies} ${
                    comment._count.replies === 1 ? "reply" : "replies"
                  }`
                )}
              </Button>
            )}

            {/* Replies List */}
            {showReplies && replies.length > 0 && (
              <div className="space-y-4 pt-2">
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    videoId={videoId}
                    onUpdate={handleReplyUpdate}
                    onDelete={handleReplyDelete}
                    isReply
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginPromptDialog open={showLoginDialog} onClose={closeLoginDialog} />
    </>
  );
};
