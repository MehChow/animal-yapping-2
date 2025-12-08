"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export const EditButton = () => {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      className="rounded-full cursor-pointer bg-white/10 hover:bg-white/20 border-0"
    >
      <Pencil className="size-4 text-white" />
    </Button>
  );
};
