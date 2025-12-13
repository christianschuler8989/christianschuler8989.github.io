/* theme.js
   Enhanced version that:
   1. Loads theme.json
   2. Applies ALL variables (colors, layout, spacing, etc.) to :root
   3. Computes derived values (hex-width, nav-width) in JavaScript
   4. Injects everything at once to avoid cascading issues
*/

(function(global) {
  
  /**
   * Loads theme configuration from /config/theme.json
   */
  async function loadTheme() {
    try {
      const response = await fetch('/config/theme.json');
      if (!response.ok) throw new Error('Theme config not found');
      return await response.json();
    } catch (e) {
      console.warn('[theme] Could not load theme.json:', e);
      return null;
    }
  }

  /**
   * Applies theme to :root CSS variables
   * CRITICAL: This computes derived values in JS to avoid CSS calc() chaining issues
   */
  function applyTheme(themeCfg) {
    if (!themeCfg) {
      console.warn('[theme] No theme config provided, using defaults');
      return;
    }

    const root = document.documentElement;
    const vars = {};

    // 1. LAYOUT VARIABLES (direct from theme.json)
    if (themeCfg.layout) {
      Object.entries(themeCfg.layout).forEach(([key, value]) => {
        vars[`--${key}`] = value;
      });
    }

    // 2. COLOR VARIABLES
    if (themeCfg.colors) {
      Object.entries(themeCfg.colors).forEach(([key, value]) => {
        vars[`--${key}`] = value;
      });
    }

    // 3. SPACING VARIABLES
    if (themeCfg.spacing) {
      Object.entries(themeCfg.spacing).forEach(([key, value]) => {
        vars[`--${key}`] = value;
      });
    }

    // 4. ANIMATION VARIABLES
    if (themeCfg.animation) {
      Object.entries(themeCfg.animation).forEach(([key, value]) => {
        vars[`--${key}`] = value;
      });
    }

    // 5. COMPUTE DERIVED VALUES (in JavaScript to avoid CSS calc chaining)
    const hexSize = parseFloat(themeCfg.layout?.['hex-size'] || '110');
    const hexGap = parseFloat(themeCfg.layout?.['hex-gap'] || '4');
    
    // Hex geometry
    const hexHeight = hexSize;
    const hexWidth = hexSize * 1.1547; // Standard flat-topped hex ratio
    
    // Navigation width for honeycomb layout:
    // base (1 hex) + indent (0.75 hex) + padding (40px total)
    const navWidth = hexWidth * 1.75 + 40;
    
    // Add computed values
    vars['--hex-height'] = `${hexHeight}px`;
    vars['--hex-width'] = `${hexWidth}px`;
    vars['--nav-width'] = `${navWidth}px`;

    // 6. APPLY ALL VARIABLES TO :root AT ONCE
    Object.entries(vars).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });

    console.log('[theme] Applied CSS variables:', vars);
  }

  /**
   * Gets current value of a CSS variable
   */
  function getThemeVar(varName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${varName}`)
      .trim();
  }

  // Expose API
  global.theme = {
    loadTheme,
    applyTheme,
    getThemeVar
  };

})(window);

// Pre-Claude fix for navigation bar

// /* theme.js
//    Handles loading and applying the site's visual theme from config/theme.json.
//    Maps theme values to CSS custom properties (variables) on :root for global styling.
//    Exposes two functions via a global `window.theme` object:
//      - applyTheme(themeObject): Directly applies a theme object to CSS variables
//      - loadTheme(): Convenience async helper that fetches and returns theme.json (with warning on failure)
//    Note: This module depends on a global `utils.fetchJsonNoCache` helper — [TODO: Confirm existence and signature in utils.js]
//    Designed to be loaded early so that theme is applied before content rendering.
// */

// (function(global) {
//   /**
//    * Applies a theme object to document-root CSS custom properties.
//    * Only sets properties that exist in the theme object — skips missing ones silently.
//    * Expected structure:
//    * {
//    *   colors: { bg, surface, text, muted, primary, accent, navHexBg },
//    *   sizes: { navWidth, hexSize, contentMaxWidth }
//    * }
//    * @param {Object} theme - The parsed theme.json object
//    */
//   function applyTheme(theme) {
//     if (!theme || typeof theme !== 'object') return;

//     const c = theme.colors || {};
//     const s = theme.sizes || {};
//     const root = document.documentElement.style;

//     // Color variables — used across theme.css, layout.css, hexagons.css
//     if (c.bg) root.setProperty('--bg', c.bg);
//     if (c.surface) root.setProperty('--surface', c.surface);
//     if (c.text) root.setProperty('--text', c.text);
//     if (c.muted) root.setProperty('--muted', c.muted);
//     if (c.primary) root.setProperty('--primary', c.primary);
//     if (c.accent) root.setProperty('--accent', c.accent);
//     if (c.navHexBg) root.setProperty('--nav-hex-bg', c.navHexBg);

//     // Size/layout variables — critical for navigation honeycomb layout and content width
//     if (s.navWidth) root.setProperty('--nav-width', s.navWidth);
//     if (s.hexSize) root.setProperty('--hex-size', s.hexSize);
//     if (s.contentMaxWidth) root.setProperty('--content-max-width', s.contentMaxWidth);
//   }

//   /**
//    * Asynchronously loads theme.json from /config/theme.json
//    * Uses a utility function from utils.js to fetch without browser caching.
//    * Returns parsed object on success; empty object on failure (with console warning).
//    * @returns {Promise<Object>} Theme data or empty fallback
//    */
//   async function loadTheme() {
//     try {
//       // Relies on global utils.fetchJsonNoCache — a wrapper around fetch + json() with no-cache
//       const theme = await global.utils.fetchJsonNoCache('config/theme.json');
//       return theme;
//     } catch (err) {
//       console.warn('[theme] Could not load theme.json — using fallback defaults', err);
//       return {};
//     }
//   }

//   // Expose API globally as window.theme for use by main.js and potentially others
//   global.theme = {
//     applyTheme,
//     loadTheme
//   };
// })(window);