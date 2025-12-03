"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useImageCrop } from "./useImageCrop";
import { useImageUpload } from "./useImageUpload";
import { useDialogState } from "./useDialogState";
import { useProfileForm } from "./useProfileForm";

type UseProfileSettingsDialogProps = {
  initialName: string;
  initialImage?: string | null;
};

export const useProfileSettingsDialog = ({
  initialName,
  initialImage,
}: UseProfileSettingsDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
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

  const {
    imageSrc,
    crop,
    setCrop,
    handleCropComplete,
    handleImageLoad,
    handleApplyCrop,
    handleCancelCrop,
    startCropping,
    imgRef,
  } = useImageCrop({
    onCropApplied: (croppedDataUrl: string) => {
      setPendingIconDataUrl(croppedDataUrl);
      setPreviewUrl(croppedDataUrl);
      toast.success("Crop applied");
    },
  });

  const {
    isUploading,
    fileInputRef,
    handleFileButtonClick,
    handleFileChange,
    uploadIcon,
  } = useImageUpload({
    onFileSelected: (dataUrl: string) => {
      startCropping(dataUrl);
      setPreviewUrl(dataUrl);
      setPendingIconDataUrl(null);
    },
    onUploadComplete: (uploadedUrl: string | null) => {
      // Handle upload completion if needed
    },
  });

  const onFormStateChange = useCallback(
    ({
      savedDisplayName,
      savedIconUrl,
      previewUrl,
    }: {
      savedDisplayName: string;
      savedIconUrl: string | null | undefined;
      previewUrl: string | null | undefined;
    }) => {
      setSavedDisplayName(savedDisplayName);
      setSavedIconUrl(savedIconUrl ?? null);
      setPreviewUrl(previewUrl ?? null);
      setPendingIconDataUrl(null);
      handleCancelCrop();
    },
    [handleCancelCrop]
  );

  const onFormReset = useCallback(
    ({
      displayName,
      customIconUrl,
    }: {
      displayName: string;
      customIconUrl: string | null;
    }) => {
      setPreviewUrl(customIconUrl);
      setPendingIconDataUrl(null);
      handleCancelCrop();
    },
    [handleCancelCrop]
  );

  const onSubmitStart = useCallback(() => setIsSaving(true), []);
  const onSubmitEnd = useCallback(() => setIsSaving(false), []);
  const getPendingIconData = useCallback(
    () => pendingIconDataUrl,
    [pendingIconDataUrl]
  );
  const getIsUploading = useCallback(() => isUploading, [isUploading]);

  // Placeholder for onSubmitSuccess, will be set after useDialogState
  const onSubmitSuccessRef = useRef<() => void>(() => {});

  const { register, errors, isDirty, setValue, resetForm, onSubmit } =
    useProfileForm({
      initialName,
      initialImage: initialImage ?? null,
      onFormStateChange,
      onFormReset,
      onSubmitStart,
      onSubmitEnd,
      onSubmitSuccess: () => onSubmitSuccessRef.current(),
      getPendingIconData,
      getIsUploading,
      uploadIcon,
    });

  const hasUnsavedChanges = useMemo(() => {
    return isDirty || !!imageSrc || pendingIconDataUrl !== null;
  }, [imageSrc, isDirty, pendingIconDataUrl]);

  const resetFormState = useCallback(() => {
    resetForm({
      displayName: savedDisplayName,
      customIconUrl: savedIconUrl,
    });
  }, [resetForm, savedDisplayName, savedIconUrl]);

  const {
    isDialogOpen,
    isDiscardDialogOpen,
    handleDialogOpenChange,
    handleDiscardChanges,
    handleCancelDiscard,
    forceCloseDialog,
  } = useDialogState({
    hasUnsavedChanges,
    onDiscardChanges: resetFormState,
  });

  // Set the onSubmitSuccess callback after useDialogState is initialized
  onSubmitSuccessRef.current = () => forceCloseDialog();

  const handleRemoveIcon = () => {
    handleCancelCrop(); // Cancel any ongoing crop operation
    setPendingIconDataUrl(null);
    setPreviewUrl(null);
    setValue("customIconUrl", null, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (isDialogOpen || isDirty) {
      return;
    }
    setSavedDisplayName(initialName);
    setSavedIconUrl(initialImage ?? null);
    setPreviewUrl(initialImage ?? null);
    resetForm({
      displayName: initialName,
      customIconUrl: initialImage ?? null,
    });
  }, [initialImage, initialName, isDialogOpen, isDirty, resetForm]);

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
    handleCancelCrop,
    handleRemoveIcon,
    onSubmit,
  };
};
