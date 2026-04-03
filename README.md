Visit Christian Schuler's [Personal GitHub Pages](https://christianschuler8989.github.io/).

## A Researcher's Personal Homepage

### Requirements and Features
- Modular, concise JS (small helper functions, single responsibility).
- Data-driven site: navigation, sections (e.g. publications, projects, ...), and section contents (e.g. specific publication entry, a certain project entry, ...), theme and translations are read from “files” (typically JSON).
- SPA single-page layout (vertical navigation bar on the left, content panels on the right).
- Vertical 3D layered hexagons for navigation with subtle animation; the active hex becomes slightly bigger and “shiny”.
- The hexagonal buttons of the navigation bar are tiled like honeycombs with specific offsets.
- Scrollspy: navigation highlights based on scroll position; clicking hexes smooth-scrolls to section.
- Some content is located at separate pages, such as course contents, which can be accessed directly via adding to the URL: `#teachings/LRMTSeminar2026`
- Theme JSON → CSS variables (mix of CSS variables + JS-readable theme.json).
- Internationalization with language switcher (switches labels in navigation and sections), which reads from language-specific files.
- Accessibility: keyboard focus, aria-labels, focus ring, aria-current when active, colorblind-friendly color palette.

### File Hierarchy
```
/root
├── assets
│   ├── css
│   │   ├── base.css
│   │   ├── hexagons.css
│   │   ├── layout.css
│   │   ├── reset.css
│   │   ├── theme.css
│   │   └── vars.css
│   └── js
│       ├── i18n.js
│       ├── loader.js
│       ├── main.js
│       ├── navigation.js
│       ├── scrollspy.js
│       ├── sitenavigation.js
│       ├── theme.js
│       └── utils.js
├── config
│   ├── languages.json
│   ├── site.json
│   └── theme.json
├── content
│   ├── deu_Latn
│   │   ├── home.json
│   │   ├── locale.json
│   │   ├── projects.json
│   │   └── publications.json
│   └── eng_Latn
│       ├── about.json
│       ├── events.json
│       ├── home.json
│       ├── literature.json
│       ├── locale.json
│       ├── portfolio.json
│       ├── projects.json
│       ├── publications.json
│       ├── research.json
│       ├── service.json
│       ├── supervision.json
│       ├── talks.json
│       ├── teaching.json
│       └── teachings
│           ├── LRMTSeminar2026.json
│           └── LRMTSeminarPapers.json
├── favicon.ico
├── index.html
└── README.md
```


## Script and File Guide

### /index.html
**Role:** The single static HTML entry point for the entire site. It provides the basic document structure, loads all CSS stylesheets, and includes JavaScript modules. All visible content (navigation and sections) is dynamically generated and injected by the scripts.

**CSS Dependencies:** Directly links to `reset.css`, `theme.css`, `layout.css`, and `hexagons.css`. `theme.css` works in tandem with `theme.js` (which applies values from `config/theme.json`). `hexagons.css` is primarily used by `navigation.js` for styling the hexagonal buttons.
**Injection Targets:** 
- `#navigation` (aside): Filled by `navigation.js` using data from `config/site.json` (or similar) and styled via `hexagons.css`.
- `#content` (main): Populated with sections by `loader.js` and/or `main.js`, using content from `/content/*` JSON files.
**Script Load Order:** Scripts are loaded sequentially (not deferred/async) to ensure dependencies are available:
- Early scripts (`utils.js`, `loader.js`) provide helpers and data loading.
- `theme.js` and `i18n.js` handle theming and translations.
- `navigation.js` and `scrollspy.js` build UI and interactivity.
- `main.js` likely ties everything together on load.

- No direct use of `/config` or `/content` files—handled indirectly via the JS modules.



### /assets/js/main.js
**Role:** The primary initialization script that orchestrates the site's setup in an asynchronous IIFE, handling config loading, theming, internationalization, navigation building, content population, language switching, and scrollspy activation.

**Dependencies on Other Modules:**
- **loader.js:** Calls `loader.loadConfig('site')`, `loader.loadConfig('languages')`, and `loader.loadContent(lang, secId)` multiple times to fetch JSON files from /config and /content directories. Expects these to return parsed JSON objects; handles errors with fallbacks.
- **theme.js:** Invokes `theme.loadTheme()` to fetch /config/theme.json and `theme.applyTheme(themeCfg)` to set CSS variables. If load fails, passes empty object.
- **i18n.js:** Uses `i18n.init(defaultLang)` to load locale.json, `i18n.t(key)` for translations, `i18n.setLanguage(lang)` in switcher clicks, and `i18n.applyTranslations()` to update data-i18n elements site-wide.
- **navigation.js:** Calls `navigation.buildNavigation(siteConfig)` with site.json data to inject hexagonal nav into #navigation (aside in index.html).
- **scrollspy.js:** Invokes `scrollspy.initScrollSpy()` after content is populated, relying on .page-section elements for observation.

**Interactions with DOM and CSS:**
- Injects into #content and #navigation from index.html.
- Creates elements with classes like 'page-section', 'section-body', 'project-grid', etc., which depend on layout.css and theme.css for styling.
- Special handling for 'projects' and 'publications' sections assumes specific JSON structures in content files.

**Config and Content Files:**
- Relies on /config/site.json for section order, /config/languages.json for available languages, /config/theme.json for styling.
- Loads /content/<lang>/locale.json via i18n, and /content/<lang>/<secId>.json for each section.

**Limitations/Noted Behaviors:**
- Language switch updates labels and headings but does not reload section content—[TODO: Confirm if full content reload is intended or if it's a feature gap].
- Error handling provides fallbacks but logs to console; user sees a simple error message.



### /assets/js/loader.js
**Role:** Provides centralized, cached JSON loading for all configuration and content files. Acts as the sole data-fetching layer, keeping other modules free of direct `fetch` calls. Exposes `loader.loadConfig` and `loader.loadContent` globally on `window.loader`.

**Used by Other Modules:**
- **main.js:** Heavily relies on both functions:
  - Calls `loadConfig('site')` and `loadConfig('languages')` during initialization
  - Calls `loadContent(currentLang, secId)` (with English fallback) for every section in `siteConfig.order`
  - Depends on errors being thrown to trigger fallback logic (e.g., placeholder content)
- **theme.js:** Expected to call `loadConfig('theme')` → [TODO: Confirm exact usage once theme.js is reviewed]
- No direct use by navigation.js, i18n.js, or scrollspy.js (they consume already-loaded data)

**Dependencies and Assumptions:**
- Must be loaded early in index.html (before main.js and any module needing data)
- Assumes all JSON files are valid and accessible at the constructed paths
- Uses in-memory caching only (no persistence across page reloads)
- Does not handle CORS or authentication — suitable for static GitHub Pages hosting

**Interaction with File Structure:**
- Reads from `/config/*.json` (site-wide settings)
- Reads from `/content/<lang>/*.json` (localized section content)
- No writing or modification of data — purely read-only



### /assets/js/theme.js
**Role:** Manages the site's visual theme by loading `config/theme.json` and applying its values as CSS custom properties on `:root`. Enables full design customization (colors, navigation width, hexagon size, content width) without modifying CSS files.

**Used by Other Modules:**
- **main.js:** Calls `theme.loadTheme()` to fetch the theme and immediately passes the result to `theme.applyTheme()`. This ensures theme is applied early in initialization, before navigation and content are rendered.

**Dependencies:**
- **loader.js:** Not directly used here — instead relies on `global.utils.fetchJsonNoCache` → [TODO: Verify if utils.js provides this function or if this is an inconsistency with loader.js approach]
- **CSS Files:** Directly affects `theme.css`, `layout.css`, and `hexagons.css` through the CSS variables it sets (e.g., `--bg`, `--nav-hex-bg`, `--hex-size`, `--nav-width`).

**Interaction with File Structure:**
- Reads `/config/theme.json` (expected to contain `colors` and `sizes` objects)
- No writing or caching beyond what the utility provides
- Safe fallback: If theme.json is missing or fails to load, applies empty object (CSS falls back to defaults in theme.css)

**Important Note:**
- Current implementation uses `utils.fetchJsonNoCache` instead of `loader.loadConfig('theme')`. This creates a minor inconsistency with the rest of the project (which uses loader.js). [TODO: Evaluate whether to migrate to loader.js for consistency and shared caching]



### /assets/js/utils.js
**Role:** Provides small, reusable helper functions shared across the project. Contains a DOM element builder (`el`) and a no-cache JSON fetcher (`fetchJsonNoCache`). Exposed as `window.utils` and must be the first script loaded in index.html.

**Used by Other Modules:**
- **theme.js:** Directly calls `global.utils.fetchJsonNoCache('config/theme.json')` in `loadTheme()`. This is the only current deviation from the centralized `loader.js` approach.
- **navigation.js:** Expected to heavily use `utils.el()` for building hexagonal navigation items and their structure → [TODO: Confirm extent once navigation.js reviewed]
- **main.js, i18n.js, scrollspy.js:** May use `utils.el()` if they create DOM elements dynamically (likely in language switcher or other UI additions).

**Dependencies and Project Impact:**
- No external dependencies — pure vanilla JS
- Critical load order: Must precede `theme.js` (due to fetchJsonNoCache) and any module using `el()`
- Creates minor inconsistency: `theme.js` uses this fetcher instead of `loader.loadConfig('theme')`, bypassing loader's caching → [TODO: Consider unifying under loader.js for consistency and shared cache]

**Interaction with File Structure:**
- Does not read or write files directly beyond fetching JSON via the helper
- Enables cleaner, more readable DOM construction throughout the codebase



### /assets/js/navigation.js
**Role:** Dynamically constructs the signature vertical hexagonal navigation bar using data from `site.json`. Generates a honeycomb-tiled list of interactive 3D hex buttons, each linking (via smooth scroll) to a content section. Handles keyboard navigation and integrates with i18n for localized labels.

**Used by Other Modules:**
- **main.js:** Calls `navigation.buildNavigation(siteConfig)` after i18n initialization to ensure translation keys are ready.
- **i18n.js:** Relies on `data-i18n` attributes on label elements — `i18n.applyTranslations()` will update visible text when language changes.
- **scrollspy.js:** Expected to add active highlighting (e.g., larger size + shine) to `.hex-item` or `.hex-btn` based on scroll position → [TODO: Confirm exact class targets once scrollspy.js reviewed]

**Dependencies:**
- **site.json (via main.js):** Provides `order` and `sections` array with `id`, `labelKey`, `kicker`
- **hexagons.css:** Critical — defines `.hex-list`, `.hex-item`, `.hex-btn`, layers, `.content`, `.shine`, animations, and honeycomb offsets using CSS variables like `--hex-size`
- **utils.js:** Currently not used directly, but could benefit from `utils.el()` for cleaner DOM creation → [TODO: Consider refactoring for consistency]

**Interaction with DOM:**
- Injects into `#navigation` (aside in index.html)
- Creates elements with classes heavily styled by `hexagons.css`
- Adds `data-target` and `data-i18n` attributes for external use (scrollspy, translations)

**Accessibility Features:**
- Buttons are focusable and keyboard-navigable
- Arrow key traversal with wrap-around
- `title` attribute fallback for tooltips


