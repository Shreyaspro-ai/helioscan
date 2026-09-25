import { motion } from "motion/react";
import { useState } from "react";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Monthly irradiance profile. Bars grow from the baseline in sequence as the
 * chart scrolls into view, and lift on hover with a read-out tooltip.
 */
export default function MonthlyChart({ data, unit = "kWh/m²/day" }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...data.map((d) => d.v));

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1.5 h-52">
        {data.map((d, i) => {
          const h = (d.v / max) * 100;
          const isActive = active === i;
          return (
            <div
              key={d.m}
              className="relative flex-1 h-full flex flex-col justify-end items-center group"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 6 }}
                transition={{ duration: 0.2 }}
                className="absolute -top-1 z-10 px-space-sm py-1 rounded-full bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm whitespace-nowrap pointer-events-none shadow-lg"
              >
                {d.v.toFixed(2)}
              </motion.div>
              <motion.div
                className="w-full rounded-full origin-bottom"
                style={{
                  background: isActive
                    ? "linear-gradient(180deg,#ffb95f 0%,#f59e0b 100%)"
                    : "linear-gradient(180deg,#0266ff 0%,#0050cc 100%)",
                }}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.05 * i }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-1.5 mt-space-sm">
        {data.map((d, i) => (
          <span
            key={d.m}
            className={`flex-1 text-center font-label-sm text-label-sm transition-colors ${
              active === i ? "text-on-surface font-bold" : "text-on-surface-variant"
            }`}
          >
            {d.m}
          </span>
        ))}
      </div>
      <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant text-center">
        Global Horizontal Irradiance · {unit}
      </p>
    </div>
  );
}
