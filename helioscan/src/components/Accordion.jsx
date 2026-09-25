import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

/**
 * FAQ accordion. Replaces the source page's classList-toggling script with a
 * height/opacity transition; one panel open at a time, as the original did.
 */
export default function Accordion({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="py-space-md border-b border-surface-container last:border-0"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full py-space-sm flex items-center justify-between text-left focus:outline-none group gap-space-md"
            >
              <span
                className={`font-headline-sm text-headline-sm transition-colors pr-space-md ${
                  isOpen ? "text-secondary" : "text-on-surface group-hover:text-secondary"
                }`}
              >
                {it.q}
              </span>
              <motion.span
                className="material-symbols-outlined text-secondary shrink-0"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                expand_more
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.38, ease: EASE },
                    opacity: { duration: 0.25, ease: "easeOut" },
                  }}
                  className="overflow-hidden"
                >
                  <motion.p
                    initial={{ y: -8 }}
                    animate={{ y: 0 }}
                    exit={{ y: -8 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="pt-space-xs text-on-surface-variant font-body-md text-body-md leading-relaxed"
                  >
                    {it.a}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
