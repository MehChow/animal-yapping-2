import { UploadData } from "@/components/admin/AddVideoDialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

export const useUploadVideo = () => {
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
    isOpen,
    setIsOpen,
    currentStep,
    setCurrentStep,
    showSuccessDialog,
    setShowSuccessDialog,
    publishedVideoId,
    setPublishedVideoId,
    uploadData,
    setUploadData,
    handleOpenChange,
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
