import { Outlet, useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "motion/react";
import { useEffect } from "react";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";
import ClickSpark from "./components/ClickSpark";
import { HAS_VIEW_TRANSITIONS } from "./components/Reveal";
import Wallpaper from "./components/Wallpaper";
import GlassPointer from "./components/GlassPointer";
import { SiteProvider } from "./state/SiteContext";
import { I18nProvider } from "./i18n";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // "instant" explicitly overrides the `scroll-behavior: smooth` set on <html>,
    // which would otherwise slide the new page up from wherever the last one was.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

/**
 * With the View Transitions API the browser owns the page enter/exit, so
 * AnimatePresence is mounted only where the API is missing — running both would
 * animate the same pixels twice.
 */
function RouteHost() {
  const outlet = useOutlet();
  const { pathname } = useLocation();

  if (HAS_VIEW_TRANSITIONS) return <Outlet />;

  return (
    <AnimatePresence mode="wait">
      <div key={pathname}>{outlet}</div>
    </AnimatePresence>
  );
}

/**
 * Root layout.
 *
 * Everything outside <RouteHost> persists across navigations, which is what
 * lets the header and wallpaper hold still while the page morphs beneath them.
 */
export default function App() {
  return (
    <I18nProvider>
    <SiteProvider>
      <MotionConfig reducedMotion="user">
        <ClickSpark
          sparkColor="#0050cc"
          sparkSize={9}
          sparkRadius={17}
          sparkCount={8}
          duration={420}
        >
          <Wallpaper />
          <GlassPointer />
          <ScrollProgress />
          <Header />
          <ScrollToTop />
          <RouteHost />
          <Footer />
        </ClickSpark>
      </MotionConfig>
    </SiteProvider>
    </I18nProvider>
  );
}
