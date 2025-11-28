"use client";

import { Button } from "@/components/ui/button";
import { useSectionNavigation } from "@/hooks/useSectionNavigation";
import { cn } from "@/lib/utils";

export const SectionNavigation = () => {
  const { isDrawerOpen, activeSection, sections, handleScrollToSection } =
    useSectionNavigation();

  return (
    <div
      className={cn(
        "fixed right-4 top-1/2 -translate-y-1/2 z-50 lg:hidden",
        "flex flex-col gap-2 p-2 rounded-xl",
        "bg-white/20 backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        isDrawerOpen
          ? "opacity-100 translate-x-0 scale-100"
          : "opacity-0 translate-x-4 scale-95 pointer-events-none"
      )}
      role="navigation"
      aria-label="Section navigation"
      aria-hidden={!isDrawerOpen}
    >
      {sections.map((section, index) => (
        <Button
          key={section.id}
          variant="ghost"
          size="icon"
          onClick={() => handleScrollToSection(section.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleScrollToSection(section.id);
            }
          }}
          className={cn(
            "w-10 h-10 rounded-full transition-all duration-200",
            "hover:bg-white/20 hover:scale-110",
            activeSection === section.id && "ring-2 ring-white bg-white/10"
          )}
          style={{
            transitionDelay: isDrawerOpen ? `${index * 50}ms` : "0ms",
          }}
          aria-label={`Navigate to ${section.label} section`}
          aria-current={activeSection === section.id ? "true" : undefined}
          tabIndex={isDrawerOpen ? 0 : -1}
        >
          <span className="text-xl" aria-hidden="true">
            {section.icon}
          </span>
        </Button>
      ))}
    </div>
  );
};
