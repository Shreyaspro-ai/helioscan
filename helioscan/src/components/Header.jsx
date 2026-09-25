import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import ShinyText from "./ShinyText";
import SunMark from "./SunMark";
import LanguageSwitcher from "./LanguageSwitcher";
import { useT } from "../i18n";

const AVATAR =
  "https://lh3.googleusercontent.com/aida/AEtjO1UOAhHf-Ehx4DVILPRs890sZ9d6aGuY9qtlJRyPXlG_Gcf5myUAMWcds59rG_QAEKrO03uXaqERKgH4bWsIqY7PHmODTGzH98c4ZsjKfNqqxrgDE1r3hc9Ege4WFFS3jGRZTjZ5j64ms1bMkJUS3qWHwaZ2EO9GIhQHedVNH0QbMqBfnAfYRRxF021KGqPqsrcZO1ZYmTZYAZaSfZ0m8_bdji5jjfWUHLEgT7AvRjWhOwFZD_bM-cOkqd8";

const LINKS = [
  { to: "/", key: "nav.home", end: true },
  { to: "/find", key: "nav.find" },
  { to: "/results", key: "nav.results" },
  { to: "/report", key: "nav.report" },
  { to: "/methodology", key: "nav.methodology" },
];

const EASE = [0.22, 1, 0.36, 1];

export default function Header() {
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [hovered, setHovered] = useState(null);
  const location = useLocation();
  const t = useT();

  useMotionValueEvent(scrollY, "change", (v) => setCondensed(v > 24));

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: EASE }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong glass-sheen"
      style={{
        boxShadow: condensed
          ? "0 6px 26px rgba(10,25,47,0.10)"
          : "0 1px 8px rgba(10,25,47,0.04)",
        transition: "box-shadow 0.35s ease",
      }}
    >
      <motion.div
        className="max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-lg"
        animate={{ height: condensed ? 56 : 64 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {/* Brand */}
        <Link viewTransition to="/" className="flex items-center gap-space-md group">
          <SunMark size={32} className="shrink-0" />
          <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-bold uppercase">
            HelioScan
          </span>
          <motion.span
            className="hidden lg:inline-flex items-center px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm tracking-widest uppercase"
            animate={{ opacity: condensed ? 0 : 1, width: condensed ? 0 : "auto" }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {t("header.telemetry")}
          </motion.span>
        </Link>

        {/* Nav with a shared sliding pill */}
        <nav
          className="hidden md:flex items-center gap-space-xs"
          onMouseLeave={() => setHovered(null)}
        >
          {LINKS.map((l) => {
            const active =
              l.end ? location.pathname === "/" : location.pathname.startsWith(l.to);
            return (
              <NavLink viewTransition
                key={l.to}
                to={l.to}
                onMouseEnter={() => setHovered(l.to)}
                className="relative px-space-md py-space-xs rounded-full font-label-md text-label-md transition-colors"
              >
                {hovered === l.to && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-full bg-surface-container-low"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-surface-container-high"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    active
                      ? "text-on-surface font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t(l.key)}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-space-md">
          <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-low rounded-full">
            <span className="relative flex w-2 h-2 text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary sun-pulse" />
            </span>
            <ShinyText
              text={t("header.synced")}
              speed={4}
              color="#44474d"
              shineColor="#0050cc"
              className="font-label-sm text-label-sm"
            />
          </div>

          <LanguageSwitcher />

          <motion.img
            alt="Profile"
            src={AVATAR}
            className="w-8 h-8 rounded-full object-cover shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
            whileHover={{ scale: 1.12, boxShadow: "0 0 0 3px rgba(0,80,204,0.25)" }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
          />
        </div>
      </motion.div>
    </motion.header>
  );
}
