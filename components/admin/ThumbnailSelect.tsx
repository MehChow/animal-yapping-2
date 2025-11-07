"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCwIcon, CheckIcon } from "lucide-react";
import { useThumbnailGeneration } from "@/hooks/useThumbnailGeneration";
import { useVideoPublish } from "@/hooks/useVideoPublish";
import type { UploadData } from "./AddVideoDialog";

type ThumbnailSelectProps = {
  uploadData: UploadData;
  onComplete: () => void;
  onBack: () => void;
};

export const ThumbnailSelect: React.FC<ThumbnailSelectProps> = ({
  uploadData,
  onComplete,
  onBack,
}) => {
  const {
    thumbnails,
    selectedThumbnail,
    setSelectedThumbnail,
    isGenerating,
    regenerateThumbnails,
  } = useThumbnailGeneration({
    videoFile: uploadData.videoFile,
    videoType: uploadData.videoType,
  });

  const { publishVideo, uploadProgress, optimisticProgress, isPending } =
    useVideoPublish();

  const handlePublish = async () => {
    if (!selectedThumbnail) {
      return;
    }

    if (
      !uploadData.videoFile ||
      !uploadData.gameType ||
      !uploadData.title ||
      !uploadData.videoType
    ) {
      return;
    }

    const success = await publishVideo({
      videoFile: uploadData.videoFile,
      thumbnailDataUrl: selectedThumbnail,
      gameType: uploadData.gameType,
      videoType: uploadData.videoType,
      title: uploadData.title,
      description: uploadData.description,
      tags: uploadData.tags,
    });

    if (success) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6 py-4">
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCwIcon className="size-12 text-white/60 animate-spin mb-4" />
          <p className="text-white/60">Generating thumbnails from video...</p>
        </div>
      ) : thumbnails.length > 0 ? (
        <>
          <div
            className={`grid gap-4 ${
              uploadData.videoType === "Shorts" ? "grid-cols-5" : "grid-cols-3"
            }`}
          >
            {thumbnails.map((thumbnail) => (
              <Button
                key={thumbnail.id}
                onClick={() => setSelectedThumbnail(thumbnail.data)}
                variant="ghost"
                className={`relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer h-auto p-0 hover:bg-transparent ${
                  uploadData.videoType === "Shorts"
                    ? "aspect-9/16"
                    : "aspect-video"
                } ${
                  selectedThumbnail === thumbnail.data
                    ? "border-white/80 ring-2 ring-white/40"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                <img
                  src={thumbnail.data}
                  alt={`Thumbnail at ${thumbnail.timestamp}s`}
                  className="w-full h-full object-cover"
                />
                {selectedThumbnail === thumbnail.data && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <CheckIcon className="size-12 text-white" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                  {thumbnail.timestamp}s
                </div>
              </Button>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={regenerateThumbnails}
              variant="ghost"
              className="text-white cursor-pointer"
              disabled={isGenerating || isPending}
            >
              <RefreshCwIcon className="size-4 mr-2" />
              Try Again
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-white/60">
          <p>No thumbnails available. Click "Try Again" to generate.</p>
        </div>
      )}

      {isPending && (
        <div className="space-y-2">
          <Progress value={optimisticProgress} className="h-2" />
          <p className="text-sm text-white/60 text-center">
            Publishing video... {optimisticProgress}%
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white cursor-pointer"
          disabled={isPending}
        >
          Back
        </Button>
        <Button
          onClick={handlePublish}
          disabled={!selectedThumbnail || isPending || isGenerating}
          className="bg-green-600 text-white hover:bg-green-700 border border-green-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Publishing..." : "Publish Video"}
        </Button>
      </div>
    </div>
  );
};

