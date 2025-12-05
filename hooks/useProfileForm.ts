"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  profileSettingsSchema,
  type ProfileSettingsForm,
} from "@/lib/validations/user";
import { updateProfileSettings } from "@/app/actions/profile";
import { tryCatch } from "@/lib/try-catch";

type UseProfileFormProps = {
  initialName: string;
  initialImage: string | null;
  userId: string;
  onFormStateChange: (data: {
    savedDisplayName: string;
    savedIconUrl: string | null | undefined;
    previewUrl: string | null | undefined;
  }) => void;
  onFormReset: () => void;
  onSubmitStart: () => void;
  onSubmitEnd: () => void;
  onSubmitSuccess: () => void;
  getPendingIconData: () => string | null;
  getIsUploading: () => boolean;
  uploadIcon: (dataUrl: string) => Promise<string | null>;
};

export const useProfileForm = ({
  initialName,
  initialImage,
  userId,
  onFormStateChange,
  onFormReset,
  onSubmitStart,
  onSubmitEnd,
  onSubmitSuccess,
  getPendingIconData,
  getIsUploading,
  uploadIcon,
}: UseProfileFormProps) => {
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

  const resetForm = useCallback(
    (data: { displayName: string; customIconUrl: string | null }) => {
      reset(data);
      onFormReset();
    },
    [reset, onFormReset]
  );

  const onSubmit = handleSubmit(async (values) => {
    onSubmitStart();

    // Optimistic updates - immediately update UI
    const optimisticDisplayName = values.displayName;
    const optimisticIconUrl = values.customIconUrl ?? null;

    // Apply optimistic updates immediately
    onFormStateChange({
      savedDisplayName: optimisticDisplayName,
      savedIconUrl: optimisticIconUrl,
      previewUrl: optimisticIconUrl,
    });

    // Handle image upload with tryCatch
    let finalIconUrl = optimisticIconUrl;
    const pendingIconDataUrl = getPendingIconData();

    if (pendingIconDataUrl) {
      const { data: uploadedUrl, error: uploadError } = await tryCatch(
        uploadIcon(pendingIconDataUrl)
      );

      if (uploadError) {
        console.error("Failed to upload image:", uploadError);
        toast.error("Failed to upload image");

        // Rollback optimistic updates on error
        onFormStateChange({
          savedDisplayName: initialName,
          savedIconUrl: initialImage ?? null,
          previewUrl: initialImage ?? null,
        });

        resetForm({
          displayName: initialName,
          customIconUrl: initialImage ?? null,
        });

        onSubmitEnd();
        return;
      }

      finalIconUrl = uploadedUrl ?? optimisticIconUrl;
    }

    const payload: ProfileSettingsForm = {
      displayName: optimisticDisplayName,
      customIconUrl: finalIconUrl,
    };

    // Handle profile update with tryCatch
    const { data: result, error: updateError } = await tryCatch(
      updateProfileSettings(payload)
    );

    if (updateError || !result?.success) {
      console.error("Failed to save profile:", updateError);
      const errorMessage =
        updateError?.message || result?.error || "Save failed";
      toast.error(errorMessage);

      // Rollback optimistic updates on error
      onFormStateChange({
        savedDisplayName: initialName,
        savedIconUrl: initialImage ?? null,
        previewUrl: initialImage ?? null,
      });

      resetForm({
        displayName: initialName,
        customIconUrl: initialImage ?? null,
      });
    } else {
      toast.success("Profile updated");
      onFormStateChange({
        savedDisplayName: payload.displayName,
        savedIconUrl: payload.customIconUrl ?? null,
        previewUrl: payload.customIconUrl ?? null,
      });

      resetForm({
        displayName: payload.displayName,
        customIconUrl: payload.customIconUrl ?? null,
      });

      // Dispatch custom event to notify other components about profile update
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: {
            userId,
            displayName: payload.displayName,
            imageUrl: payload.customIconUrl,
          },
        })
      );

      onSubmitSuccess();
    }

    onSubmitEnd();
  });

  return {
    register,
    errors,
    isDirty,
    setValue,
    resetForm,
    onSubmit,
  };
};
