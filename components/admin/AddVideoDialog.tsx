"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GameTypeSelect } from "./GameTypeSelect";
import { VideoUpload } from "./VideoUpload";
import { VideoMetadata } from "./VideoMetadata";
import { ThumbnailSelect } from "./ThumbnailSelect";
import { Button } from "@/components/ui/button";
import { VideoIcon, PartyPopperIcon, AlertTriangleIcon } from "lucide-react";
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
    showCloseWarning,
    uploadData,
    handleOpenChange,
    handleConfirmClose,
    handleCancelClose,
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
        className="bg-green-600/20 text-green-300 hover:bg-green-600/30 border border-green-500/30 cursor-pointer"
      >
        <VideoIcon className="size-4 mr-2" />
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

      {/* Close Warning Dialog */}
      <AlertDialog open={showCloseWarning} onOpenChange={handleCancelClose}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="rounded-full bg-amber-500/20 p-3">
                <AlertTriangleIcon className="size-6 text-amber-500" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              Discard Upload Progress?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-white/60">
              You have unsaved progress in your video upload. If you close this
              dialog, all your data will be lost and you&apos;ll need to start
              over.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <AlertDialogCancel
              onClick={handleCancelClose}
              className="flex-1 border-white/20 bg-zinc-800 hover:bg-white/10 text-white hover:text-white cursor-pointer"
            >
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              className="flex-1 bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Discard & Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              Your video has been published and is now live.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-[80%] mx-auto pt-4">
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
