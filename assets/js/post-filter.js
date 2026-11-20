// Client-side search, language and category filtering for post archives.
const form = document.querySelector("[data-post-filter]");
const posts = [...document.querySelectorAll(".archive .post-row")];

if (form && posts.length) {
  const search = form.elements.namedItem("q");
  const language = form.elements.namedItem("language");
  const categoryBox = form.querySelector(".filters__categories");
  const chips = categoryBox.querySelector(".chips");
  const years = [...document.querySelectorAll(".archive__year")];
  const empty = document.querySelector("[data-no-results]");

  const state = { terms: [], language: "all", category: "all" };
  const categoriesOf = post => post.dataset.categories.split("|").filter(Boolean);
  const inLanguage = post => state.language === "all" || post.dataset.language === state.language;

  const matches = post =>
    inLanguage(post) &&
    (state.category === "all" || categoriesOf(post).includes(state.category)) &&
    state.terms.every(term => post.dataset.search.includes(term));

  function apply() {
    let visible = 0;
    for (const post of posts) {
      post.hidden = !matches(post);
      if (!post.hidden) visible += 1;
    }
    for (const year of years) year.hidden = !year.querySelector(".post-row:not([hidden])");
    empty.hidden = visible > 0;
  }

  function chip(value, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip-button";
    button.textContent = label;
    button.dataset.value = value;
    button.setAttribute("aria-pressed", String(value === state.category));
    return button;
  }

  function renderCategories() {
    const categories = [...new Set(posts.filter(inLanguage).flatMap(categoriesOf))].sort();
    if (!categories.includes(state.category)) state.category = "all";
    chips.replaceChildren(chip("all", chips.dataset.allLabel), ...categories.map(c => chip(c, c)));
    categoryBox.hidden = categories.length === 0;
  }

  chips.addEventListener("click", event => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    state.category = button.dataset.value;
    chips.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
    apply();
  });

  search.addEventListener("input", () => {
    state.terms = search.value.toLowerCase().split(/\s+/).filter(Boolean).map(term => term.replace(/^#/, ""));
    apply();
  });

  language?.addEventListener("change", () => {
    state.language = language.value;
    renderCategories();
    apply();
  });

  form.addEventListener("submit", event => event.preventDefault());
  form.hidden = false;
  renderCategories();
}
