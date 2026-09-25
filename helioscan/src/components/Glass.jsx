import { useCallback, useRef } from "react";
import { motion } from "motion/react";

/**
 * A liquid-glass pane.
 *
 * The lens highlight tracks the pointer by writing CSS custom properties rather
 * than setting React state, so moving the mouse across a grid of these costs no
 * re-renders — the browser just repaints a gradient.
 */
export function useGlassPointer() {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--gx", `${e.clientX - r.left}px`);
    el.style.setProperty("--gy", `${e.clientY - r.top}px`);
  }, []);

  const onEnter = useCallback(() => {
    ref.current?.style.setProperty("--glow", "1");
  }, []);

  const onLeave = useCallback(() => {
    ref.current?.style.setProperty("--glow", "0");
  }, []);

  return { ref, onMouseMove: onMove, onMouseEnter: onEnter, onMouseLeave: onLeave };
}

const EASE = [0.22, 1, 0.36, 1];

export default function Glass({
  as = "div",
  variant = "glass",
  sheen = false,
  lens = true,
  hover = true,
  edge = true,
  className = "",
  children,
  ...rest
}) {
  const pointer = useGlassPointer();
  const Tag = motion[as] || motion.div;

  const classes = [
    variant,
    lens && "glass-lens",
    sheen && "glass-sheen",
    hover && "glass-hover",
    edge && "glass-edge",
    "overflow-hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      {...pointer}
      className={classes}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
