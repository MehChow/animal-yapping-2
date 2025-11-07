"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  videoMetadataSchema,
  type VideoMetadataForm,
} from "@/lib/validations/video";

type VideoMetadataProps = {
  onSubmit: (data: VideoMetadataForm) => void;
  onBack: () => void;
  initialData?: VideoMetadataForm;
};

export const VideoMetadata: React.FC<VideoMetadataProps> = ({
  onSubmit,
  onBack,
  initialData,
}) => {
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<VideoMetadataForm>({
    resolver: zodResolver(videoMetadataSchema),
    mode: "onChange",
    defaultValues: initialData || {
      title: "",
      description: "",
      tags: [],
    },
  });

  const title = watch("title");
  const description = watch("description");
  const tags = watch("tags");

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (tags.length >= 10) {
        toast.error("Maximum 10 tags allowed");
        return;
      }
      setValue("tags", [...tags, trimmedTag], { shouldValidate: true });
      setTagInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const onFormSubmit = (data: VideoMetadataForm) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">
          Video Title *
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Enter video title..."
          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
          maxLength={100}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-red-400">{errors.title.message}</p>
        )}
        <p className="text-xs text-white/40">
          {title?.length || 0}/100 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter video description..."
          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 min-h-[120px] resize-none"
          maxLength={500}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description.message}</p>
        )}
        <p className="text-xs text-white/40">
          {description?.length || 0}/500 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags" className="text-white">
          Tags (Optional, max 10)
        </Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag and press Enter..."
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
          />
          <Button
            type="button"
            onClick={handleAddTag}
            disabled={tags.length >= 10}
            className="bg-white/10 text-white hover:bg-white/20 border border-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </Button>
        </div>
        {errors.tags && (
          <p className="text-xs text-red-400">{errors.tags.message}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 bg-white/10 text-white px-3 py-1 rounded-full text-sm border border-white/20"
              >
                {tag}
                <Button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  variant="ghost"
                  size="icon-sm"
                  className="h-4 w-4 p-0 hover:text-white/60 hover:bg-transparent cursor-pointer"
                >
                  <XIcon className="size-3" />
                </Button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-white/40">{tags.length}/10 tags</p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="text-white cursor-pointer"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={!isValid}
          className="bg-white/10 text-white hover:bg-white/20 border border-white/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </form>
  );
};
