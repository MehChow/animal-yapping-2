import { useState } from "react";
import { toggleVideoLike, toggleVideoFavorite } from "@/app/actions/video-page";
import { toast } from "sonner";

type UseVideoInteractionsProps = {
  videoId: string;
  initialIsLiked: boolean;
  initialIsFavorited: boolean;
  initialLikeCount: number;
};

export const useVideoInteractions = ({
  videoId,
  initialIsLiked,
  initialIsFavorited,
  initialLikeCount,
}: UseVideoInteractionsProps) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLike = async () => {
    const result = await toggleVideoLike(videoId);

    if (result.requiresAuth) {
      setShowLoginDialog(true);
      return;
    }

    if (result.success) {
      setIsLiked(result.isLiked!);
      setLikeCount((prev) => (result.isLiked ? prev + 1 : prev - 1));
    } else {
      toast.error(result.error || "Failed to update like");
    }
  };

  const handleFavorite = async () => {
    const result = await toggleVideoFavorite(videoId);

    if (result.requiresAuth) {
      setShowLoginDialog(true);
      return;
    }

    if (result.success) {
      setIsFavorited(result.isFavorited!);
      toast.success(
        result.isFavorited ? "Added to favorites" : "Removed from favorites"
      );
    } else {
      toast.error(result.error || "Failed to update favorite");
    }
  };

  const closeLoginDialog = () => setShowLoginDialog(false);

  return {
    isLiked,
    isFavorited,
    likeCount,
    showLoginDialog,
    handleLike,
    handleFavorite,
    closeLoginDialog,
  };
};

