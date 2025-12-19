import { searchVideos } from "@/lib/data/video";
import { Video } from "@/types/video";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchIcon } from "lucide-react";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  // Fetch initial search results (first page)
  const searchResult = await searchVideos(query, 10);

  if (!searchResult.success) {
    return (
      <div className="min-h-dvh pt-20 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-red-400 text-lg">
              Error: {searchResult.error || "Failed to search videos"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const videos = (searchResult.videos || []) as Video[];
  const nextCursor = searchResult.nextCursor;

  return (
    <div className="min-h-dvh pt-20 px-4 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Search Header */}
        <div className="flex items-center gap-3 py-6 border-b border-zinc-800">
          <SearchIcon className="w-6 h-6 text-zinc-400" />
          <div>
            <h1 className="text-xl font-semibold">
              {query ? (
                <>
                  Search results for:{" "}
                  <span className="text-purple-400">&quot;{query}&quot;</span>
                </>
              ) : (
                "Search Videos"
              )}
            </h1>
            {query && videos.length > 0 && (
              <p className="text-sm text-zinc-400 mt-1">
                Showing results for videos, descriptions, tags, and uploaders
              </p>
            )}
          </div>
        </div>

        {/* Results or Empty State */}
        {!query ? (
          <EmptySearchState />
        ) : videos.length === 0 ? (
          <NoResultsState query={query} />
        ) : (
          <SearchResults
            query={query}
            initialVideos={videos}
            initialNextCursor={nextCursor}
          />
        )}
      </div>
    </div>
  );
}

const EmptySearchState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <SearchIcon className="w-16 h-16 text-zinc-600 mb-4" />
    <h2 className="text-xl font-semibold text-zinc-300 mb-2">
      Start searching
    </h2>
    <p className="text-zinc-500 max-w-md">
      Enter a search term in the search bar above to find videos.
    </p>
  </div>
);

const NoResultsState = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
      <SearchIcon className="w-8 h-8 text-zinc-500" />
    </div>
    <h2 className="text-xl font-semibold text-zinc-300 mb-2">
      No results found
    </h2>
    <p className="text-zinc-500 max-w-md mb-6">
      No videos found for &quot;{query}&quot;. Try different keywords or check
      the spelling.
    </p>
    <div className="text-sm text-zinc-600">
      <p className="font-medium mb-2">Suggestions:</p>
      <ul className="list-disc list-inside text-left">
        <li>Try more general keywords</li>
        <li>Check your spelling</li>
        <li>Search by uploader name or tags</li>
        <li>Try different words with similar meaning</li>
      </ul>
    </div>
  </div>
);
