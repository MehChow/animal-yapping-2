"use client";

import { useState, useEffect, useCallback } from "react";

export interface Section {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const SECTIONS: Section[] = [
  {
    id: "newest-video",
    label: "Home",
    icon: "🏠",
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    id: "shorts",
    label: "Shorts",
    icon: "🎬",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "trending",
    label: "Trending",
    icon: "🔥",
    color: "bg-orange-600 hover:bg-orange-700",
  },
  {
    id: "posts",
    label: "Posts",
    icon: "📃",
    color: "bg-purple-600 hover:bg-purple-700",
  },
];

export const useSectionNavigation = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);

  // Handle scroll - show/hide navigation based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrollThreshold = viewportHeight / 3;

      // Show navigation when scrolled past threshold
      setIsDrawerOpen(scrollPosition > scrollThreshold);

      // Update active section based on scroll position
      const sections = SECTIONS.map((section) => {
        const element = document.getElementById(section.id);
        if (!element) return { id: section.id, top: Infinity };
        const rect = element.getBoundingClientRect();
        return { id: section.id, top: Math.abs(rect.top) };
      });

      const closest = sections.reduce((prev, curr) =>
        prev.top < curr.top ? prev : curr
      );
      setActiveSection(closest.id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Scroll to a specific section
  const handleScrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return {
    isDrawerOpen,
    activeSection,
    sections: SECTIONS,
    handleScrollToSection,
  };
};
