"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCwIcon, CheckIcon } from "lucide-react";
import { useThumbnailGeneration } from "@/hooks/useThumbnailGeneration";
import { useStreamUpload } from "@/hooks/useStreamUpload";
import { setStreamThumbnail } from "@/app/actions/stream-upload";
import { uploadVideo } from "@/app/actions/video";
import { toast } from "sonner";
import type { UploadData } from "./AddVideoDialog";

type ThumbnailSelectProps = {
  uploadData: UploadData;
  onPublishSuccess: (videoId: string) => void;
  onBack: () => void;
};

export const ThumbnailSelect: React.FC<ThumbnailSelectProps> = ({
  uploadData,
  onPublishSuccess,
  onBack,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  // Client-side thumbnail generation
  const {
    thumbnails,
    selectedThumbnail,
    selectedTimestamp,
    handleSelectThumbnail,
    isGenerating,
    regenerateThumbnails,
  } = useThumbnailGeneration({
    videoFile: uploadData.videoFile,
    videoType: uploadData.videoType,
  });

  // Stream upload hook (will be used in handlePublish)
  const { uploadToStream } = useStreamUpload();

  const handlePublish = async () => {
    if (!selectedThumbnail || selectedTimestamp === null) {
      toast.error("Please select a thumbnail");
      return;
    }

    if (
      !uploadData.videoFile ||
      !uploadData.gameType ||
      !uploadData.title ||
      !uploadData.videoType
    ) {
      toast.error("Missing required data");
      return;
    }

    setIsPublishing(true);
    setPublishProgress(0);

    try {
      // Step 1: Upload video to Stream (0% → 60%)
      setPublishProgress(10);
      toast.info("Uploading video to Stream...");

      const videoUid = await uploadToStream(uploadData.videoFile);

      if (!videoUid) {
        toast.error("Failed to upload video");
        setIsPublishing(false);
        return;
      }

      setPublishProgress(60);

      // Step 2: Set thumbnail on Stream (60% → 80%)
      toast.info("Setting thumbnail...");

      const thumbResult = await setStreamThumbnail({
        videoUid,
        thumbnailDataUrl: selectedThumbnail,
        timestamp: selectedTimestamp,
      });

      if (!thumbResult.success) {
        toast.error(thumbResult.error || "Failed to set thumbnail");
        setIsPublishing(false);
        return;
      }

      setPublishProgress(80);

      // Step 3: Save metadata to database (80% → 100%)
      toast.info("Saving video metadata...");

      const result = await uploadVideo({
        streamUid: videoUid,
        gameType: uploadData.gameType,
        videoType: uploadData.videoType,
        title: uploadData.title,
        description: uploadData.description,
        tags: uploadData.tags,
        duration: uploadData.duration || undefined,
      });

      setPublishProgress(100);

      if (result.success) {
        toast.success("Video published successfully!");
        // Call parent's success handler with videoId
        if (result.videoId) {
          onPublishSuccess(result.videoId);
        }
      } else {
        toast.error(result.error || "Failed to publish video");
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Failed to publish video");
    } finally {
      setIsPublishing(false);
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
                onClick={() =>
                  handleSelectThumbnail(thumbnail.data, thumbnail.timestamp)
                }
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
              className="group text-white cursor-pointer hover:bg-transparent hover:text-purple-300 hover:scale-110 transition-all duration-300"
              disabled={isGenerating || isPublishing}
            >
              <RefreshCwIcon className="size-4 mr-2 transition-transform duration-500 ease-in-out group-hover:rotate-180" />
              Try Again
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-white/60">
          <p>No thumbnails available. Click "Try Again" to generate.</p>
        </div>
      )}

      {isPublishing && (
        <div className="space-y-2">
          <Progress value={publishProgress} className="h-2" />
          <p className="text-sm text-white/60 text-center">
            Publishing video... {publishProgress}%
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white cursor-pointer"
          disabled={isPublishing}
        >
          Back
        </Button>
        <Button
          onClick={handlePublish}
          disabled={!selectedThumbnail || isPublishing || isGenerating}
          className="bg-green-600 text-white hover:bg-green-700 border border-green-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? "Publishing..." : "Publish Video"}
        </Button>
      </div>
    </div>
  );
};
