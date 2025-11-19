import { Video } from "@/types/video";
import { Badge } from "../ui/badge";
import { formatViewCount } from "@/lib/format-utils";

type MetadataProps = {
  data: Video;
};

export const Metadata = ({ data }: MetadataProps) => {
  return (
    <div className="space-y-2">
      {/* Title */}
      <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 hover:text-purple-300 transition-colors">
        {data.title}
      </h3>

      {/* View Count */}
      <p className="text-gray-400 text-xs">
        {formatViewCount(data.viewCount)} views
      </p>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.tags.slice(0, 3).map((tag, tagIndex) => (
            <Badge
              key={tagIndex}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
            >
              {tag}
            </Badge>
          ))}
          {data.tags.length > 3 && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 border-gray-500/30"
            >
              +{data.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
