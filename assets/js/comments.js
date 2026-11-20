// Giscus comments that follow the site's colour scheme, including live changes.
import { onSchemeChange, resolvedScheme } from "./lib/scheme.js";

const ORIGIN = "https://giscus.app";
const host = document.querySelector("[data-giscus]");
const themeFor = scheme => (scheme === "dark" ? "dark" : "light");

if (host) {
  const { repo, repoId, category, categoryId, mapping, lang } = host.dataset;
  const script = document.createElement("script");
  script.src = `${ORIGIN}/client.js`;
  script.async = true;
  script.crossOrigin = "anonymous";
  Object.entries({
    repo,
    repoId,
    category,
    categoryId,
    mapping,
    lang,
    strict: "0",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "bottom",
    loading: "lazy",
    theme: themeFor(resolvedScheme()),
  }).forEach(([key, value]) => (script.dataset[key] = value));
  host.append(script);

  onSchemeChange(scheme => {
    const frame = host.querySelector("iframe.giscus-frame");
    frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: themeFor(scheme) } } }, ORIGIN);
  });
}
