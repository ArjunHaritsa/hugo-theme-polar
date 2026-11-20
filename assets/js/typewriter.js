// Types [data-typewriter] taglines out once, without layout shift: the whole text is
// rendered from the start and the untyped remainder is merely invisible, so line
// breaks are final from the first frame. Screen readers get the full text at once.
import { prefersReducedMotion } from "./lib/scheme.js";

const DELAY_MS = 28;

const graphemes = text =>
  "Segmenter" in Intl
    ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map(s => s.segment)
    : Array.from(text);

const span = (className, text = "") => {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
};

function type(element) {
  const original = element.innerHTML;
  const characters = graphemes(element.textContent.trim());
  if (!characters.length) return;

  const done = span("typed__done");
  const caret = span("typed__caret");
  const rest = span("typed__rest", characters.join(""));
  const visual = span("typed");
  visual.setAttribute("aria-hidden", "true");
  visual.append(done, caret, rest);
  element.replaceChildren(span("visually-hidden", characters.join("")), visual);

  let index = 0;
  const step = () => {
    index += 1;
    done.textContent = characters.slice(0, index).join("");
    rest.textContent = characters.slice(index).join("");
    if (index < characters.length) {
      setTimeout(step, DELAY_MS);
    } else {
      // Restore any inline markup and leave a blinking block cursor, like a shell prompt.
      element.innerHTML = original;
      element.append(span("typed__caret is-idle"));
    }
  };

  // Start when visible, so the animation isn't over before anyone sees it.
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      setTimeout(step, 300);
    }
  });
  observer.observe(element);
}

if (!prefersReducedMotion()) {
  document.querySelectorAll("[data-typewriter]").forEach(type);
}
