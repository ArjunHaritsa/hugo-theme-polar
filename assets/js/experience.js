// Experience page enhancements:
//  1. Each dated role ("### Title `dates`" followed by **Company** / *Location*) becomes a
//     collapsible <details> block; the first one starts open.
//  2. The header skills showcase cycles through its items.
import { prefersReducedMotion } from "./lib/scheme.js";

const content = document.querySelector(".resume__content");

// The company/location line: a paragraph that opens with bold text.
const isSummaryLine = el => el?.tagName === "P" && el.firstElementChild?.tagName === "STRONG" &&
  el.textContent.trimStart().startsWith(el.firstElementChild.textContent);
const isBoundary = el => !el || /^H[1-3]$/.test(el.tagName);

let first = true;
content?.querySelectorAll("h3").forEach(heading => {
  if (!heading.querySelector("code")) return;

  const head = [heading];
  let next = heading.nextElementSibling;
  if (isSummaryLine(next)) {
    head.push(next);
    next = next.nextElementSibling;
  }
  const body = [];
  while (!isBoundary(next)) {
    body.push(next);
    next = next.nextElementSibling;
  }

  // Roles without details (e.g. education) stay static; the rest become collapsible.
  const role = document.createElement(body.length ? "details" : "div");
  role.className = "role";
  heading.before(role);
  if (body.length) {
    const summary = document.createElement("summary");
    summary.append(...head);
    role.append(summary, ...body);
    role.open = first;
    first = false;
  } else {
    const summary = document.createElement("div");
    summary.className = "role__summary";
    summary.append(...head);
    role.append(summary);
  }
});

const showcase = document.querySelector(".showcase__items");
const items = showcase ? [...showcase.children] : [];
if (items.length > 1 && !prefersReducedMotion()) {
  showcase.classList.add("is-cycling");
  let current = 0;
  setInterval(() => {
    const previous = items[current];
    current = (current + 1) % items.length;
    previous.removeAttribute("data-active");
    previous.setAttribute("data-leaving", "");
    items[current].setAttribute("data-active", "");
    setTimeout(() => previous.removeAttribute("data-leaving"), 500);
  }, 3000);
}
