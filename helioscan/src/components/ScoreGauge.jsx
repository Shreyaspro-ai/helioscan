import { motion, useInView } from "motion/react";
import { useRef } from "react";
import CountUp from "./CountUp";

/** Radial HelioScore dial that sweeps to its value when scrolled into view. */
export default function ScoreGauge({ score = 96, size = 168, stroke = 12 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100) / 100;

  return (
    <div ref={ref} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#d5e3fd"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0050cc"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={inView ? { strokeDashoffset: c * (1 - pct) } : {}}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display-xl text-display-xl text-on-surface font-bold leading-none">
          {inView ? <CountUp to={score} duration={1.6} /> : 0}
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1">
          HelioScore
        </span>
      </div>
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-secondary/25"
        animate={{ scale: [1, 1.12], opacity: [0.6, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
      />
    </div>
  );
}
