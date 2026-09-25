import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

const container = (stagger, delay) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const word = {
  hidden: { opacity: 0, y: "0.55em", rotateX: -60, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: "0em",
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE },
  },
};

/**
 * Splits a string into words and staggers them in. Unlike a drop-in text
 * component this composes, so styled fragments in the original markup
 * (the underlined "seconds", coloured spans) survive as siblings.
 */
export default function Words({
  text,
  className = "",
  as: Tag = "span",
  delay = 0,
  stagger = 0.045,
  once = true,
}) {
  const MotionTag = motion[Tag] || motion.span;
  return (
    <MotionTag
      className={className}
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.4 }}
      style={{ perspective: 600 }}
    >
      {(() => { const ws = text.split(" ").filter(Boolean); return ws.map((w, i) => (
        <motion.span
          key={i}
          variants={word}
          className="inline-block whitespace-pre"
          style={{ transformOrigin: "50% 100%" }}
        >
          {w}{i < ws.length - 1 ? " " : ""}
        </motion.span>
      )); })()}
    </MotionTag>
  );
}

/** Underline that draws itself once the word above has landed. */
export function DrawUnderline({ className = "", delay = 0.5 }) {
  return (
    <motion.span
      className={className}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      style={{ originX: 0, display: "block" }}
    />
  );
}
