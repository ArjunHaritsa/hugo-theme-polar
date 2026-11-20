// A tagline typed at a shell prompt, on a loop: type → hold → backspace → pause → next line.
//
// Smoothness comes from never changing layout after load: every character of every line
// is laid out once (lines stacked in one grid cell), typing only flips opacity, and the
// block cursor moves with a transform. A single requestAnimationFrame loop is driven by
// elapsed time, so dropped frames never change the pace. Pauses when off-screen or in a
// background tab. Screen readers get the plain text; the animation is aria-hidden.
import { prefersReducedMotion } from "./lib/scheme.js";

const HOLD_MS = 5000;
const ERASE_MS = 18;
const PAUSE_MS = 600;
const START_DELAY_MS = 300;

const graphemes = text =>
  "Segmenter" in Intl
    ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map(s => s.segment)
    : Array.from(text);

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

// Small seeded PRNG (mulberry32), so each line has the same human rhythm on every pass.
function random(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cumulative timestamps (ms) at which each character appears. */
function schedule(chars, seed) {
  const rand = random(seed);
  let t = 0;
  return chars.map((ch, i) => {
    const previous = chars[i - 1];
    t += 40 + rand() * 35;
    if (previous && /[,.;:!?…]/.test(previous)) t += 180;
    else if (previous === " ") t += 90;
    return t;
  });
}

/** Builds one line: words kept whole (nowrap), spaces as break points, one span per character. */
function buildLine(text) {
  const node = el("span", "tagline__text");
  const cells = [];
  let word = null;
  for (const g of graphemes(text)) {
    const cell = el("span", "ch", g);
    cells.push(cell);
    if (/\s/.test(g)) {
      word = null;
      node.append(cell);
    } else {
      if (!word) node.append((word = el("span", "tagline__word")));
      word.append(cell);
    }
  }
  return { node, cells, chars: cells.map(c => c.textContent) };
}

function animate(root) {
  const texts = [...root.querySelectorAll(".tagline__line")].map(l => l.textContent.trim()).filter(Boolean);
  if (!texts.length) return;

  const stage = el("span", "tagline__stage");
  stage.setAttribute("aria-hidden", "true");
  const lines = texts.map(buildLine);
  lines.forEach((line, i) => (line.times = schedule(line.chars, i + 1)));
  const cursor = el("span", "tagline__cursor");
  stage.append(...lines.map(l => l.node), cursor);

  const spoken = el("span", "visually-hidden", texts.join(" — "));
  root.replaceChildren(spoken, stage);
  root.classList.add("is-animated");

  // Cursor geometry, measured from the laid-out cells (re-measured on resize).
  let boxes = [];
  const measure = line => {
    boxes = line.cells.map(c => ({ x: c.offsetLeft, y: c.offsetTop, w: c.offsetWidth, h: c.offsetHeight }));
  };
  const place = (line, count) => {
    if (!boxes.length) return;
    const last = boxes[boxes.length - 1];
    const box = count < boxes.length ? boxes[count] : { ...last, x: last.x + last.w };
    cursor.style.height = `${box.h}px`;
    cursor.style.transform = `translate(${box.x}px, ${box.y}px)`;
  };

  let lineIndex = 0;
  let phase = "type";
  let phaseStart = 0;
  let shown = 0;
  let frame = 0;
  let pausedAt = null;

  const activate = index => {
    lines.forEach((l, i) => l.node.classList.toggle("is-active", i === index));
    measure(lines[index]);
  };

  const show = (line, count) => {
    if (count === shown) return;
    const [from, to, on] = count > shown ? [shown, count, true] : [count, shown, false];
    for (let i = from; i < to; i++) line.cells[i].classList.toggle("on", on);
    shown = count;
    place(line, count);
  };

  const enter = (next, now) => {
    phase = next;
    phaseStart = now;
    cursor.classList.toggle("is-blinking", next === "hold" || next === "pause");
    cursor.classList.toggle("is-erasing", next === "erase");
  };

  const tick = now => {
    const line = lines[lineIndex];
    const elapsed = now - phaseStart;

    if (phase === "type") {
      let count = shown;
      while (count < line.times.length && line.times[count] <= elapsed) count++;
      show(line, count);
      if (count === line.times.length) enter("hold", now);
    } else if (phase === "hold") {
      if (elapsed >= HOLD_MS) enter("erase", now);
    } else if (phase === "erase") {
      show(line, Math.max(0, line.cells.length - Math.floor(elapsed / ERASE_MS)));
      if (shown === 0) enter("pause", now);
    } else if (elapsed >= PAUSE_MS) {
      lineIndex = (lineIndex + 1) % lines.length;
      activate(lineIndex);
      place(lines[lineIndex], 0);
      enter("type", now);
    }
    frame = requestAnimationFrame(tick);
  };

  // Run only while visible: pause off-screen and in background tabs, resume where it left off.
  let onScreen = false;
  const running = () => frame !== 0;
  const start = () => {
    if (running() || !onScreen || document.hidden) return;
    const now = performance.now();
    if (pausedAt !== null) phaseStart += now - pausedAt;
    pausedAt = null;
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (!running()) return;
    cancelAnimationFrame(frame);
    frame = 0;
    pausedAt = performance.now();
  };

  activate(0);
  place(lines[0], 0);
  enter("pause", performance.now() - PAUSE_MS + START_DELAY_MS);
  lineIndex = lines.length - 1; // the opening "pause" advances to line 0
  pausedAt = performance.now();

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    onScreen ? start() : stop();
  }).observe(root);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  new ResizeObserver(() => {
    measure(lines[lineIndex]);
    place(lines[lineIndex], shown);
  }).observe(stage);
}

if (!prefersReducedMotion()) {
  document.querySelectorAll("[data-typewriter]").forEach(animate);
}
