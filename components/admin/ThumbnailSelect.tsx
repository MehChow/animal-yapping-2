"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ImageIcon, UploadIcon, XIcon, LoaderIcon } from "lucide-react";
import { formatTimestamp } from "@/lib/stream-utils";
import { useThumbnailSelect } from "@/hooks/useThumbnailSelect";
import type { UploadData } from "./AddVideoDialog";
import { Spinner } from "@/components/ui/spinner";

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
  const {
    // State
    isPublishing,
    publishProgress,
    currentTimestamp,
    timestampInputValue,
    framePreview,
    isLoadingFrame,
    customThumbnailPreview,
    videoObjectUrl,

    // Derived
    videoDuration,
    isShorts,
    isCustomSelected,

    // Refs
    videoRef,
    fileInputRef,

    // Handlers
    handleVideoCanPlay,
    handleSeeked,
    handleSliderChange,
    handleTimestampInputChange,
    applyTimestampFromInput,
    handleTimestampKeyDown,
    handleCustomThumbnailSelect,
    handleClearCustomThumbnail,
    openFilePicker,
    handlePublish,
  } = useThumbnailSelect({ uploadData, onPublishSuccess });

  return (
    <div className="space-y-6 py-4">
      {/* Frame Preview Section */}
      <FramePreview
        videoObjectUrl={videoObjectUrl}
        videoRef={videoRef}
        isShorts={isShorts}
        isCustomSelected={isCustomSelected}
        customThumbnailPreview={customThumbnailPreview}
        framePreview={framePreview}
        isLoadingFrame={isLoadingFrame}
        onVideoCanPlay={handleVideoCanPlay}
        onSeeked={handleSeeked}
        onClearCustomThumbnail={handleClearCustomThumbnail}
      />

      {/* Timeline Slider Section */}
      <TimelineSlider
        currentTimestamp={currentTimestamp}
        timestampInputValue={timestampInputValue}
        videoDuration={videoDuration}
        isCustomSelected={isCustomSelected}
        isPublishing={isPublishing}
        onSliderChange={handleSliderChange}
        onTimestampInputChange={handleTimestampInputChange}
        onTimestampBlur={applyTimestampFromInput}
        onTimestampKeyDown={handleTimestampKeyDown}
      />

      {/* Custom Thumbnail Upload */}
      <CustomThumbnailUpload
        fileInputRef={fileInputRef}
        isPublishing={isPublishing}
        isShorts={isShorts}
        onFileSelect={handleCustomThumbnailSelect}
        onButtonClick={openFilePicker}
      />

      {/* Publishing Progress */}
      {isPublishing && <PublishingProgress progress={publishProgress} />}

      {/* Action Buttons */}
      <ActionButtons
        isPublishing={isPublishing}
        onBack={onBack}
        onPublish={handlePublish}
      />
    </div>
  );
};

// --- Sub-components ---

type FramePreviewProps = {
  videoObjectUrl: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isShorts: boolean;
  isCustomSelected: boolean;
  customThumbnailPreview: string | null;
  framePreview: string | null;
  isLoadingFrame: boolean;
  onVideoCanPlay: () => void;
  onSeeked: () => void;
  onClearCustomThumbnail: () => void;
};

const FramePreview: React.FC<FramePreviewProps> = ({
  videoObjectUrl,
  videoRef,
  isShorts,
  isCustomSelected,
  customThumbnailPreview,
  framePreview,
  isLoadingFrame,
  onVideoCanPlay,
  onSeeked,
  onClearCustomThumbnail,
}) => (
  <div className="flex flex-col items-center">
    <div
      className={`relative overflow-hidden rounded-xl border-2 border-white/10 bg-black/50 ${
        isShorts ? "w-48 aspect-9/16" : "w-full max-w-lg aspect-video"
      }`}
    >
      {/* Hidden video element for frame extraction */}
      {videoObjectUrl && (
        <video
          ref={videoRef}
          src={videoObjectUrl}
          className="hidden"
          muted
          playsInline
          preload="auto"
          onCanPlay={onVideoCanPlay}
          onSeeked={onSeeked}
        />
      )}

      {/* Display frame preview or custom thumbnail */}
      {isCustomSelected && customThumbnailPreview ? (
        <div className="relative w-full h-full">
          <img
            src={customThumbnailPreview}
            alt="Custom thumbnail preview"
            className="w-full h-full object-cover"
          />
          <Button
            onClick={onClearCustomThumbnail}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full size-8"
            aria-label="Remove custom thumbnail"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      ) : framePreview ? (
        <img
          src={framePreview}
          alt="Frame preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {isLoadingFrame ? (
            <LoaderIcon className="size-8 text-white/60 animate-spin" />
          ) : (
            <ImageIcon className="size-12 text-white/40" />
          )}
        </div>
      )}

      {/* Loading overlay */}
      {isLoadingFrame && !isCustomSelected && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <LoaderIcon className="size-8 text-white animate-spin" />
        </div>
      )}
    </div>
  </div>
);

type TimelineSliderProps = {
  currentTimestamp: number;
  timestampInputValue: string;
  videoDuration: number;
  isCustomSelected: boolean;
  isPublishing: boolean;
  onSliderChange: (value: number[]) => void;
  onTimestampInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimestampBlur: () => void;
  onTimestampKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const TimelineSlider: React.FC<TimelineSliderProps> = ({
  currentTimestamp,
  timestampInputValue,
  videoDuration,
  isCustomSelected,
  isPublishing,
  onSliderChange,
  onTimestampInputChange,
  onTimestampBlur,
  onTimestampKeyDown,
}) => (
  <div
    className={`space-y-3 transition-opacity duration-200 ${
      isCustomSelected ? "opacity-30 pointer-events-none" : "opacity-100"
    }`}
  >
    <Slider
      value={[currentTimestamp]}
      onValueChange={onSliderChange}
      max={videoDuration}
      step={0.1}
      disabled={isCustomSelected || isPublishing}
      className="w-full **:data-[slot=slider-track]:rounded-sm **:data-[slot=slider-track]:h-8 
              **:data-[slot=slider-track]:bg-white/20 **:data-[slot=slider-range]:bg-white/20 
              **:data-[slot=slider-thumb]:h-12 **:data-[slot=slider-thumb]:w-1 **:data-[slot=slider-thumb]:hover:ring-1"
    />

    {/* Timestamp display and input */}
    <div className="w-full flex items-center justify-center">
      <Input
        type="text"
        placeholder="MM:SS"
        value={timestampInputValue}
        onChange={onTimestampInputChange}
        onBlur={onTimestampBlur}
        onKeyDown={onTimestampKeyDown}
        disabled={isCustomSelected || isPublishing}
        className="w-28 text-center rounded-2xl bg-white/10 text-white/70 placeholder:text-purple-300/50 border-none focus:text-white focus-visible:ring-0"
        aria-label="Enter timestamp"
      />
    </div>
  </div>
);

type CustomThumbnailUploadProps = {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isPublishing: boolean;
  isShorts: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onButtonClick: () => void;
};

const CustomThumbnailUpload: React.FC<CustomThumbnailUploadProps> = ({
  fileInputRef,
  isPublishing,
  isShorts,
  onFileSelect,
  onButtonClick,
}) => (
  <>
    <div className="flex items-center justify-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        onChange={onFileSelect}
        className="hidden"
        aria-label="Select custom thumbnail"
      />
      <Button
        onClick={onButtonClick}
        variant="outline"
        disabled={isPublishing}
        className="border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-600/10 hover:text-amber-300 cursor-pointer"
      >
        <UploadIcon className="size-4 mr-2" />
        Select Custom Thumbnail
      </Button>
    </div>

    {/* Aspect ratio hint */}
    <p className="text-center text-xs text-white/40">
      {isShorts
        ? "Custom thumbnails must be 9:16 aspect ratio, max 5MB (JPG, PNG, HEIC, WebP)"
        : "Custom thumbnails must be 16:9 aspect ratio, max 5MB (JPG, PNG, HEIC, WebP)"}
    </p>
  </>
);

type PublishingProgressProps = {
  progress: number;
};

const PublishingProgress: React.FC<PublishingProgressProps> = ({
  progress,
}) => (
  <div className="space-y-2">
    <Progress value={progress} className="h-2" />
    <p className="text-sm text-white/60 text-center">
      Publishing video... {progress}%
    </p>
  </div>
);

type ActionButtonsProps = {
  isPublishing: boolean;
  onBack: () => void;
  onPublish: () => void;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isPublishing,
  onBack,
  onPublish,
}) => (
  <div className="flex justify-end gap-3 pt-4">
    <Button
      onClick={onBack}
      variant="ghost"
      className="text-white cursor-pointer hover:bg-white/10"
      disabled={isPublishing}
    >
      Back
    </Button>
    <Button
      onClick={onPublish}
      disabled={isPublishing}
      className="bg-green-600 text-white hover:bg-green-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPublishing && <Spinner />}
      {isPublishing ? "Publishing..." : "Upload"}
    </Button>
  </div>
);
