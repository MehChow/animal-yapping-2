"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVideoSort } from "@/hooks/useVideoSort";
import { VideoSortValue } from "@/types/video-sort";
import { Label } from "@/components/ui/label";

type ManageVideoSortProps = {
  initialValue: VideoSortValue;
};

export const ManageVideoSort = ({ initialValue }: ManageVideoSortProps) => {
  const { selectedSort, handleSortChange } = useVideoSort(initialValue);

  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor="manage-video-sort"
        className="text-white text-sm font-medium"
        aria-label="Sort videos label"
      >
        Filter:
      </Label>

      <Select value={selectedSort} onValueChange={handleSortChange}>
        <SelectTrigger
          id="manage-video-sort"
          aria-label="Sort videos"
          className="w-44 bg-transparent text-white border border-white/20 transition-all duration-300 
            focus-visible:ring-0 focus-visible:border-white/20"
        >
          <SelectValue placeholder="Select sorting" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
          <SelectItem value="latest">Latest</SelectItem>
          <SelectItem value="earliest">Earliest</SelectItem>
          <SelectItem value="liked">Most liked</SelectItem>
          <SelectItem value="viewed">Most viewed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
