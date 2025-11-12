"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Bookmark, Eye } from "lucide-react";
import { LoginPromptDialog } from "./LoginPromptDialog";
import { formatDistanceToNow } from "date-fns";
import { useVideoInteractions } from "@/hooks/useVideoInteractions";

type VideoInfoProps = {
  video: {
    id: string;
    title: string;
    description: string | null;
    gameType: string;
    videoType: string;
    tags: string[];
    viewCount: number;
    createdAt: Date;
    uploadedBy: {
      id: string;
      name: string | null;
      image: string | null;
    };
    isLiked: boolean;
    isFavorited: boolean;
    _count: {
      likes: number;
      comments: number;
    };
  };
};

export const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  const {
    isLiked,
    isFavorited,
    likeCount,
    showLoginDialog,
    handleLike,
    handleFavorite,
    closeLoginDialog,
  } = useVideoInteractions({
    videoId: video.id,
    initialIsLiked: video.isLiked,
    initialIsFavorited: video.isFavorited,
    initialLikeCount: video._count.likes,
  });

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {/* Title + Metadata Row */}
        <div className="flex items-start justify-between gap-3">
          {/* Left: Title */}
          <h1 className="text-xl font-bold line-clamp-2 flex-1">
            {video.title}
          </h1>

          {/* Right: Metadata + Action Buttons */}
          <div className="flex items-start gap-3 shrink-0">
            {/* Metadata */}
            <div className="flex flex-col gap-0.5 text-xs text-white/60 pt-1">
              <div className="flex items-center gap-1">
                <Eye className="size-3" />
                <span>{video.viewCount.toLocaleString()} views</span>
              </div>
              <span>
                {formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-start gap-2">
              <Button
                onClick={handleLike}
                variant="outline"
                size="sm"
                className={`flex items-center gap-1.5 cursor-pointer transition-colors h-8 ${
                  isLiked
                    ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30"
                    : "border-white/20 text-blue-500 hover:bg-white/10"
                }`}
              >
                <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-xs">{likeCount.toLocaleString()}</span>
              </Button>

              <Button
                onClick={handleFavorite}
                variant="outline"
                size="sm"
                className={`flex items-center gap-1.5 cursor-pointer transition-colors h-8 ${
                  isFavorited
                    ? "bg-blue-500/20 border-blue-500 text-blue-500 hover:bg-blue-500/30"
                    : "border-white/20 text-blue-500 hover:bg-white/10"
                }`}
              >
                <Bookmark
                  className={`size-4 ${isFavorited ? "fill-current" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Compact tags row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs py-0">
            {video.gameType}
          </Badge>
          <Badge
            className={`text-xs py-0 ${
              video.videoType === "Shorts"
                ? "bg-green-500/20 text-green-400 border-green-500/50"
                : "bg-blue-500/20 text-blue-400 border-blue-500/50"
            }`}
          >
            {video.videoType}
          </Badge>
          {video.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-white/20 text-white/80 text-xs py-0"
            >
              {tag}
            </Badge>
          ))}
          {video.tags.length > 3 && (
            <span className="text-xs text-white/40">
              +{video.tags.length - 3}
            </span>
          )}
        </div>

        {/* Compact description with line clamp */}
        {video.description && (
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/80 text-sm line-clamp-3">
              {video.description}
            </p>
          </div>
        )}
      </div>

      <LoginPromptDialog open={showLoginDialog} onClose={closeLoginDialog} />
    </>
  );
};
