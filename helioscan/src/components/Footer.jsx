import { Link } from "react-router-dom";
import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="w-full glass glass-edge mt-space-xl py-space-lg"
    >
      <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm">
        <div className="flex items-center gap-space-sm">
          <span className="font-label-sm text-label-sm uppercase font-semibold text-on-surface">
            HelioScan Solar Intelligence Suite
          </span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            •
          </motion.span>
          <span>Precision Geospatial Irradiance Modeling</span>
        </div>
        <div className="flex items-center gap-space-lg font-label-sm text-label-sm">
          {[
            { to: "/methodology", label: "Algorithm Specifications" },
            { to: "/methodology", label: "GIS Telemetry Legal" },
            { to: "/methodology", label: "API Integration" },
          ].map((l, i) => (
            <motion.span key={i} whileHover={{ y: -2 }} className="inline-block">
              <Link viewTransition
                to={l.to}
                className="relative hover:text-on-surface transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full"
              >
                {l.label}
              </Link>
            </motion.span>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}
