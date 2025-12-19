"use client";

import { Search, X, History, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSearchBar } from "@/hooks/useSearchBar";

export const SearchBar = () => {
  const {
    query,
    handleInputChange,
    handleSearch,
    handleKeyDown,
    handleFocus,
    clearQuery,
    inputRef,
    dropdownRef,
    isDropdownOpen,
    suggestions,
    selectedIndex,
    handleSelectSuggestion,
    handleRemoveSuggestion,
    clearHistory,
    hasHistory,
  } = useSearchBar();

  const showDropdown = isDropdownOpen && suggestions.length > 0;

  return (
    <div className="flex-1 flex items-center justify-start pr-4 lg:justify-center lg:pl-4">
      <div className="relative flex items-center w-full max-w-2xl">
        {/* Search Input */}
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="w-full h-10 pl-4 pr-20 rounded-full bg-zinc-900/80 border-zinc-700 
                     text-white placeholder:text-zinc-400 
                     focus-visible:ring-purple-500/50 focus-visible:border-purple-500
                     transition-all duration-200 placeholder:text-md"
          aria-label="Search videos"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          tabIndex={0}
        />

        {/* Clear Button - shows when there's text */}
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearQuery}
            className="absolute right-12 h-8 w-8 text-zinc-400 hover:text-white 
                       hover:bg-transparent cursor-pointer"
            aria-label="Clear search"
            tabIndex={0}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Search Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleSearch()}
          disabled={!query.trim()}
          className="absolute right-1 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 hover:text-white
                     text-white disabled:opacity-50 cursor-pointer
                     transition-all duration-200"
          aria-label="Search"
          tabIndex={0}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Search History Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 
                       rounded-xl shadow-xl overflow-hidden z-50"
            role="listbox"
            aria-label="Search history"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">
                Recent searches
              </span>
              {hasHistory && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-6 px-2 text-xs text-zinc-500 hover:text-red-400 
                             hover:bg-transparent cursor-pointer"
                  aria-label="Clear all search history"
                  tabIndex={0}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Suggestions List */}
            <ul className="max-h-64 overflow-y-auto">
              {suggestions.map((item, index) => (
                <li
                  key={`${item.query}-${item.timestamp}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer 
                              transition-colors duration-150
                              ${
                                index === selectedIndex
                                  ? "bg-zinc-800"
                                  : "hover:bg-zinc-800/50"
                              }`}
                  onClick={() => handleSelectSuggestion(item.query)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSelectSuggestion(item.query);
                  }}
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <History className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="text-white text-sm truncate">
                      {item.query}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleRemoveSuggestion(e, item.query)}
                    className="h-6 w-6 text-zinc-500 hover:text-red-400 
                               hover:bg-transparent cursor-pointer shrink-0 ml-2"
                    aria-label={`Remove "${item.query}" from history`}
                    tabIndex={0}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
