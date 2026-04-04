/* loader.js
   Centralized data loading module for all JSON files in the project.
   Provides simple in-memory caching to prevent redundant network requests during page load.
   Exposes two main functions via a global `window.loader` object:
     - loadConfig(name): Loads files from /config/<name>.json (e.g., site.json, theme.json, languages.json)
     - loadContent(lang, section): Loads content files from /content/<lang>/<section>.json
   Designed to be lightweight, reusable, and early-loaded (before other modules that need data).
   Errors are intentionally propagated to callers (e.g., main.js) for custom fallback handling.
*/

(function(global) {
  // Private in-memory cache object to store successfully fetched and parsed JSON data
  // Key: full relative path (string), Value: parsed JSON object
  // Prevents multiple fetches of the same file during initialization
  const CACHE = {};

  // Core private function: fetches and parses JSON from a given relative path
  // Implements caching and basic error handling
  async function loadJSON(path) {
    // Return cached data if already loaded successfully
    if (CACHE[path]) {
      return CACHE[path];
    }

    try {
      // Fetch with no-cache to ensure fresh data during development (GitHub Pages may cache aggressively otherwise)
      const response = await fetch(path, { cache: 'no-cache' });

      // Throw if HTTP status indicates failure (e.g., 404, 500)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${path}`);
      }

      // Parse JSON response
      const data = await response.json();

      // Store in cache for subsequent calls
      CACHE[path] = data;

      return data;
    } catch (err) {
      // Do not catch or swallow errors - let callers (e.g., main.js) handle fallbacks gracefully
      // This allows specific recovery strategies per file type
      throw err;
    }
  }

  // Public function: Load configuration files from the /config directory
  // Used for site.json, languages.json, theme.json
  async function loadConfig(name) {
    return loadJSON(`config/${name}.json`);
  }

  // Public function: Load language- and section-specific content files
  // Path pattern: content/<lang>/<section>.json (e.g., content/eng_Latn/projects.json)
  async function loadContent(lang, section) {
    return loadJSON(`content/${lang}/${section}.json`);
  }

  // Expose the loader API globally as `window.loader`
  // This allows other scripts (loaded after this one) to access it without import systems
  global.loader = {
    loadConfig,
    loadContent
  };
})(window);