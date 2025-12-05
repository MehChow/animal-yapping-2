"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProfileImage } from "./useProfileImage";
import { useDialogState } from "./useDialogState";
import { useProfileForm } from "./useProfileForm";

type UseProfileSettingsDialogProps = {
  initialName: string;
  initialImage?: string | null;
  userId: string;
};

export const useProfileSettingsDialog = ({
  initialName,
  initialImage,
  userId,
}: UseProfileSettingsDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedDisplayName, setSavedDisplayName] = useState(initialName);

  // Use the new consolidated profile image hook
  const {
    savedUrl: savedIconUrl,
    previewUrl,
    croppedDataUrl,
    imageSrc,
    crop,
    isUploading,
    isCropping,
    imgRef,
    fileInputRef,
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
  } = useProfileImage({
    initialImage,
    onImageChange: (newUrl) => {
      // Update form when image changes
      setValue("customIconUrl", newUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
  });

  // Form state change handlers
  const onFormStateChange = useCallback(
    ({
      savedDisplayName: newDisplayName,
      savedIconUrl: newIconUrl,
      previewUrl: newPreviewUrl,
    }: {
      savedDisplayName: string;
      savedIconUrl: string | null | undefined;
      previewUrl: string | null | undefined;
    }) => {
      setSavedDisplayName(newDisplayName);
      // Image state is managed by useProfileImage hook
    },
    []
  );

  const onFormReset = useCallback(() => {
    resetToSaved();
  }, [resetToSaved]);

  // Form submission callbacks
  const onSubmitStart = useCallback(() => setIsSaving(true), []);
  const onSubmitEnd = useCallback(() => setIsSaving(false), []);

  const getPendingIconData = useCallback(
    () => croppedDataUrl,
    [croppedDataUrl]
  );
  const getIsUploading = useCallback(() => isUploading, [isUploading]);

  // Ref to hold the forceCloseDialog function
  const forceCloseDialogRef = useRef<() => void>(() => {});

  const { register, errors, isDirty, setValue, resetForm, onSubmit } =
    useProfileForm({
      initialName,
      initialImage: initialImage ?? null,
      userId,
      onFormStateChange,
      onFormReset,
      onSubmitStart,
      onSubmitEnd,
      onSubmitSuccess: () => forceCloseDialogRef.current(),
      getPendingIconData,
      getIsUploading,
      uploadIcon,
    });

  // Calculate unsaved changes - now much simpler
  const hasUnsavedChanges = useMemo(() => {
    return isDirty || isCropping || !!croppedDataUrl;
  }, [isDirty, isCropping, croppedDataUrl]);

  // Reset form state
  const resetFormState = useCallback(() => {
    resetForm({
      displayName: savedDisplayName,
      customIconUrl: savedIconUrl,
    });
    resetToSaved();
  }, [resetForm, savedDisplayName, savedIconUrl, resetToSaved]);

  // Dialog state management
  const {
    isDialogOpen,
    isDiscardDialogOpen,
    handleDialogOpenChange,
    handleDiscardChanges,
    handleCancelDiscard,
    forceCloseDialog,
  } = useDialogState({
    hasUnsavedChanges,
    isSaving,
    onDiscardChanges: resetFormState,
  });

  // Update the ref with the actual function
  forceCloseDialogRef.current = forceCloseDialog;

  // Remove icon handler
  const handleRemoveIcon = useCallback(() => {
    removeImage();
    setValue("customIconUrl", null, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [removeImage, setValue]);

  // Reset state when dialog closes and there are no unsaved changes
  useEffect(() => {
    if (isDialogOpen || isDirty || isCropping) {
      return;
    }

    setSavedDisplayName(initialName);
    resetForm({
      displayName: initialName,
      customIconUrl: initialImage ?? null,
    });
    resetToSaved();
  }, [
    initialImage,
    initialName,
    isDialogOpen,
    isDirty,
    isCropping,
    resetForm,
    resetToSaved,
  ]);

  return {
    // Dialog state
    isDialogOpen,
    isDiscardDialogOpen,

    // Loading states
    isUploading,
    isSaving,

    // Form state
    hasUnsavedChanges,
    previewUrl,
    errors,

    // Image state
    imageSrc,
    crop,

    // Form controls
    register,

    // Refs
    fileInputRef,
    imgRef,

    // Handlers
    handleDialogOpenChange,
    handleDiscardChanges,
    handleCancelDiscard,
    handleFileButtonClick,
    handleFileChange,
    handleImageLoad,
    handleCropComplete,
    handleApplyCrop,
    handleCancelCrop,
    handleRemoveIcon,
    onSubmit,

    // Crop controls
    setCrop,
  };
};
