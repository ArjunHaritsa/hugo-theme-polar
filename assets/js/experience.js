// Experience page enhancements:
//  1. Each dated role, written as
//       ### Title `Start - End`
//       **Company**  *Location*
//       details…
//     becomes a row like a post: a meta line (dates • location), the title, the company,
//     then the details. Roles with details collapse (the first starts open).
//  2. The header skills showcase cycles through its items.
import { prefersReducedMotion } from "./lib/scheme.js";

const SHOWCASE_INTERVAL_MS = 1800;
const SHOWCASE_TRANSITION_MS = 300;

const content = document.querySelector(".resume__content");

const element = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
};

// The company/location line: a paragraph that opens with bold text.
const isOrgLine = el =>
  el?.tagName === "P" &&
  el.firstElementChild?.tagName === "STRONG" &&
  el.textContent.trimStart().startsWith(el.firstElementChild.textContent);
const isBoundary = el => !el || /^H[1-3]$/.test(el.tagName);

function buildRole(heading, first) {
  const dates = heading.querySelector("code");
  const org = isOrgLine(heading.nextElementSibling) ? heading.nextElementSibling : null;

  const body = [];
  let next = (org ?? heading).nextElementSibling;
  while (!isBoundary(next)) {
    body.push(next);
    next = next.nextElementSibling;
  }

  const meta = element("p", "meta");
  meta.append(element("span", "meta__accent", dates.textContent.replace(/\s+-\s+/, " – ")));
  const location = org?.querySelector("em");
  if (location) meta.append(element("span", "", location.textContent));

  dates.remove();
  heading.querySelector(".heading-anchor")?.remove();
  heading.className = "row__title";

  const head = [meta, heading];
  if (org) head.push(element("p", "row__summary role__org", org.querySelector("strong").textContent));

  const role = element(body.length ? "details" : "div", "row role");
  org?.remove();
  heading.replaceWith(role);
  if (body.length) {
    const summary = element("summary", "role__head");
    summary.append(...head);
    const details = element("div", "role__body");
    details.append(...body);
    role.append(summary, details);
    role.open = first;
  } else {
    const summary = element("div", "role__head");
    summary.append(...head);
    role.append(summary);
  }
  return body.length > 0;
}

let first = true;
content?.querySelectorAll("h3").forEach(heading => {
  if (heading.querySelector("code") && buildRole(heading, first)) first = false;
});

// Showcase: the cycling styles apply from first paint (see experience.css), so this only advances it.
const items = [...document.querySelectorAll(".showcase__item")];
if (items.length > 1 && !prefersReducedMotion()) {
  let current = 0;
  setInterval(() => {
    const previous = items[current];
    current = (current + 1) % items.length;
    previous.removeAttribute("data-active");
    previous.setAttribute("data-leaving", "");
    items[current].setAttribute("data-active", "");
    setTimeout(() => previous.removeAttribute("data-leaving"), SHOWCASE_TRANSITION_MS);
  }, SHOWCASE_INTERVAL_MS);
}
