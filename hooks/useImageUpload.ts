"use client";

import React, { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { USER_ICON_CONSTRAINTS } from "@/lib/constants";
import { readFileAsDataUrl } from "@/lib/client-image-utils";
import { dataUrlToBlob } from "@/lib/client-thumbnail-utils";

type UseImageUploadProps = {
  onFileSelected: (dataUrl: string) => void;
  onUploadComplete: (uploadedUrl: string | null) => void;
};

export const useImageUpload = ({
  onFileSelected,
  onUploadComplete,
}: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) {
        return;
      }

      if (file.size > USER_ICON_CONSTRAINTS.MAX_SIZE) {
        toast.error("Icon must be less than 5MB");
        return;
      }

      const normalizedType = file.type.toLowerCase();
      if (!USER_ICON_CONSTRAINTS.ALLOWED_TYPES.includes(normalizedType as never)) {
        toast.error("Invalid file type. Use JPG, PNG, HEIC, or WebP.");
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        onFileSelected(dataUrl);
      } catch (error) {
        console.error("Failed to read file:", error);
        toast.error("Unable to load image");
      }
    },
    [onFileSelected]
  );

  const uploadIcon = useCallback(
    async (dataUrl: string): Promise<string | null> => {
      const blob = await dataUrlToBlob(dataUrl);
      const file = new File([blob], "profile-icon.jpg", { type: blob.type });
      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true);
      try {
        const response = await fetch("/api/user-icon-upload", {
          method: "POST",
          body: formData,
        });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || "Upload failed");
        }
        return (json.publicUrl || json.objectKey) as string | null;
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete]
  );

  return {
    isUploading,
    fileInputRef,
    handleFileButtonClick,
    handleFileChange,
    uploadIcon,
  };
};
