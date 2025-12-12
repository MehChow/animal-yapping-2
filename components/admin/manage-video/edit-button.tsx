"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

type EditButtonProps = {
  videoId: string;
};

export const EditButton = ({ videoId }: EditButtonProps) => {
  return (
    <Link href={`/admin/manage-video/${videoId}`}>
      <Button
        variant="outline"
        size="icon-sm"
        className="rounded-full cursor-pointer bg-white/10 hover:bg-white/20 border-0"
        aria-label="Edit video"
      >
        <Pencil className="size-4 text-white" />
      </Button>
    </Link>
  );
};
