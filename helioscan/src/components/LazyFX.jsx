import { lazy, Suspense, useEffect, useState } from "react";

/**
 * The two WebGL/GSAP backgrounds are purely decorative, so they have no business
 * sitting in the main bundle — `ogl` (LightRays) and `gsap` + InertiaPlugin
 * (DotGrid) load as their own chunks instead.
 *
 * They are also deferred past first paint, and skipped outright when the viewer
 * prefers reduced motion — in that case the chunk is never fetched at all.
 */

const LightRaysImpl = lazy(() => import("./LightRays"));
const DotGridImpl = lazy(() => import("./DotGrid"));

function useDeferredFX() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let idleId;
    let timerId;
    const start = () => setReady(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(start, { timeout: 1500 });
    } else {
      timerId = window.setTimeout(start, 250);
    }

    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  return ready;
}

export function LightRaysFX(props) {
  const ready = useDeferredFX();
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <LightRaysImpl {...props} />
    </Suspense>
  );
}

export function DotGridFX(props) {
  const ready = useDeferredFX();
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <DotGridImpl {...props} />
    </Suspense>
  );
}
