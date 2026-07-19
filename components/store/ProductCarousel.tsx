"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  children: React.ReactNode;
  className?: string;
}

export function ProductCarousel({ children, className }: ProductCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    
    // Check if we can scroll left
    setShowLeftArrow(el.scrollLeft > 5);
    
    // Check if we can scroll right (allow 5px buffer for rounding errors)
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    checkScroll();
    
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    
    // Double check after content mounts
    const timer = setTimeout(checkScroll, 500);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      clearTimeout(timer);
    };
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative group/carousel w-full", className)}>
      {/* Left Arrow Button */}
      <button
        onClick={() => scroll("left")}
        type="button"
        className={cn(
          "absolute -left-3 top-1/2 z-10 hidden md:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream-dark/60 bg-white/95 text-brown shadow-luxury backdrop-blur-sm transition-all duration-300 hover:bg-brown hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-0",
          showLeftArrow ? "opacity-100" : "opacity-0"
        )}
        disabled={!showLeftArrow}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Carousel Scroll Area */}
      <div
        ref={carouselRef}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 lg:mx-0 lg:px-0 scroll-smooth"
      >
        {children}
      </div>

      {/* Right Arrow Button */}
      <button
        onClick={() => scroll("right")}
        type="button"
        className={cn(
          "absolute -right-3 top-1/2 z-10 hidden md:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream-dark/60 bg-white/95 text-brown shadow-luxury backdrop-blur-sm transition-all duration-300 hover:bg-brown hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-0",
          showRightArrow ? "opacity-100" : "opacity-0"
        )}
        disabled={!showRightArrow}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
