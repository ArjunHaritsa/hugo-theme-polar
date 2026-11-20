// Types [data-typewriter] captions out once. The full text stays in the DOM (it reserves
// the final wrapped size and is what assistive tech reads); this only animates a copy.
import { prefersReducedMotion } from "./lib/scheme.js";

const DELAY_MS = 45;

const graphemes = text => {
  if ("Segmenter" in Intl) {
    return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map(s => s.segment);
  }
  return Array.from(text);
};

function type(caption) {
  const full = caption.querySelector(".typed__full");
  const live = caption.querySelector(".typed__live");
  if (!full || !live) return;

  const characters = graphemes(full.textContent.trim());
  let index = 0;
  caption.classList.add("is-typing");

  const finish = () => caption.classList.replace("is-typing", "is-typed");
  const step = () => {
    index += 1;
    live.textContent = characters.slice(0, index).join("");
    if (index < characters.length) setTimeout(step, DELAY_MS);
    else finish();
  };

  // Start once the caption is on screen, so it isn't over before anyone sees it.
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      step();
    }
  });
  observer.observe(caption);
}

if (!prefersReducedMotion()) {
  document.querySelectorAll("[data-typewriter]").forEach(type);
}
