import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DiscardProfileChangesDialogProps {
  isDiscardDialogOpen: boolean;
  handleCancelDiscard: () => void;
  handleDiscardChanges: () => void;
}

export const DiscardProfileChangesDialog = ({
  isDiscardDialogOpen,
  handleCancelDiscard,
  handleDiscardChanges,
}: DiscardProfileChangesDialogProps) => {
  return (
    <AlertDialog open={isDiscardDialogOpen}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard profile changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved updates. Closing now will remove them permanently.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancelDiscard}
            className="cursor-pointer border-0 bg-zinc-800 hover:bg-white/10"
          >
            Keep editing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDiscardChanges}
            className="cursor-pointer bg-red-600 hover:bg-red-700"
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
