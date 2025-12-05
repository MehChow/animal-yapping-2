"use client";

import React, { useCallback, useReducer, useRef } from "react";
import { toast } from "sonner";
import { getRoundedCroppedImage } from "@/lib/client-image-utils";
import { readFileAsDataUrl } from "@/lib/client-image-utils";
import { dataUrlToBlob } from "@/lib/client-thumbnail-utils";
import { USER_ICON_CONSTRAINTS } from "@/lib/constants";
import { tryCatch } from "@/lib/try-catch";
import type { Crop } from "react-image-crop";

// State management with useReducer
type ProfileImageState = {
  // Current saved state
  savedUrl: string | null;

  // Preview/working state
  previewUrl: string | null;
  croppedDataUrl: string | null;

  // Crop state
  imageSrc: string | null;
  crop: Crop | undefined;
  completedCrop: Crop | null;

  // Loading states
  isUploading: boolean;
  isCropping: boolean;

  // Refs
  imgRef: React.RefObject<HTMLImageElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
};

type ProfileImageAction =
  | { type: "SET_SAVED_URL"; payload: string | null }
  | { type: "SET_PREVIEW_URL"; payload: string | null }
  | { type: "SET_CROPPED_DATA"; payload: string | null }
  | { type: "START_CROPPING"; payload: string }
  | { type: "SET_CROP"; payload: Crop | undefined }
  | { type: "SET_COMPLETED_CROP"; payload: Crop | null }
  | { type: "CANCEL_CROP" }
  | { type: "START_UPLOAD" }
  | { type: "END_UPLOAD" }
  | { type: "RESET_IMAGE_STATE" };

const initialState: ProfileImageState = {
  savedUrl: null,
  previewUrl: null,
  croppedDataUrl: null,
  imageSrc: null,
  crop: undefined,
  completedCrop: null,
  isUploading: false,
  isCropping: false,
  imgRef: { current: null },
  fileInputRef: { current: null },
};

function profileImageReducer(
  state: ProfileImageState,
  action: ProfileImageAction
): ProfileImageState {
  switch (action.type) {
    case "SET_SAVED_URL":
      return { ...state, savedUrl: action.payload };

    case "SET_PREVIEW_URL":
      return { ...state, previewUrl: action.payload };

    case "SET_CROPPED_DATA":
      return { ...state, croppedDataUrl: action.payload };

    case "START_CROPPING":
      return {
        ...state,
        imageSrc: action.payload,
        crop: undefined,
        completedCrop: null,
        isCropping: true,
      };

    case "SET_CROP":
      return { ...state, crop: action.payload };

    case "SET_COMPLETED_CROP":
      return { ...state, completedCrop: action.payload };

    case "CANCEL_CROP":
      return {
        ...state,
        imageSrc: null,
        crop: undefined,
        completedCrop: null,
        isCropping: false,
      };

    case "START_UPLOAD":
      return { ...state, isUploading: true };

    case "END_UPLOAD":
      return { ...state, isUploading: false };

    case "RESET_IMAGE_STATE":
      return {
        ...initialState,
        savedUrl: state.savedUrl,
        previewUrl: state.savedUrl, // Reset preview to match saved state
        imgRef: state.imgRef,
        fileInputRef: state.fileInputRef,
      };

    default:
      return state;
  }
}

type UseProfileImageProps = {
  initialImage?: string | null;
  onImageChange?: (imageUrl: string | null) => void;
};

export const useProfileImage = ({
  initialImage,
  onImageChange,
}: UseProfileImageProps = {}) => {
  const [state, dispatch] = useReducer(profileImageReducer, {
    ...initialState,
    savedUrl: initialImage ?? null,
    previewUrl: initialImage ?? null,
  });

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update refs in state
  React.useEffect(() => {
    dispatch({ type: "SET_SAVED_URL", payload: initialImage ?? null });
    dispatch({ type: "SET_PREVIEW_URL", payload: initialImage ?? null });
  }, [initialImage]);

  // File handling
  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) return;

      // Validation
      if (file.size > USER_ICON_CONSTRAINTS.MAX_SIZE) {
        toast.error("Icon must be less than 5MB");
        return;
      }

      const normalizedType = file.type.toLowerCase();
      if (
        !USER_ICON_CONSTRAINTS.ALLOWED_TYPES.includes(normalizedType as never)
      ) {
        toast.error("Invalid file type. Use JPG, PNG, HEIC, or WebP.");
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        dispatch({ type: "START_CROPPING", payload: dataUrl });
        dispatch({ type: "SET_PREVIEW_URL", payload: dataUrl });
      } catch (error) {
        console.error("Failed to read file:", error);
        toast.error("Unable to load image");
      }
    },
    []
  );

  // Crop handling
  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const imageElement = event.currentTarget;
      imgRef.current = imageElement;

      const displayWidth = imageElement.width || imageElement.naturalWidth;
      const displayHeight = imageElement.height || imageElement.naturalHeight;
      const size = Math.min(displayWidth, displayHeight) * 0.8;

      const centeredCrop: Crop = {
        unit: "px",
        width: size,
        height: size,
        x: (displayWidth - size) / 2,
        y: (displayHeight - size) / 2,
      };

      dispatch({ type: "SET_CROP", payload: centeredCrop });
      dispatch({ type: "SET_COMPLETED_CROP", payload: centeredCrop });
    },
    []
  );

  const handleCropComplete = useCallback((pixelCrop: Crop | null) => {
    dispatch({ type: "SET_COMPLETED_CROP", payload: pixelCrop });
  }, []);

  const handleApplyCrop = useCallback(async () => {
    if (!imgRef.current || !state.completedCrop) {
      throw new Error("Select an area to crop");
    }

    try {
      const rounded = await getRoundedCroppedImage(
        imgRef.current,
        state.completedCrop
      );

      dispatch({ type: "SET_CROPPED_DATA", payload: rounded });
      dispatch({ type: "SET_PREVIEW_URL", payload: rounded });
      dispatch({ type: "CANCEL_CROP" });

      toast.success("Crop applied");
    } catch (error) {
      console.error("Failed to crop image:", error);
      throw new Error("Unable to crop image");
    }
  }, [state.completedCrop]);

  const handleCancelCrop = useCallback(() => {
    dispatch({ type: "CANCEL_CROP" });
  }, []);

  // Upload functionality
  const uploadIcon = useCallback(
    async (dataUrl: string): Promise<string | null> => {
      const blob = await dataUrlToBlob(dataUrl);
      const file = new File([blob], "profile-icon.jpg", { type: blob.type });
      const formData = new FormData();
      formData.append("file", file);

      dispatch({ type: "START_UPLOAD" });

      try {
        // Use tryCatch for the fetch operation
        const { data: response, error: fetchError } = await tryCatch(
          fetch("/api/user-icon-upload", {
            method: "POST",
            body: formData,
          })
        );

        if (fetchError) {
          throw new Error("Upload request failed");
        }

        // Use tryCatch for JSON parsing
        const { data: json, error: parseError } = await tryCatch(
          response.json()
        );

        if (parseError) {
          throw new Error("Upload response parsing failed");
        }

        if (!response.ok || !json?.success) {
          throw new Error(json?.error || "Upload failed");
        }

        const cacheBustedKey =
          (json.cacheBustedKey as string | null) ??
          (json.objectKey as string | null);
        const previewUrl =
          (json.publicUrl as string | null) ??
          (json.cacheBustedKey as string | null) ??
          (json.objectKey as string | null);

        dispatch({ type: "SET_SAVED_URL", payload: previewUrl });
        onImageChange?.(cacheBustedKey);

        return cacheBustedKey;
      } finally {
        dispatch({ type: "END_UPLOAD" });
      }
    },
    [onImageChange]
  );

  // Remove image
  const removeImage = useCallback(() => {
    dispatch({ type: "SET_PREVIEW_URL", payload: null });
    dispatch({ type: "SET_CROPPED_DATA", payload: null });
    dispatch({ type: "CANCEL_CROP" });
    onImageChange?.(null);
  }, [onImageChange]);

  // Reset to saved state
  const resetToSaved = useCallback(() => {
    dispatch({ type: "RESET_IMAGE_STATE" });
  }, []);

  // Manual crop setter for external control
  const setCrop = useCallback((crop: Crop | undefined) => {
    dispatch({ type: "SET_CROP", payload: crop });
  }, []);

  return {
    // State
    savedUrl: state.savedUrl,
    previewUrl: state.previewUrl,
    croppedDataUrl: state.croppedDataUrl,
    imageSrc: state.imageSrc,
    crop: state.crop,
    isUploading: state.isUploading,
    isCropping: state.isCropping,

    // Refs
    imgRef,
    fileInputRef,

    // Actions
    handleFileButtonClick,
    handleFileChange,
    handleImageLoad,
    handleCropComplete,
    handleApplyCrop,
    handleCancelCrop,
    uploadIcon,
    removeImage,
    resetToSaved,
    setCrop,
  };
};
