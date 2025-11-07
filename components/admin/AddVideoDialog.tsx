"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GameTypeSelect } from "./GameTypeSelect";
import { VideoUpload } from "./VideoUpload";
import { VideoMetadata } from "./VideoMetadata";
import { ThumbnailSelect } from "./ThumbnailSelect";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

export type UploadData = {
  gameType: string;
  videoFile: File | null;
  videoType: "Normal" | "Shorts" | null;
  videoUrl: string | null;
  title: string;
  description: string;
  tags: string[];
  selectedThumbnail: string | null;
};

export const AddVideoDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [uploadData, setUploadData] = useState<UploadData>({
    gameType: "",
    videoFile: null,
    videoType: null,
    videoUrl: null,
    title: "",
    description: "",
    tags: [],
    selectedThumbnail: null,
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setCurrentStep(1);
      setUploadData({
        gameType: "",
        videoFile: null,
        videoType: null,
        videoUrl: null,
        title: "",
        description: "",
        tags: [],
        selectedThumbnail: null,
      });
    }
  };

  const handleGameTypeSelect = (gameType: string) => {
    setUploadData((prev) => ({ ...prev, gameType }));
    setCurrentStep(2);
  };

  const handleVideoUpload = (file: File, videoType: "Normal" | "Shorts") => {
    setUploadData((prev) => ({ ...prev, videoFile: file, videoType }));
    setCurrentStep(3);
  };

  const handleMetadataSubmit = (data: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    setUploadData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  const handleThumbnailSelect = () => {
    // Upload is handled in ThumbnailSelect component
    setIsOpen(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Select Game Type";
      case 2:
        return "Upload Video";
      case 3:
        return "Enter Video Details";
      case 4:
        return "Select Thumbnail";
      default:
        return "";
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-white/10 text-white hover:bg-white/20 border border-white/20 cursor-pointer"
      >
        <PlusIcon className="size-4 mr-2" />
        Add Video
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl bg-black/95 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {getStepTitle()}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6">
            {currentStep === 1 && (
              <GameTypeSelect onSelect={handleGameTypeSelect} />
            )}
            {currentStep === 2 && (
              <VideoUpload
                onUpload={handleVideoUpload}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <VideoMetadata
                onSubmit={handleMetadataSubmit}
                onBack={handleBack}
                initialData={{
                  title: uploadData.title,
                  description: uploadData.description,
                  tags: uploadData.tags,
                }}
              />
            )}
            {currentStep === 4 && uploadData.videoFile && (
              <ThumbnailSelect
                uploadData={uploadData}
                onComplete={handleThumbnailSelect}
                onBack={handleBack}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

