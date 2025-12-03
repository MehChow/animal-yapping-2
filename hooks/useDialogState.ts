"use client";

import { useCallback, useState } from "react";

type UseDialogStateProps = {
  hasUnsavedChanges: boolean;
  onDiscardChanges: () => void;
};

export const useDialogState = ({
  hasUnsavedChanges,
  onDiscardChanges,
}: UseDialogStateProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
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
    [hasUnsavedChanges, onDiscardChanges]
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
