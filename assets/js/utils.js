/* utils.js
   Collection of lightweight, reusable helper functions used across multiple modules.
   Exposed globally as `window.utils` to support the classic-script, non-module architecture.
   Provides:
     - el(): A concise DOM element builder for creating elements with attributes and children
     - fetchJsonNoCache(): A simple fetch wrapper for JSON files with enforced no-cache behavior
   This file must be loaded first in index.html as several other modules depend on these utilities.
*/

(function(global) {
  /**
   * Compact DOM element factory.
   * Creates an element with optional attributes and appends children (strings become text nodes).
   * Supports common shortcuts:
   *   - 'class' → sets className
   *   - 'html' → sets innerHTML
   *   - data-* and aria-* attributes via direct key names
   * Useful for reducing boilerplate in navigation.js and other DOM-building code.
   *
   * @param {string} tag - HTML tag name (e.g., 'div', 'section')
   * @param {Object} [attrs={}] - Key-value pairs for attributes
   * @param {...(Node|string|Array)} children - Child nodes, text strings, or arrays thereof
   * @returns {HTMLElement} The created element
   */
  function el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);

    // Apply attributes
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') {
        e.className = v;                    // className for string assignment
      } else if (k === 'html') {
        e.innerHTML = v;                    // Convenience for raw HTML injection
      } else if (k.startsWith('data-') || k.startsWith('aria-')) {
        e.setAttribute(k, v);               // Direct support for accessibility/data attributes
      } else {
        e.setAttribute(k, v);               // All other attributes (id, href, etc.)
      }
    }

    // Append children - flatten arrays and skip null/undefined
    children.flat().forEach(c => {
      if (c == null) return;
      if (typeof c === 'string') {
        e.appendChild(document.createTextNode(c));
      } else {
        e.appendChild(c);
      }
    });

    return e;
  }

  /**
   * Fetches a JSON file with explicit no-cache header.
   * Used primarily during development and to avoid stale GitHub Pages caching.
   * Throws on network or HTTP errors - callers handle fallbacks.
   *
   * @param {string} path - Relative path to the JSON file (e.g., 'config/theme.json')
   * @returns {Promise<Object>} Parsed JSON data
   */
  async function fetchJsonNoCache(path) {
    const response = await fetch(path, { cache: 'no-cache' });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${path} (${response.status})`);
    }

    return await response.json();
  }

  // Expose utilities globally for use by other scripts
  global.utils = {
    el,
    fetchJsonNoCache
  };
})(window);