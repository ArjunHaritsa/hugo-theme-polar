// Side-effect-free helpers shared by the script bundles.

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

/** The colour scheme in effect, resolving "auto" against the OS preference. */
export function resolvedScheme() {
  const { scheme } = document.documentElement.dataset;
  if (scheme === "light" || scheme === "dark") return scheme;
  return darkQuery.matches ? "dark" : "light";
}

/** Calls `callback(scheme)` whenever the effective scheme may have changed. */
export function onSchemeChange(callback) {
  document.addEventListener("polar:appearance", () => callback(resolvedScheme()));
  darkQuery.addEventListener("change", () => callback(resolvedScheme()));
}

/** True when the visitor asked the OS to minimise motion. */
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
