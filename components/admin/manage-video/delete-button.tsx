"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

export const DeleteButton = () => {
  return (
    <Button
      variant="destructive"
      size="icon-sm"
      className="rounded-full cursor-pointer bg-red-500 hover:bg-red-600 border-0"
    >
      <Trash className="size-4" />
    </Button>
  );
};
