"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GameTypeSelect } from "./GameTypeSelect";
import { VideoUpload } from "./VideoUpload";
import { VideoMetadata } from "./VideoMetadata";
import { ThumbnailSelect } from "./ThumbnailSelect";
import { Button } from "@/components/ui/button";
import { PlusIcon, PartyPopperIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

export type UploadData = {
  gameType: string;
  videoFile: File | null;
  videoType: "Normal" | "Shorts" | null;
  duration: number | null;
  title: string;
  description: string;
  tags: string[];
};

export const AddVideoDialog = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [publishedVideoId, setPublishedVideoId] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<UploadData>({
    gameType: "",
    videoFile: null,
    videoType: null,
    duration: null,
    title: "",
    description: "",
    tags: [],
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Small delay to ensure smooth closing before reset
      setTimeout(() => {
        setCurrentStep(1);
        setUploadData({
          gameType: "",
          videoFile: null,
          videoType: null,
          duration: null,
          title: "",
          description: "",
          tags: [],
        });
      }, 300);
    }
  };

  const handlePublishSuccess = (videoId: string) => {
    setPublishedVideoId(videoId);
    setIsOpen(false); // Close upload dialog first
    setTimeout(() => {
      setShowSuccessDialog(true); // Show success dialog after upload dialog closes
    }, 300);
  };

  const handleBackToAdmin = () => {
    setShowSuccessDialog(false);
    router.refresh();
  };

  const handleViewVideo = () => {
    setShowSuccessDialog(false);
    if (publishedVideoId) {
      router.push(`/video/${publishedVideoId}`);
      router.refresh();
    } else {
      toast.info("Video page coming soon!");
    }
  };

  const handleGameTypeSelect = (gameType: string) => {
    setUploadData((prev) => ({ ...prev, gameType }));
    setCurrentStep(2);
  };

  const handleVideoUpload = (
    file: File,
    videoType: "Normal" | "Shorts",
    duration: number
  ) => {
    setUploadData((prev) => ({
      ...prev,
      videoFile: file,
      videoType,
      duration,
    }));
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
              <VideoUpload onUpload={handleVideoUpload} onBack={handleBack} />
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
                onPublishSuccess={handlePublishSuccess}
                onBack={handleBack}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-500/20 p-3">
                <PartyPopperIcon className="size-8 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Video Uploaded Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-white/60 pt-2">
              Your video has been published and is now live. What would you like
              to do next?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              onClick={handleBackToAdmin}
              variant="outline"
              className="flex-1 border-white/20 text-black bg-white hover:bg-gray-200 cursor-pointer"
            >
              Back to Admin Panel
            </Button>
            <Button
              onClick={handleViewVideo}
              className="flex-1 bg-blue-400 text-white hover:bg-blue-500 cursor-pointer"
            >
              View the Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
