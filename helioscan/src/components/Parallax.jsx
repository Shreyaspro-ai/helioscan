import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";

/**
 * Scroll-linked depth.
 *
 * The wallpaper already drifts slowly behind everything; giving foreground
 * blocks their own, faster rate is what makes the glass read as a layer
 * floating above it rather than a texture painted on.
 *
 * `speed` is the fraction of scroll distance the element gives back: 0.15 moves
 * it 15% against the scroll. Negative values push the other way.
 */
export default function Parallax({
  children,
  speed = 0.12,
  fade = false,
  className = "",
  ...rest
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : [`${speed * 100}%`, `${-speed * 100}%`]
  );
  const y = useSpring(raw, { stiffness: 120, damping: 28, restDelta: 0.001 });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.82, 1],
    fade && !reduce ? [0.4, 1, 1, 0.4] : [1, 1, 1, 1]
  );

  return (
    <motion.div ref={ref} style={{ y, opacity }} className={className} {...rest}>
      {children}
    </motion.div>
  );
}
