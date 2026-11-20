# Polar

A calm, monospace Hugo theme for a personal site and blog: a filterable post archive,
an about page and a résumé page, with light/dark/auto schemes and selectable accents.

- **No build tooling.** Plain modern CSS, small ES-module scripts bundled by Hugo's built-in
  esbuild. Works with the standard (non-extended) Hugo edition.
- **Appearance panel.** A header chip previews the current palette (background + accent).
  It opens a panel with scheme (Auto · Light · Dark), accent swatches and a dim-text switch.
  Preferences persist per visitor and apply before first paint, so the page never flashes.
- **Post archive.** Posts grouped by year with client-side search (words or `#tags`),
  language and category filters.
- **Multilingual-friendly.** Per-post `language` (e.g. Kannada posts use Noto Sans Kannada).
- **Extras on demand.** MathJax only on pages with `math = true`; Giscus comments that follow
  the active scheme; Chroma syntax colours derived from the accent.
- **No forced recolouring.** Declares `color-scheme: only …`, so browser "dark mode for
  websites" features (Samsung Internet, Edge/Chrome Auto Dark Mode) leave the page alone;
  visitors get Polar's own light or dark scheme instead.
- **Accessible.** Skip link, visible focus, native controls, `prefers-reduced-motion` respected.

Requires Hugo ≥ 0.158.0. Uses Baseline 2024 browser features (`light-dark()`, popover, `:has()`).

## Install

```sh
git submodule add https://github.com/ArjunHaritsa/hugo-theme-polar.git themes/polar
```

```toml
theme = "polar"

[markup.highlight]
  noClasses = false   # let Polar colour code blocks

[markup.tableOfContents]
  endLevel = 4        # optional: include deeper headings in the TOC
```

## Configuration

```toml
[params]
  author = "Your Name"
  description = "Shown on the home page meta description"
  accent = "blue"             # default accent; any `name` from data/accents.toml
  readingTime = true
  showLastUpdated = false
  mainSections = ["posts"]    # sections whose pages count as posts
  homePosts = 3               # recent posts shown on the home page
  favicon = ""                # optional; defaults to an SVG in the accent colour
  copyright = ""              # optional HTML replacing the default footer
  postLanguages = [           # optional; enables the language filter
    { code = "en", label = "English" },
    { code = "kn", label = "ಕನ್ನಡ" },
  ]

[params.logo]
  icon = ""                  # optional first segment, e.g. a Nerd Font glyph
  text = "Your Name"          # defaults to the site title
  url = "/"                   # defaults to the home page

[params.giscus]               # optional comments
  repo = "owner/repo"
  repoId = "…"
  category = "General"
  categoryId = "…"
  mapping = "pathname"        # optional
```

The accent palette lives in `data/accents.toml`. Each entry has a `name`, a `label` and two
tones: `dark` (for dark backgrounds) and `light`. Override the file in your site's `data/` to
change the palette.

## Front matter

| Key | Applies to | Effect |
| --- | --- | --- |
| `language` | posts | Language code; sets `lang`, the font and the archive filter |
| `tags`, `categories` | posts | Tag links; category filter chips |
| `math` | any page | Loads MathJax |
| `toc` / `tocTitle` | any page | Table of contents, shown automatically with 2+ headings; `toc = false` hides it |
| `cover` / `coverAlt` / `coverCaption` | any page | Cover image (page resource or site path) |
| `hideComments` | any page | Disables comments |
| `readingTime` | any page | Overrides `params.readingTime` |
| `noindex`, `keywords`, `description` | any page | Meta tags |

### About page (`type = "about"`)

A profile panel: round photo from `cover`, name (`name`, default `params.author`), `role`,
a meta line (post count with `showPostCount = true`, post languages, `location`) and contact
buttons from `links = [{ name, url, icon }]` (`icon` is optional, e.g. a Nerd Font glyph).
`coverCaption` becomes a tagline that types itself out once without moving the layout;
without JavaScript or with reduced motion it is plain text.

### Experience page (`type = "experience"`)

Header fields: `cover`, `coverCaption`, `candidateName`, `currentRole`, `shortInfo`,
`showcaseText` and `showcaseLanguages` (a rotating list). In the body, each role written as

```markdown
### Role title `Start - End`

**Company**
*Location*

Details…
```

becomes a row like a post (dates and location in the meta line, then title and company).
Roles with details collapse; roles without details stay static. `## Headings` and tables
pick up the shared section-heading and hairline-row styles.

## License

MIT. Bundled fonts: JetBrains Mono and Noto Sans Kannada (SIL OFL 1.1), Nerd Fonts Symbols
(MIT); their licences are next to the font files.
