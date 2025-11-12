"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "./CommentItem";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useComments } from "@/hooks/useComments";

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

type CommentSectionProps = {
  videoId: string;
};

export const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
  const { data: session } = useSession();

  const {
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
  } = useComments({
    videoId,
    isAuthenticated: !!session,
  });

  return (
    <>
      <div className="h-full flex flex-col bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">
            Comments ({comments.length})
          </h2>
        </div>

        {/* Comment Input */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <Textarea
            placeholder={
              session
                ? "Add a comment..."
                : "Login to comment"
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => {
              if (!session) {
                // Logic already handled by handleSubmitComment
              }
            }}
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none min-h-[80px]"
            maxLength={2000}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/40">
              {newComment.length}/2000
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="size-8 animate-spin text-white/60" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <p className="text-lg">No comments yet</p>
              <p className="text-sm mt-2">Be the first to comment!</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  videoId={videoId}
                  onUpdate={handleCommentUpdate}
                  onDelete={handleCommentDelete}
                />
              ))}

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center py-4">
                  {isLoadingMore && (
                    <Loader2 className="size-6 animate-spin text-white/60" />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <LoginPromptDialog open={showLoginDialog} onClose={closeLoginDialog} />
    </>
  );
};

