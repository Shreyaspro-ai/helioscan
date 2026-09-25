import { useState } from "react";
import { flagOf } from "../data/countries";

/**
 * Country flag.
 *
 * Regional-indicator emoji (🇺🇸) are the obvious choice but Windows ships no
 * flag-emoji font — they degrade to bare "US" letters there. So the primary
 * render is an image from flagcdn, with the emoji kept as the fallback for
 * platforms that do draw it (and for when the CDN is unreachable).
 *
 * Verified against the awkward codes in the table: XK, VA, PS, TW, HK, MO, SS.
 */
export default function Flag({ code, size = 20, className = "" }) {
  const [failed, setFailed] = useState(false);
  const cc = (code || "").toLowerCase();

  if (failed || !cc) {
    return (
      <span
        className={`inline-block leading-none ${className}`}
        style={{ fontSize: size }}
        aria-label={code}
      >
        {flagOf(code || "UN")}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      alt=""
      width={size}
      height={Math.round(size * 0.75)}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(13,28,47,0.12)] ${className}`}
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}
