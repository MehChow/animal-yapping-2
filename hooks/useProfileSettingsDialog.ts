"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { USER_ICON_CONSTRAINTS } from "@/lib/constants";
import {
  readFileAsDataUrl,
  getRoundedCroppedImage,
} from "@/lib/client-image-utils";
import { dataUrlToBlob } from "@/lib/client-thumbnail-utils";
import { updateProfileSettings } from "@/app/actions/profile";
import {
  profileSettingsSchema,
  type ProfileSettingsForm,
} from "@/lib/validations/user";
import type { Crop } from "react-image-crop";

type UseProfileSettingsDialogProps = {
  initialName: string;
  initialImage?: string | null;
};

export const useProfileSettingsDialog = ({
  initialName,
  initialImage,
}: UseProfileSettingsDialogProps) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [savedDisplayName, setSavedDisplayName] = useState(initialName);
  const [savedIconUrl, setSavedIconUrl] = useState<string | null>(
    initialImage ?? null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImage ?? null
  );
  const [pendingIconDataUrl, setPendingIconDataUrl] = useState<string | null>(
    null
  );
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileSettingsForm>({
    resolver: zodResolver(profileSettingsSchema),
    mode: "onChange",
    defaultValues: {
      displayName: initialName,
      customIconUrl: initialImage ?? null,
    },
  });

  const hasUnsavedChanges = useMemo(() => {
    return isDirty || !!imageSrc || pendingIconDataUrl !== null;
  }, [imageSrc, isDirty, pendingIconDataUrl]);

  const resetFormState = useCallback(() => {
    reset({
      displayName: savedDisplayName,
      customIconUrl: savedIconUrl,
    });
    setImageSrc(null);
    setPreviewUrl(savedIconUrl);
    setPendingIconDataUrl(null);
    setCrop(undefined);
    setCompletedCrop(null);
  }, [reset, savedDisplayName, savedIconUrl]);

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (hasUnsavedChanges) {
        setIsDiscardDialogOpen(true);
        return;
      }
      setIsDialogOpen(false);
      resetFormState();
      return;
    }
    setIsDialogOpen(true);
  };

  const handleDiscardChanges = () => {
    resetFormState();
    setIsDiscardDialogOpen(false);
    setIsDialogOpen(false);
  };

  const handleCancelDiscard = () => {
    setIsDiscardDialogOpen(false);
    setIsDialogOpen(true);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
    if (
      !USER_ICON_CONSTRAINTS.ALLOWED_TYPES.includes(normalizedType as never)
    ) {
      toast.error("Invalid file type. Use JPG, PNG, HEIC, or WebP.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageSrc(dataUrl);
      setPreviewUrl(dataUrl);
      setPendingIconDataUrl(null);
      setCrop(undefined);
      setCompletedCrop(null);
    } catch (error) {
      console.error("Failed to read file:", error);
      toast.error("Unable to load image");
    }
  };

  const handleCropComplete = (pixelCrop: Crop | null) => {
    setCompletedCrop(pixelCrop);
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
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
    setCrop(centeredCrop);
    setCompletedCrop(centeredCrop);
  };

  const handleApplyCrop = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error("Select an area to crop");
      return;
    }

    try {
      const rounded = await getRoundedCroppedImage(
        imgRef.current,
        completedCrop
      );
      setPendingIconDataUrl(rounded);
      setPreviewUrl(rounded);
      toast.success("Crop applied");
    } catch (error) {
      console.error("Failed to crop image:", error);
      toast.error("Unable to crop image");
    }
  };

  const handleRemoveIcon = () => {
    setImageSrc(null);
    setPendingIconDataUrl(null);
    setPreviewUrl(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setValue("customIconUrl", null, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const uploadIcon = async (dataUrl: string): Promise<string | null> => {
    const blob = await dataUrlToBlob(dataUrl);
    const file = new File([blob], "profile-icon.png", { type: blob.type });
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
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      let finalIconUrl = values.customIconUrl ?? null;

      if (pendingIconDataUrl) {
        const uploadedUrl = await uploadIcon(pendingIconDataUrl);
        finalIconUrl = uploadedUrl ?? null;
      }

      setIsSaving(true);
      const payload: ProfileSettingsForm = {
        displayName: values.displayName,
        customIconUrl: finalIconUrl,
      };

      const result = await updateProfileSettings(payload);
      if (!result.success) {
        throw new Error(result.error || "Failed to save settings");
      }

      toast.success("Profile updated");
      setSavedDisplayName(payload.displayName);
      setSavedIconUrl(payload.customIconUrl ?? null);
      reset({
        displayName: payload.displayName,
        customIconUrl: payload.customIconUrl ?? null,
      });
      setImageSrc(null);
      setPendingIconDataUrl(null);
      setPreviewUrl(payload.customIconUrl ?? null);
      setCrop(undefined);
      setCompletedCrop(null);
      setIsDialogOpen(false);
      setIsDiscardDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  });

  useEffect(() => {
    if (isDialogOpen || isDirty) {
      return;
    }
    setSavedDisplayName(initialName);
    setSavedIconUrl(initialImage ?? null);
    setPreviewUrl(initialImage ?? null);
    reset({
      displayName: initialName,
      customIconUrl: initialImage ?? null,
    });
  }, [initialImage, initialName, isDialogOpen, isDirty, reset]);

  return {
    isDialogOpen,
    isDiscardDialogOpen,
    isUploading,
    isSaving,
    hasUnsavedChanges,
    imageSrc,
    previewUrl,
    crop,
    setCrop,
    handleImageLoad,
    errors,
    register,
    fileInputRef,
    imgRef,
    handleDialogOpenChange,
    handleDiscardChanges,
    handleCancelDiscard,
    handleFileButtonClick,
    handleFileChange,
    handleCropComplete,
    handleApplyCrop,
    handleRemoveIcon,
    onSubmit,
  };
};

