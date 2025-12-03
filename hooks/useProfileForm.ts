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

type UseProfileFormProps = {
  initialName: string;
  initialImage: string | null;
  onFormStateChange: (data: {
    savedDisplayName: string;
    savedIconUrl: string | null | undefined;
    previewUrl: string | null | undefined;
  }) => void;
  onFormReset: (data: {
    displayName: string;
    customIconUrl: string | null;
  }) => void;
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
      onFormReset(data);
    },
    [reset, onFormReset]
  );

  const onSubmit = handleSubmit(async (values) => {
    onSubmitStart();

    try {
      let finalIconUrl = values.customIconUrl ?? null;

      const pendingIconDataUrl = getPendingIconData();
      if (pendingIconDataUrl) {
        const uploadedUrl = await uploadIcon(pendingIconDataUrl);
        finalIconUrl = uploadedUrl ?? null;
      }

      const payload: ProfileSettingsForm = {
        displayName: values.displayName,
        customIconUrl: finalIconUrl,
      };

      const result = await updateProfileSettings(payload);
      if (!result.success) {
        throw new Error(result.error || "Failed to save settings");
      }

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
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: {
          displayName: payload.displayName,
          imageUrl: payload.customIconUrl,
        }
      }));

      onSubmitSuccess();
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      onSubmitEnd();
    }
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
