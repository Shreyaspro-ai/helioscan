import { motion } from "motion/react";

/**
 * Brand mark. The source HTML hotlinked a logo image that no longer resolves,
 * so this is an inline SVG built to the spec carried in that <img>'s alt text
 * (amber #f59e0b, Space Grotesk, rounded-sm) — and it animates.
 */
export default function SunMark({ size = 32, className = "" }) {
  const rays = Array.from({ length: 8 });

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      initial="rest"
      whileHover="hot"
      animate="rest"
      aria-label="HelioScan"
      role="img"
    >
      <motion.rect
        width="48"
        height="48"
        rx="8"
        fill="#0d1c32"
        variants={{ rest: { fill: "#0d1c32" }, hot: { fill: "#1b2f4f" } }}
        transition={{ duration: 0.4 }}
      />
      <motion.g
        style={{ originX: "24px", originY: "24px" }}
        variants={{
          rest: { rotate: 0 },
          hot: { rotate: 45 },
        }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        {rays.map((_, i) => (
          <motion.rect
            key={i}
            x="23.1"
            y="5"
            width="1.8"
            height="6.5"
            rx="0.9"
            fill="#f59e0b"
            style={{
              originX: "24px",
              originY: "24px",
              transform: `rotate(${i * 45}deg)`,
            }}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.12,
            }}
          />
        ))}
      </motion.g>
      <motion.circle
        cx="24"
        cy="24"
        r="8.5"
        fill="#f59e0b"
        variants={{ rest: { scale: 1 }, hot: { scale: 1.12 } }}
        style={{ originX: "24px", originY: "24px" }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
      />
      <motion.circle
        cx="24"
        cy="24"
        r="8.5"
        fill="none"
        stroke="#ffb95f"
        strokeWidth="1.5"
        style={{ originX: "24px", originY: "24px" }}
        animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
