import { useLayoutEffect, useRef } from "react";
import { animate, inView, stagger } from "motion";
import { motion } from "motion/react";

/**
 * Site-wide animation engine.
 *
 * The page markup is ported straight from the source HTML, so rather than
 * hand-wrapping several hundred nodes in <motion.div>, we tag them during
 * conversion (`data-reveal`, `data-reveal-group`) and drive them from here:
 *
 *   1. sections fade/slide their contents in, staggered, as they scroll in
 *   2. score/progress bars fill from zero
 *   3. large numeric stats count up
 *
 * Everything is armed from JS, so if scripting fails the page still renders
 * fully visible rather than blank.
 */

/* When the View Transitions API drives navigation, the browser animates the
   whole document. Motion running its own page enter/exit on top of that
   double-animates the same pixels, so the page shell stands down and lets the
   browser own it. */
export const HAS_VIEW_TRANSITIONS =
  typeof document !== "undefined" && typeof document.startViewTransition === "function";

const REDUCED = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const EASE = [0.22, 1, 0.36, 1];

/**
 * Only animate elements that actually have a layout box and are big enough to
 * read as motion. Anything hidden behind a responsive "hidden md:flex" ancestor,
 * or an 8px decorative dot, is left alone — arming it would risk stranding it
 * invisible (its observer can never fire) for no visual gain.
 */
function animatable(el) {
  if (!el.getClientRects().length) return false;
  const r = el.getBoundingClientRect();
  return r.width >= 12 || r.height >= 12;
}

/* ---------- numeric stat count-up ---------- */

const NUM_RE = /^(\D*?)([+-]?[\d,]*\.?\d+)(\D*)$/;
const COUNT_CLASSES = /text-(display-xl|display-xl-mobile|headline-lg|headline-md)/;

function collectCounters(root) {
  const out = [];
  root.querySelectorAll("[class*='text-display-xl'],[class*='text-headline-lg'],[class*='text-headline-md']")
    .forEach((el) => {
      if (el.dataset.counted) return;
      if (!COUNT_CLASSES.test(el.className || "")) return;
      if (el.children.length) return;
      const raw = (el.textContent || "").trim();
      if (raw.length > 14) return;
      const m = raw.match(NUM_RE);
      if (!m) return;
      const target = parseFloat(m[2].replace(/,/g, ""));
      if (!Number.isFinite(target) || target === 0) return;
      const decimals = (m[2].split(".")[1] || "").length;
      const grouped = m[2].includes(",");
      el.dataset.counted = "1";
      out.push({ el, prefix: m[1], suffix: m[3], target, decimals, grouped });
    });
  return out;
}

function runCounter({ el, prefix, suffix, target, decimals, grouped }) {
  const fmt = (v) => {
    let s = v.toFixed(decimals);
    if (grouped) {
      const [i, d] = s.split(".");
      s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d ? "." + d : "");
    }
    return prefix + s + suffix;
  };
  el.textContent = fmt(0);
  animate(0, target, {
    duration: 1.5,
    ease: "easeOut",
    onUpdate: (v) => { el.textContent = fmt(v); },
  });
}

/* ---------- progress / score bars ---------- */

function collectBars(root) {
  const out = [];
  root.querySelectorAll("[style*='width']").forEach((el) => {
    if (el.dataset.barred) return;
    const w = el.style.width;
    if (!w || !w.endsWith("%")) return;
    const parent = el.parentElement;
    if (!parent) return;
    if (!/rounded-full|rounded-lg|overflow-hidden/.test(parent.className || "")) return;
    if (el.children.length > 1) return;
    el.dataset.barred = "1";
    out.push({ el, to: w });
  });
  return out;
}

/* ---------- engine ---------- */

function useSiteAnimation(scopeRef, deps) {
  useLayoutEffect(() => {
    const root = scopeRef.current;
    if (!root) return;
    const stops = [];

    if (REDUCED()) return;

    /* sections + their contents */
    const groups = Array.from(root.querySelectorAll("[data-reveal-group]"));
    const ungrouped = Array.from(root.querySelectorAll("[data-reveal]")).filter(
      (el) => !el.closest("[data-reveal-group]")
    );

    const armGroup = (group) => {
      let targets = Array.from(group.querySelectorAll("[data-reveal]"));
      if (!targets.length) {
        // fall back to the section's own layout children
        const inner = group.firstElementChild;
        targets = Array.from((inner || group).children);
      }
      if (!targets.length) targets = [group];
      targets = targets.filter(animatable);
      targets.forEach((t) => {
        t.style.opacity = "0";
        t.style.transform = "translateY(26px)";
      });
      return targets;
    };

    groups.forEach((group) => {
      const targets = armGroup(group);
      stops.push(
        inView(
          group,
          () => {
            animate(
              targets,
              { opacity: 1, transform: "translateY(0px)" },
              { duration: 0.7, delay: stagger(0.07), ease: EASE }
            );
            collectBars(group).forEach(({ el, to }) => {
              el.style.width = "0%";
              animate(el, { width: to }, { duration: 1.1, delay: 0.25, ease: EASE });
            });
            collectCounters(group).forEach((c) =>
              setTimeout(() => runCounter(c), 220)
            );
            return () => {};
          },
          { amount: 0.12, margin: "0px 0px -8% 0px" }
        )
      );
    });

    ungrouped.filter(animatable).forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      stops.push(
        inView(el, () => {
          animate(
            el,
            { opacity: 1, transform: "translateY(0px)" },
            { duration: 0.6, delay: 0.04 * (i % 6), ease: EASE }
          );
        }, { amount: 0.15 })
      );
    });

    return () => stops.forEach((s) => typeof s === "function" && s());
  }, deps);
}

/* ---------- page shell with route transition ---------- */

function Page({ className = "", children }) {
  const ref = useRef(null);
  useSiteAnimation(ref, []);

  if (HAS_VIEW_TRANSITIONS) {
    return (
      <main ref={ref} className={className}>
        {children}
      </main>
    );
  }

  return (
    <motion.main
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.main>
  );
}

const Reveal = { Page };
export default Reveal;
export { useSiteAnimation, EASE };
