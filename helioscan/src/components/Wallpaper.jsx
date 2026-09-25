import { useScroll, useTransform, motion, useReducedMotion } from "motion/react";

/**
 * The layer the glass refracts.
 *
 * Glass with nothing behind it is just a grey box, so this sits fixed behind the
 * whole app: a warm/cool mesh of brand-coloured blooms that drift, a fine grid
 * that gives the blur something with structure to smear, and a grain layer so
 * the large flat gradients don't band on wide displays.
 *
 * Everything is CSS gradients and one inline SVG — no image request, nothing to
 * hotlink, and it costs no bytes over the wire.
 */
export default function Wallpaper() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();

  // Parallax: the blooms drift far slower than the page, so the glass panes
  // read as sliding over a deeper layer rather than a painted background.
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "26%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-18%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);

  return (
    <div
      aria-hidden
      data-wallpaper
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(165deg,#f2f6ff 0%,#e9f0ff 40%,#f4f3ff 70%,#fff9f0 100%)" }}
    >
      {/* Azure bloom, upper right */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-[18%] -right-[12%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] rounded-full blur-[110px] opacity-[0.62] drift-slow"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(2,102,255,0.52), rgba(0,80,204,0.26) 45%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Amber bloom, mid left — the solar accent */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[26%] -left-[16%] w-[62vw] h-[62vw] max-w-[860px] max-h-[860px] rounded-full blur-[120px] opacity-[0.5] drift-slow"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 55% 45%, rgba(245,158,11,0.42), rgba(255,185,95,0.28) 48%, transparent 72%)",
          }}
        />
      </motion.div>

      {/* Cool bloom, lower right, keeps the footer end from going flat */}
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-[-14%] right-[8%] w-[54vw] h-[54vw] max-w-[760px] max-h-[760px] rounded-full blur-[110px] opacity-[0.55] drift-slow"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(140,170,255,0.6), rgba(213,227,253,0.3) 50%, transparent 74%)",
          }}
        />
      </motion.div>

      {/* Structure for the blur to bite on */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(13,28,47,0.055) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(13,28,47,0.055) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 120% 80% at 50% 0%, #000 35%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 120% 80% at 50% 0%, #000 35%, transparent 78%)",
        }}
      />

      {/* Grain, so the wide gradients don't band */}
      <div
        className="absolute inset-0 opacity-[0.30] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
