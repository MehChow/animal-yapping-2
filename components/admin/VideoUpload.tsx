"use client";

import { useState, useRef } from "react";
import { UploadIcon, FileVideoIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoValidation } from "@/hooks/useVideoValidation";
import {
  formatFileSize,
  type VideoType,
  type VideoMetadata,
} from "@/utils/video-utils";

type VideoUploadProps = {
  onUpload: (file: File, videoType: VideoType) => void;
  onBack: () => void;
};

export const VideoUpload: React.FC<VideoUploadProps> = ({
  onUpload,
  onBack,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
    null
  );
  const [videoType, setVideoType] = useState<VideoType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isAnalyzing, validateAndAnalyzeVideo } = useVideoValidation();

  const handleFileSelect = async (selectedFile: File) => {
    const result = await validateAndAnalyzeVideo(selectedFile);

    if (result.isValid) {
      setFile(selectedFile);
      setVideoType(result.videoType);
      setVideoMetadata(result.metadata);
    } else {
      setFile(null);
      setVideoType(null);
      setVideoMetadata(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setVideoMetadata(null);
    setVideoType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNext = () => {
    if (file && videoType) {
      onUpload(file, videoType);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-white/60 bg-white/10"
              : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon className="size-16 mx-auto mb-4 text-white/60" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Drop your video here
          </h3>
          <p className="text-white/60 mb-4">or click to browse</p>
          <p className="text-sm text-white/40">
            Supported formats: MP4, MOV, WEBM (Max 200MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : isAnalyzing ? (
        <div className="border border-white/20 rounded-lg p-12 bg-white/5 text-center">
          <div className="animate-spin size-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Analyzing Video...
          </h3>
          <p className="text-sm text-white/60">
            Reading video metadata and detecting format
          </p>
        </div>
      ) : (
        <div className="border border-white/20 rounded-lg p-6 bg-white/5">
          <div className="flex items-center gap-4">
            <FileVideoIcon className="size-12 text-white/60 shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-medium text-white truncate">
                {file.name}
              </h4>
              <p className="text-sm text-white/60">
                {formatFileSize(file.size)}
              </p>
              {videoMetadata && videoType && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-white/80">
                    <span className="font-semibold">Type:</span> {videoType} (
                    {videoType === "Normal" ? "16:9" : "9:16"})
                  </p>
                  <p className="text-sm text-white/80">
                    <span className="font-semibold">Resolution:</span>{" "}
                    {videoMetadata.width}x{videoMetadata.height}
                  </p>
                  <p className="text-sm text-white/80">
                    <span className="font-semibold">Duration:</span>{" "}
                    {Math.round(videoMetadata.duration)}s
                  </p>
                </div>
              )}
            </div>
            <Button
              onClick={handleRemoveFile}
              variant="ghost"
              size="icon-sm"
              className="text-white/60 hover:text-white cursor-pointer"
            >
              <XIcon className="size-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white cursor-pointer"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!file || !videoType || isAnalyzing}
          className="bg-white/10 text-white hover:bg-white/20 border border-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

