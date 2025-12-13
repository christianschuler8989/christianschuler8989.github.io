/* main.js
   The central orchestrator script that initializes the entire site in a step-by-step manner.
   It coordinates the loading and application of configurations, themes, translations, navigation,
   content population, language switching, and scrollspy functionality.
   This script runs as an Immediately Invoked Function Expression (IIFE) to encapsulate its scope
   and ensure asynchronous operations are handled properly without polluting the global namespace.
   Assumes script load order from index.html: utils.js and loader.js must be available first for data fetching,
   followed by theme.js, i18n.js, navigation.js, and scrollspy.js.
*/

(async function() {
  try {
    // Step 1: Load core site configuration (site.json) and languages configuration (languages.json)
    // Uses loader.loadConfig, which fetches from /config/<name>.json
    const siteConfig = await loader.loadConfig('site');
    const languagesConfig = await loader.loadConfig('languages').catch(() => ({
      defaultLanguage: 'eng_Latn',  // Fallback to English if languages.json fails to load
      available: [{ code: 'eng_Latn' }]
    }));

    // Step 2: Load and apply theme
    // Relies on theme.loadTheme to fetch /config/theme.json; applies CSS variables via theme.applyTheme
    // If theme fails, proceeds with empty object (defaults to browser styles or fallback CSS)
    const themeCfg = await theme.loadTheme().catch(() => ({}));
    theme.applyTheme(themeCfg);

    // Step 3: Determine initial language
    // Prefers default from languages.json; falls back to 'eng_Latn'
    const defaultLang = languagesConfig.defaultLanguage || 'eng_Latn';

    // Step 4: Initialize internationalization
    // Calls i18n.init to load /content/<lang>/locale.json and set up translation functions
    // This enables i18n.t() for lookups and prepares for data-i18n attribute applications
    await i18n.init(defaultLang);

    // Step 5: Build the navigation bar
    // Uses navigation.buildNavigation with siteConfig (defines sections/order); applies data-i18n for labels
    // Injects into #navigation (aside) in index.html; styled by hexagons.css and layout.css
    navigation.buildNavigation(siteConfig);

    // Step 6: Dynamically populate main content sections
    // Clears and rebuilds #content (main) in index.html based on siteConfig.order
    // For each section ID, loads /content/<lang>/<id>.json via loader.loadContent
    // Falls back to English if lang-specific file missing; creates placeholder if all fail
    const mainContainer = document.getElementById('content');
    mainContainer.innerHTML = ''; // Clear any existing content (though typically empty on load)

    for (const secId of siteConfig.order) {
      let contentData;
      try {
        contentData = await loader.loadContent(defaultLang, secId);
      } catch (e) {
        // Explicit fallback to English content
        try {
          contentData = await loader.loadContent('eng_Latn', secId);
        } catch (e2) {
          // Ultimate fallback: Generate a simple placeholder object
          contentData = { title: secId, sections: [{ type: 'paragraph', value: 'Content not yet available.' }] };
        }
      }

      // Create section element with ID for scrollspy targeting
      const secEl = document.createElement('section');
      secEl.id = secId;
      secEl.className = 'page-section';  // Styled via layout.css

      // Section heading: Prefer translated title from locale.json via i18n.t
      // Fallback to contentData.title or raw secId
      const h1 = document.createElement('h1');
      const localizedTitle = i18n.t(`sections.${secId}.title`);
      h1.textContent = (localizedTitle && localizedTitle !== `sections.${secId}.title`) ? localizedTitle : (contentData.title || secId);
      secEl.appendChild(h1);

      // Body container for content blocks
      const body = document.createElement('div');
      body.className = 'section-body';  // Styled via layout.css

      // Render generic blocks (paragraph, list, html) from contentData.sections
      (contentData.sections || []).forEach(block => {
        if (block.type === 'paragraph') {
          const p = document.createElement('p');
          p.textContent = block.value;
          body.appendChild(p);
        } else if (block.type === 'list') {
          const ul = document.createElement('ul');
          (block.items || []).forEach(it => {
            const li = document.createElement('li');
            li.textContent = it;
            ul.appendChild(li);
          });
          body.appendChild(ul);
        } else if (block.type === 'html') {
          const div = document.createElement('div');
          div.innerHTML = block.value;  // Caution: Ensure block.value is sanitized to prevent XSS
          body.appendChild(div);
        }
      });

      // Special rendering for 'projects' section: Grid of cards with title, summary, tags
      // Assumes contentData.items array; styles via layout.css (project-grid, project-card, tags, tag)
      if (secId === 'projects' && Array.isArray(contentData.items)) {
        const grid = document.createElement('div');
        grid.className = 'project-grid';
        contentData.items.forEach(item => {
          const card = document.createElement('div');
          card.className = 'project-card';
          card.appendChild(Object.assign(document.createElement('strong'), { textContent: item.title }));
          card.appendChild(Object.assign(document.createElement('div'), { textContent: item.summary }));
          if (item.tags && item.tags.length) {
            const tags = document.createElement('div');
            tags.className = 'tags';
            item.tags.forEach(t => {
              const tg = document.createElement('span');
              tg.className = 'tag';
              tg.textContent = t;
              tags.appendChild(tg);
            });
            card.appendChild(tags);
          }
          grid.appendChild(card);
        });
        body.appendChild(grid);
      }

      // Special rendering for 'publications' section: Sorted list of items with links, meta
      // Sorts by date/year descending; styles via layout.css (pub-list, pub-item, pub-title, pub-meta)
      if (secId === 'publications' && Array.isArray(contentData.items)) {
        const list = document.createElement('div');
        list.className = 'pub-list';
        const pubs = (contentData.items || []).slice().sort((a, b) => new Date(b.date || b.year) - new Date(a.date || a.year));
        pubs.forEach(p => {
          const it = document.createElement('div');
          it.className = 'pub-item';
          const title = document.createElement('div');
          title.className = 'pub-title';
          const a = document.createElement('a');
          a.href = p.url || '#';
          a.target = '_blank';
          a.rel = 'noopener';  // Security: Prevents tabnabbing
          a.textContent = p.title;
          title.appendChild(a);
          it.appendChild(title);
          it.appendChild(Object.assign(document.createElement('div'), { 
            className: 'pub-meta', 
            textContent: `${(p.authors || []).join(', ')} - (${p.year || ''}) - ${p.venue || ''}` }));
          list.appendChild(it);
        });
        body.appendChild(list);
      }

      secEl.appendChild(body);
      mainContainer.appendChild(secEl);
    }

    // Step 7: Add language switcher to navigation
    // Reloads languages.json if needed; creates buttons in #navigation
    // On click: Calls i18n.setLanguage to switch locale, then i18n.applyTranslations for data-i18n elements
    // Also updates section headings dynamically if translations available
    // Note: Does not reload content JSONs—only updates labels/headings; full content switch would require re-populating sections
    let languagesCfg = { available: [{ code: 'eng_Latn' }], defaultLanguage: defaultLang };
    try {
      languagesCfg = await loader.loadConfig('languages');
    } catch (e) { /* Keep fallback */ }

    const navRoot = document.getElementById('navigation');
    const langBox = document.createElement('div');
    langBox.className = 'language-switcher';  // Styled via layout.css or theme.css
    languagesCfg.available.forEach(lang => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = lang.code.split('_')[0].toUpperCase();  // e.g., 'ENG' from 'eng_Latn'
      btn.dataset.lang = lang.code;
      btn.addEventListener('click', async () => {
        await i18n.setLanguage(lang.code);
        // Re-apply translations to all data-i18n elements (e.g., nav labels)
        i18n.applyTranslations();
        // Update section headings if locale.json has sections.<id>.title
        document.querySelectorAll('.page-section').forEach(secEl => {
          const id = secEl.id;
          const localizedTitle = i18n.t(`sections.${id}.title`);
          if (localizedTitle && localizedTitle !== `sections.${id}.title`) {
            secEl.querySelector('h1').textContent = localizedTitle;
          }
        });
      });
      langBox.appendChild(btn);
    });
    navRoot.appendChild(langBox);

    // Step 8: Initialize scrollspy for navigation highlighting and smooth scrolling
    // Must be called after sections are in DOM; interacts with #navigation and .page-section elements
    scrollspy.initScrollSpy();

  } catch (err) {
    // Global error handler: Logs to console and displays user-friendly message in #content
    console.error('Fatal error during site initialization:', err);
    const c = document.getElementById('content');
    if (c) c.innerHTML = '<p style="color:tomato">Failed to initialize site — see console for details</p>';
  }
})();