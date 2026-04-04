/* navigation.js
   Responsible for dynamically building the vertical hexagonal navigation bar.
   Creates a honeycomb-tiled list of 3D-layered hexagonal buttons based on siteConfig.
   Injects the entire structure into <aside id="navigation"> from index.html.
   Key features:
     - Uses data from siteConfig (sections and order)
     - Supports localization via data-i18n attributes (labels updated by i18n.applyTranslations)
     - Smooth scrolling on click
     - Full keyboard navigation (arrow keys, Enter/Space)
     - Relies heavily on hexagons.css for styling and 3D effects
   Called by main.js after i18n.init() to ensure translation keys are available.
*/

(function(global) {
  /**
   * Builds the full hexagonal navigation UI.
   * Clears existing content in #navigation and populates it with hex buttons
   * corresponding to each section defined in siteConfig.
   *
   * @param {Object} siteConfig - Parsed site.json object containing:
   *   - order: Array of section IDs defining display order
   *   - sections: Array of section objects with at least { id, labelKey, kicker }
   */
  function buildNavigation(siteConfig) {
    const root = document.getElementById('navigation');
    if (!root) {
      console.warn('[nav] #navigation element not found in DOM');
      return;
    }
    root.innerHTML = '';  // Clear any previous content

    // Container for the honeycomb layout - styled in hexagons.css
    const list = document.createElement('div');
    list.className = 'hex-list';

    // Resolve ordered sections: use siteConfig.order if present, fallback to sections array
    const ordered = (siteConfig.order && Array.isArray(siteConfig.order))
      ? siteConfig.order.map(id => siteConfig.sections.find(s => s.id === id)).filter(Boolean)
      : siteConfig.sections || [];

    ordered.forEach(sec => {
      // Main wrapper for each hex - used for positioning and keyboard focus logic
      const item = document.createElement('div');
      item.className = 'hex-item';
      item.dataset.target = sec.id;  // Useful for potential scrollspy highlighting

      // Interactive button (focusable for accessibility)
      const btn = document.createElement('button');
      btn.className = 'hex-btn';
      btn.type = 'button';
      btn.title = sec.labelKey || sec.id;  // Tooltip fallback

      // 3D layered structure - purely stylistic, defined in hexagons.css
      const layerBottom = document.createElement('div');
      layerBottom.className = 'layer bottom';
      const layerMid = document.createElement('div');
      layerMid.className = 'layer mid';
      const layerTop = document.createElement('div');
      layerTop.className = 'layer top';
      btn.appendChild(layerBottom);
      btn.appendChild(layerMid);
      btn.appendChild(layerTop);

      // Content area inside the hexagon
      const content = document.createElement('div');
      content.className = 'content';

      // Section Icons
      const icon = document.createElement('div');
      icon.className = 'icon';
      icon.textContent = sec.icon;

      // // Optional kicker (e.g., initial letter or short prefix)
      // const kicker = document.createElement('div');
      // kicker.className = 'kicker';
      // kicker.textContent = sec.kicker || sec.id[0].toUpperCase();

      // Main label - marked with data-i18n for dynamic translation updates
      const label = document.createElement('div');
      label.className = 'label';
      label.setAttribute('data-i18n', sec.labelKey || sec.id);  // Key for i18n.t()

      // content.appendChild(kicker);
      content.appendChild(icon);
      content.appendChild(label);
      btn.appendChild(content);

      // Shine effect overlay - used for active state animation in hexagons.css
      const shine = document.createElement('div');
      shine.className = 'shine';
      btn.appendChild(shine);

      // Click handler - behaviour differs depending on whether we are on the
      // main landing page or a sub-page (e.g. #projects/TextAsCorpusRep).
      //
      // Landing page: smooth-scroll directly to the target section (existing behaviour).
      //
      // Sub-page: the target section doesn't exist in the DOM. Instead:
      //   1. Store the desired scroll target in sessionStorage.
      //   2. Clear the hash - this triggers a hashchange event that
      //      sitenavigation.handleRoute() handles, sees no subpage route,
      //      and calls location.reload() to rebuild the landing page.
      //   3. After reload, main.js / populateSections() reads sessionStorage
      //      and scrolls to the stored target.
      btn.addEventListener('click', () => {
        const hash = window.location.hash;
        const isSubpage = hash.length > 1 && hash.includes('/');

        if (isSubpage) {
          sessionStorage.setItem('scrollTarget', sec.id);
          // Navigating to an empty hash triggers sitenavigation's hashchange
          // listener, which detects the transition subpage → landing and reloads.
          window.location.hash = '';
        } else {
          const target = document.getElementById(sec.id);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });

      // Keyboard support:
      // - Enter/Space: trigger click
      // - Arrow keys: navigate between hexes (up/left = previous, down/right = next)
      btn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          btn.click();
        }
        if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
          ev.preventDefault();
          focusHex(item, 1);
        }
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
          ev.preventDefault();
          focusHex(item, -1);
        }
      });

      item.appendChild(btn);
      list.appendChild(item);
    });

    root.appendChild(list);
  }

  /**
   * Helper for keyboard navigation between hex items.
   * Focuses the next or previous .hex-btn in the list, wrapping around edges.
   *
   * @param {Element} current - The current .hex-item element
   * @param {number} dir - Direction: +1 for next, -1 for previous
   */
  function focusHex(current, dir) {
    const all = Array.from(document.querySelectorAll('.hex-item'));
    const idx = all.indexOf(current);
    const nextIdx = (idx + dir + all.length) % all.length;
    const nextItem = all[nextIdx];
    const nextBtn = nextItem && nextItem.querySelector('.hex-btn');
    if (nextBtn) nextBtn.focus();
  }

  // Expose globally for main.js to call
  global.navigation = {
    buildNavigation
  };
})(window);