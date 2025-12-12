"use client";

import { forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ImageIcon, UploadIcon, XIcon, LoaderIcon } from "lucide-react";
import { useEditThumbnail } from "./use-edit-thumbnail";
import { ThumbnailSource } from "@/types/thumbnail";

type EditThumbnailEditorProps = {
  streamUid: string | null;
  videoType: "Normal" | "Shorts";
  videoDuration: number;
  currentThumbnailSource: ThumbnailSource;
  currentThumbnailTimestamp: number | null;
  currentCustomThumbnailKey: string | null;
};

export type EditThumbnailEditorRef = {
  getThumbnailData: () => any;
};

export const EditThumbnailEditor = forwardRef<
  EditThumbnailEditorRef,
  EditThumbnailEditorProps
>(
  (
    {
      streamUid,
      videoType,
      videoDuration,
      currentThumbnailSource,
      currentThumbnailTimestamp,
      currentCustomThumbnailKey,
    },
    ref
  ) => {
    const {
      thumbnailSource,
      currentTimestamp,
      timestampInputValue,
      framePreview,
      isLoadingFrame,
      customThumbnailPreview,
      isCustomSelected,
      isShorts,
      fileInputRef,
      handleSliderChange,
      handleTimestampInputChange,
      applyTimestampFromInput,
      handleTimestampKeyDown,
      handleCustomThumbnailSelect,
      handleClearCustomThumbnail,
      openFilePicker,
      switchToStream,
      getThumbnailData,
    } = useEditThumbnail({
      streamUid,
      videoType,
      videoDuration,
      currentThumbnailSource,
      currentThumbnailTimestamp,
      currentCustomThumbnailKey,
    });

    useImperativeHandle(ref, () => ({
      getThumbnailData,
    }));

    // Get current thumbnail preview URL
    const getCurrentThumbnailUrl = () => {
      // If custom thumbnail is selected and we have a preview (either new upload or existing)
      if (isCustomSelected && customThumbnailPreview) {
        return customThumbnailPreview;
      }
      // If stream thumbnail is selected and we have a frame preview
      if (thumbnailSource === "stream" && framePreview) {
        return framePreview;
      }
      return null;
    };

    const currentThumbnailUrl = getCurrentThumbnailUrl();

    return (
      <div className="space-y-6 py-4">
        {/* Current Thumbnail Display */}
        <div className="flex flex-col items-center">
          <div
            className={`relative overflow-hidden rounded-xl border-2 border-white/10 bg-black/50 ${
              isShorts ? "w-48 aspect-9/16" : "w-full max-w-lg aspect-video"
            }`}
          >
            {/* Display thumbnail preview */}
            {currentThumbnailUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={currentThumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                {isCustomSelected && customThumbnailPreview && (
                  <Button
                    onClick={handleClearCustomThumbnail}
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full size-8 cursor-pointer"
                    aria-label="Remove custom thumbnail"
                  >
                    <XIcon className="size-4" />
                  </Button>
                )}
              </div>
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

        {/* Thumbnail Source Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            onClick={switchToStream}
            variant={thumbnailSource === "stream" ? "default" : "outline"}
            className={
              thumbnailSource === "stream"
                ? "bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
            }
          >
            Use Video Frame
          </Button>
          <Button
            type="button"
            onClick={openFilePicker}
            variant={thumbnailSource === "custom" ? "default" : "outline"}
            className={
              thumbnailSource === "custom"
                ? "bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
            }
          >
            <UploadIcon className="size-4 mr-2" />
            Upload Custom
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handleCustomThumbnailSelect}
            className="hidden"
            aria-label="Select custom thumbnail"
          />
        </div>

        {/* Timeline Slider (only for stream thumbnails) */}
        {thumbnailSource === "stream" && streamUid && (
          <div className="space-y-3">
            <Slider
              value={[currentTimestamp]}
              onValueChange={handleSliderChange}
              max={videoDuration}
              step={0.1}
              disabled={isCustomSelected}
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
                onChange={handleTimestampInputChange}
                onBlur={applyTimestampFromInput}
                onKeyDown={handleTimestampKeyDown}
                disabled={isCustomSelected}
                className="w-28 text-center rounded-2xl bg-white/10 text-white/70 placeholder:text-purple-300/50 border-none focus:text-white focus-visible:ring-0"
                aria-label="Enter timestamp"
              />
            </div>
          </div>
        )}

        {/* Aspect ratio hint for custom thumbnails */}
        {thumbnailSource === "custom" && (
          <p className="text-center text-xs text-white/40">
            {isShorts
              ? "Custom thumbnails must be 9:16 aspect ratio, max 5MB (JPG, PNG, HEIC, WebP)"
              : "Custom thumbnails must be 16:9 aspect ratio, max 5MB (JPG, PNG, HEIC, WebP)"}
          </p>
        )}
      </div>
    );
  }
);

EditThumbnailEditor.displayName = "EditThumbnailEditor";
