"use client";

import { useCallback, useState } from "react";

type UseDialogStateProps = {
  hasUnsavedChanges: boolean;
  isSaving?: boolean;
  onDiscardChanges: () => void;
};

export const useDialogState = ({
  hasUnsavedChanges,
  isSaving = false,
  onDiscardChanges,
}: UseDialogStateProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        if (isSaving) {
          // Prevent closing while saving to avoid inconsistent states
          setIsDialogOpen(true);
          return;
        }

        if (hasUnsavedChanges) {
          setIsDiscardDialogOpen(true);
          return;
        }
        setIsDialogOpen(false);
        onDiscardChanges();
        return;
      }
      setIsDialogOpen(true);
    },
    [hasUnsavedChanges, isSaving, onDiscardChanges]
  );

  const handleDiscardChanges = useCallback(() => {
    onDiscardChanges();
    setIsDiscardDialogOpen(false);
    setIsDialogOpen(false);
  }, [onDiscardChanges]);

  const handleCancelDiscard = useCallback(() => {
    setIsDiscardDialogOpen(false);
    setIsDialogOpen(true);
  }, []);

  const forceCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setIsDiscardDialogOpen(false);
    onDiscardChanges();
  }, [onDiscardChanges]);

  return {
    isDialogOpen,
    isDiscardDialogOpen,
    handleDialogOpenChange,
    handleDiscardChanges,
    handleCancelDiscard,
    forceCloseDialog,
  };
};
