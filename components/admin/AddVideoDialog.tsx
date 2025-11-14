"use client";

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
import { useUploadVideo } from "@/hooks/useUploadVideo";

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
  const {
    isOpen,
    setIsOpen,
    currentStep,
    showSuccessDialog,
    setShowSuccessDialog,
    uploadData,
    handleOpenChange,
    handlePublishSuccess,
    handleBackToAdmin,
    handleViewVideo,
    handleGameTypeSelect,
    handleVideoUpload,
    handleMetadataSubmit,
    handleBack,
    getStepTitle,
  } = useUploadVideo();

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
