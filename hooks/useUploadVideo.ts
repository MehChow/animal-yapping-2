import { UploadData } from "@/components/admin/AddVideoDialog";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

const INITIAL_UPLOAD_DATA: UploadData = {
  gameType: "",
  videoFile: null,
  videoType: null,
  duration: null,
  title: "",
  description: "",
  tags: [],
};

export const useUploadVideo = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const [publishedVideoId, setPublishedVideoId] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<UploadData>(INITIAL_UPLOAD_DATA);

  // Reset all upload state
  const resetUploadState = useCallback(() => {
    setCurrentStep(1);
    setUploadData(INITIAL_UPLOAD_DATA);
  }, []);

  // Check if user has made progress (beyond step 1)
  const hasProgress = currentStep > 1;

  // Handle dialog open/close with warning check
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        // Opening dialog - reset state
        resetUploadState();
        setIsOpen(true);
      } else {
        // Closing dialog - check if we need to show warning
        if (hasProgress) {
          setShowCloseWarning(true);
        } else {
          setIsOpen(false);
          resetUploadState();
        }
      }
    },
    [hasProgress, resetUploadState]
  );

  // Confirm close (from warning dialog)
  const handleConfirmClose = useCallback(() => {
    setShowCloseWarning(false);
    setIsOpen(false);
    resetUploadState();
  }, [resetUploadState]);

  // Cancel close (stay in dialog)
  const handleCancelClose = useCallback(() => {
    setShowCloseWarning(false);
  }, []);

  const handlePublishSuccess = useCallback(
    (videoId: string) => {
      setPublishedVideoId(videoId);
      setIsOpen(false); // Close upload dialog first
      setTimeout(() => {
        resetUploadState();
        setShowSuccessDialog(true); // Show success dialog after upload dialog closes
      }, 300);
    },
    [resetUploadState]
  );

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

  return {
    // State
    isOpen,
    setIsOpen,
    currentStep,
    setCurrentStep,
    showSuccessDialog,
    setShowSuccessDialog,
    showCloseWarning,
    setShowCloseWarning,
    publishedVideoId,
    setPublishedVideoId,
    uploadData,
    setUploadData,

    // Handlers
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
  };
};
