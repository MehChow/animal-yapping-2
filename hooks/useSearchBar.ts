"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useSearchHistory } from "./useSearchHistory";

export const useSearchBar = () => {
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    history,
    isLoaded,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getFilteredHistory,
  } = useSearchHistory();

  // Get filtered suggestions based on current query
  const suggestions = isLoaded ? getFilteredHistory(query) : [];

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setSelectedIndex(-1);
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
      }
    },
    [isDropdownOpen]
  );

  const handleSearch = useCallback(
    (searchQuery?: string) => {
      const trimmedQuery = (searchQuery ?? query).trim();
      if (!trimmedQuery) return;

      // Add to history
      addToHistory(trimmedQuery);

      // Close dropdown
      setIsDropdownOpen(false);
      setSelectedIndex(-1);

      // Navigate to search page with query param
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    },
    [query, router, addToHistory]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownOpen || suggestions.length === 0) {
        if (e.key === "Enter") {
          handleSearch();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSearch(suggestions[selectedIndex].query);
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          setIsDropdownOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isDropdownOpen, suggestions, selectedIndex, handleSearch]
  );

  const handleFocus = useCallback(() => {
    if (history.length > 0) {
      setIsDropdownOpen(true);
    }
  }, [history.length]);

  const handleSelectSuggestion = useCallback(
    (suggestionQuery: string) => {
      setQuery(suggestionQuery);
      handleSearch(suggestionQuery);
    },
    [handleSearch]
  );

  const handleRemoveSuggestion = useCallback(
    (e: React.MouseEvent, suggestionQuery: string) => {
      e.stopPropagation();
      removeFromHistory(suggestionQuery);
    },
    [removeFromHistory]
  );

  const clearQuery = useCallback(() => {
    setQuery("");
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    query,
    setQuery,
    handleInputChange,
    handleSearch,
    handleKeyDown,
    handleFocus,
    clearQuery,
    inputRef,
    dropdownRef,
    isDropdownOpen,
    setIsDropdownOpen,
    suggestions,
    selectedIndex,
    handleSelectSuggestion,
    handleRemoveSuggestion,
    clearHistory,
    hasHistory: history.length > 0,
  };
};
