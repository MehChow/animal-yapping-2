"use client";

import { formatDistanceToNow } from "date-fns";
import { Heart, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { DeletePostDialog } from "@/components/dialog/DeletePostDialog";
import { PostImageCarousel } from "./PostImageCarousel";
import { Post } from "@/types/post";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: Post;
  onLikeToggle: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export const PostCard = ({ post, onLikeToggle, onDelete }: PostCardProps) => {
  const {
    isLiking,
    isDeleting,
    showDeleteDialog,
    localIsLiked,
    localLikeCount,
    setShowDeleteDialog,
    handleLikeClick,
    handleDeleteClick,
  } = usePostInteractions({ post, onLikeToggle, onDelete });

  return (
    <div className="border-0 rounded-lg p-4 bg-gray-900 transition-all duration-300">
      {/* User Info */}
      <div className="flex items-start gap-3 mb-3">
        {/* User Image */}
        <div className="w-10 h-10 rounded-full relative overflow-hidden shrink-0">
          <Image
            src={post.author.image || "/default_icon.png"}
            alt={post.author.name || "User"}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>

        {/* User Name and Time */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {post.author.name || "Anonymous"}
          </p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* 3-dot Dropdown Menu */}
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
      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={handleDeleteClick}
        isDeleting={isDeleting}
      />

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
