"use client";

import { useState, useEffect, useCallback } from "react";

const SEARCH_HISTORY_KEY = "animal-yapping-search-history";
const MAX_HISTORY_ITEMS = 10;

export type SearchHistoryItem = {
  query: string;
  timestamp: number;
};

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = useCallback((newHistory: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  }, []);

  // Add a search query to history
  const addToHistory = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      const newItem: SearchHistoryItem = {
        query: trimmedQuery,
        timestamp: Date.now(),
      };

      // Remove existing entry with same query (case-insensitive)
      const filteredHistory = history.filter(
        (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
      );

      // Add new item at the beginning and limit to max items
      const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(newHistory);
    },
    [history, saveHistory]
  );

  // Remove a specific item from history
  const removeFromHistory = useCallback(
    (query: string) => {
      const newHistory = history.filter(
        (item) => item.query.toLowerCase() !== query.toLowerCase()
      );
      saveHistory(newHistory);
    },
    [history, saveHistory]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // Get filtered history based on current input
  const getFilteredHistory = useCallback(
    (currentQuery: string) => {
      if (!currentQuery.trim()) {
        return history;
      }
      return history.filter((item) =>
        item.query.toLowerCase().includes(currentQuery.toLowerCase())
      );
    },
    [history]
  );

  return {
    history,
    isLoaded,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getFilteredHistory,
  };
};

