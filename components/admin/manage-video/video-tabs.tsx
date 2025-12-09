"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideoType } from "@/hooks/useVideoType";
import { VideoType } from "@/utils/video-utils";

type ManageVideoTabsProps = {
  initialType: VideoType;
};

export const ManageVideoTabs = ({ initialType }: ManageVideoTabsProps) => {
  const { selectedType, handleTypeChange } = useVideoType(initialType);
  const indicatorTranslate =
    selectedType === "Shorts" ? "translate-x-full" : "translate-x-0";

  return (
    <Tabs
      value={selectedType}
      onValueChange={(value: string) => handleTypeChange(value)}
      className="w-full"
    >
      <TabsList className="relative bg-zinc-900 border border-zinc-800 text-white overflow-hidden">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 h-full w-1/2 rounded-md border border-white/15 bg-white/10 transition-transform duration-300 ease-out ${indicatorTranslate}`}
        />
        <TabsTrigger
          value="Normal"
          className="relative z-10 data-[state=active]:text-white data-[state=inactive]:text-white/50 data-[state=active]:bg-transparent! data-[state=active]:shadow-none"
          aria-label="Show normal videos"
        >
          Normal
        </TabsTrigger>
        <TabsTrigger
          value="Shorts"
          className="relative z-10 data-[state=active]:text-white data-[state=inactive]:text-white/50 data-[state=active]:bg-transparent! data-[state=active]:shadow-none"
          aria-label="Show shorts videos"
        >
          Shorts
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
