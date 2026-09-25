import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Landing from "./pages/Landing.jsx";
import FindLocations from "./pages/FindLocations.jsx";
import Results from "./pages/Results.jsx";
import DetailReport from "./pages/DetailReport.jsx";
import Methodology from "./pages/Methodology.jsx";

/**
 * A data router, not <BrowserRouter>.
 *
 * `<Link viewTransition>` and `useViewTransitionState()` are what wrap a
 * navigation in document.startViewTransition() and tell a component it is
 * mid-morph — and both throw outside a data router. The page morphs depend on
 * them, so the router type is a requirement here, not a preference.
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      { path: "find", element: <FindLocations /> },
      { path: "results", element: <Results /> },
      { path: "report", element: <DetailReport /> },
      { path: "methodology", element: <Methodology /> },
      { path: "*", element: <Landing /> },
    ],
  },
]);

/**
 * A view transition rejects its ready/finished promises when it is skipped —
 * which happens normally: navigating again mid-morph, or the document being
 * hidden so the browser cannot run one. The navigation itself still completes,
 * so this is benign, but it surfaces as an unhandled rejection. Swallow that
 * one case narrowly and let every other rejection through untouched.
 */
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  if (
    reason instanceof DOMException &&
    reason.name === "InvalidStateError" &&
    /transition/i.test(reason.message)
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
