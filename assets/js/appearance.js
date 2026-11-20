// Appearance panel: colour scheme (auto/light/dark), accent and dimmed text.
// The initial state is applied before first paint by head/appearance-init.html;
// this module syncs the controls, persists changes and broadcasts them.
import { palette } from "@params";
import { resolvedScheme } from "./lib/scheme.js";

const root = document.documentElement;
const panel = document.getElementById("appearance-panel");
const toggle = document.querySelector("[popovertarget='appearance-panel']");

const storage = {
  get(key) {
    try {
      return localStorage.getItem(`polar:${key}`);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value === null) localStorage.removeItem(`polar:${key}`);
      else localStorage.setItem(`polar:${key}`, value);
    } catch {
      // Storage may be unavailable (private mode, blocked cookies); settings then last for the page only.
    }
  },
};

function announce() {
  document.dispatchEvent(new CustomEvent("polar:appearance", { detail: { scheme: resolvedScheme() } }));
}

function setScheme(scheme) {
  root.dataset.scheme = scheme;
  storage.set("scheme", scheme === "auto" ? null : scheme);
  announce();
}

function showAccentName(name) {
  const label = panel?.querySelector(".appearance__accent-name");
  if (label) label.value = palette.find(accent => accent.name === name)?.label ?? name;
}

function setAccent(name) {
  root.dataset.accent = name;
  storage.set("accent", name);
  showAccentName(name);
}

function setDim(on) {
  root.toggleAttribute("data-dim", on);
  storage.set("dim", on ? "on" : null);
}

if (panel && toggle) {
  const form = {
    scheme: panel.querySelectorAll("input[name='scheme']"),
    accent: panel.querySelectorAll("input[name='accent']"),
    dim: panel.querySelector("input[name='dim']"),
  };

  // Reflect the state applied before paint.
  form.scheme.forEach(input => (input.checked = input.value === (root.dataset.scheme || "auto")));
  form.accent.forEach(input => (input.checked = input.value === root.dataset.accent));
  form.dim.checked = root.hasAttribute("data-dim");
  showAccentName(root.dataset.accent);

  panel.addEventListener("change", event => {
    const input = event.target;
    if (input.name === "scheme") setScheme(input.value);
    else if (input.name === "accent") setAccent(input.value);
    else if (input.name === "dim") setDim(input.checked);
  });

  // Anchor the panel under its button (the top layer ignores normal layout).
  const place = () => {
    const rect = toggle.getBoundingClientRect();
    panel.style.top = `${rect.bottom + 8}px`;
    panel.style.right = `${Math.max(8, document.documentElement.clientWidth - rect.right)}px`;
  };

  panel.addEventListener("beforetoggle", event => {
    if (event.newState === "open") place();
  });
  panel.addEventListener("toggle", event => {
    toggle.setAttribute("aria-expanded", String(event.newState === "open"));
    if (event.newState === "open") panel.querySelector("input:checked")?.focus();
  });
  toggle.setAttribute("aria-expanded", "false");
  window.addEventListener("resize", () => panel.matches(":popover-open") && place());
}
