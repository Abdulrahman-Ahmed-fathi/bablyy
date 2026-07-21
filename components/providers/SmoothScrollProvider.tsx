"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

// ---------------------------------------------------------------------------
// SmoothScrollProvider — performance-hardened Lenis wrapper
//
// Two optimisations over the naive always-on implementation:
//
//  1. LAZY INIT  ─ Lenis (and its RAF loop) is not created until the first
//     user interaction that could produce scrolling (wheel, touchstart,
//     keydown, pointerdown).  Pages where the user never interacts at all
//     (e.g. quick back-navigations, server-rendered previews) pay zero cost.
//
//  2. VISIBILITY PAUSE  ─ While document.visibilityState === "hidden" the RAF
//     handle is cancelled so the browser doesn't keep running physics
//     calculations in a background tab.  The loop is restarted the moment the
//     tab becomes visible again.
//
// lenis.stop() / lenis.start() are used alongside cancelAnimationFrame so
// that Lenis's internal stopped flag stays in sync.  This prevents a stale
// scroll position being applied on the first resumed frame.
// ---------------------------------------------------------------------------

const INIT_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  // Stores the current requestAnimationFrame handle so we can cancel it.
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    let initialized = false;

    // ------------------------------------------------------------------
    // raf loop — started once, paused/resumed around visibility changes.
    // ------------------------------------------------------------------
    function startRaf(lenis: Lenis) {
      function tick(time: number) {
        lenis.raf(time);
        rafIdRef.current = requestAnimationFrame(tick);
      }
      rafIdRef.current = requestAnimationFrame(tick);
    }

    function stopRaf() {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }

    // ------------------------------------------------------------------
    // Visibility handler — cancel RAF when the tab is backgrounded.
    // ------------------------------------------------------------------
    function handleVisibilityChange() {
      const lenis = lenisRef.current;
      if (!lenis) return;

      if (document.visibilityState === "hidden") {
        lenis.stop();    // freeze internal state
        stopRaf();       // cancel the animation frame handle
      } else {
        lenis.start();   // unfreeze internal state
        startRaf(lenis); // restart the loop
      }
    }

    // ------------------------------------------------------------------
    // Lazy init — create Lenis only on the first real user gesture.
    // ------------------------------------------------------------------
    function initLenis() {
      if (initialized) return;
      initialized = true;

      // Remove bootstrap listeners — they have served their purpose.
      INIT_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, initLenis, { capture: true })
      );

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      // Only start the RAF loop if the tab is currently visible.
      if (document.visibilityState !== "hidden") {
        startRaf(lenis);
      }

      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // Register lightweight capture listeners (passive where possible).
    INIT_EVENTS.forEach((evt) =>
      window.addEventListener(evt, initLenis, {
        capture: true,
        passive: true,
      })
    );

    // ------------------------------------------------------------------
    // Cleanup — runs on unmount or React strict-mode double-mount.
    // ------------------------------------------------------------------
    return () => {
      // Remove bootstrap listeners in case init never fired.
      INIT_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, initLenis, { capture: true })
      );

      if (lenisRef.current) {
        stopRaf();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      initialized = false;
    };
  }, []);

  return <>{children}</>;
}
