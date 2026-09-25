import { useEffect } from "react";

/**
 * Drives the refraction highlight on every .glass-lens pane from one listener.
 *
 * Per-card React state for this would re-render a whole grid on every mouse
 * move. Instead a single passive document listener writes two CSS custom
 * properties on whichever pane is under the cursor, so the browser repaints a
 * gradient and React never hears about it.
 */
export default function GlassPointer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Coarse pointers have no hover, so the highlight would only ever flash.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let current = null;
    let frame = 0;
    let pending = null;

    const paint = () => {
      frame = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--gx", `${x - r.left}px`);
      el.style.setProperty("--gy", `${y - r.top}px`);
    };

    const onMove = (e) => {
      const hit = e.target instanceof Element ? e.target.closest(".glass-lens") : null;

      if (hit !== current) {
        current?.style.setProperty("--glow", "0");
        current = hit;
        current?.style.setProperty("--glow", "1");
      }
      if (!hit) return;

      pending = { el: hit, x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      current?.style.setProperty("--glow", "0");
      current = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      current?.style.setProperty("--glow", "0");
    };
  }, []);

  return null;
}
