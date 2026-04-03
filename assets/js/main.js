/* main.js
   Orchestrates the entire site's initialization in a single async IIFE.

   Structure:
     Steps 1–5  — Config, theme, i18n, navigation (setup; order matters)
     Renderer registry — One named function per structured section type,
                         looked up by section ID inside populateSections().
                         Adding a new section type = write a render*() function
                         and register it in the `renderers` map. Nothing else changes.
     populateSections(lang) — Clears #content, iterates siteConfig.order,
                              runs generic block renderer then registry renderer per section.
     Steps 7+   — Language switcher (attached to document.body)
*/

(async function() {
  try {

    // =========================================================================
    // STEP 1 — Core configuration
    // =========================================================================
    const siteConfig = await loader.loadConfig('site');
    const languagesConfig = await loader.loadConfig('languages').catch(() => ({
      defaultLanguage: 'eng_Latn',
      available: [{ code: 'eng_Latn' }]
    }));

    // =========================================================================
    // STEP 2 — Theme
    // =========================================================================
    const themeCfg = await theme.loadTheme().catch(() => ({}));
    theme.applyTheme(themeCfg);

    // =========================================================================
    // STEP 3 — Default language
    // =========================================================================
    const defaultLang = languagesConfig.defaultLanguage || 'eng_Latn';

    // =========================================================================
    // STEP 4 — Internationalization
    // =========================================================================
    await i18n.init(defaultLang);

    // =========================================================================
    // STEP 5 — Navigation
    // i18n.init() calls applyTranslations() before nav elements exist in the DOM,
    // so labels would be empty on first load. Calling it again after buildNavigation()
    // ensures all data-i18n attributes are resolved immediately.
    // =========================================================================
    navigation.buildNavigation(siteConfig);
    i18n.applyTranslations(); // Fix: populate nav labels on first load

    // =========================================================================
    // RENDERER REGISTRY
    //
    // Each renderer is a pure function: (contentData, container) => void
    //   - contentData : the parsed JSON object for this section
    //   - container   : the .section-body <div> to append rendered elements into
    //
    // The generic block renderer (paragraph / list / html from contentData.sections)
    // always runs first for every section. Registry renderers handle the structured
    // contentData.items array for section types that need richer presentation.
    //
    // To add a new section type:
    //   1. Write a render*() function below.
    //   2. Add one line to the `renderers` map at the bottom of this block.
    //   That's it — populateSections() picks it up automatically.
    // =========================================================================

    // --- Publications --------------------------------------------------------
    // Sorted descending by date/year. Each entry: linked title + author/year/venue meta.
    function renderPublications(data, container) {
      if (!Array.isArray(data.items) || data.items.length === 0) return;

      const list = document.createElement('div');
      list.className = 'pub-list';

      const sorted = data.items.slice()
        .sort((a, b) => new Date(b.date || b.year) - new Date(a.date || a.year));

      sorted.forEach(p => {
        const item = document.createElement('div');
        item.className = 'pub-item';

        const titleRow = document.createElement('div');
        titleRow.className = 'pub-title';
        const link = document.createElement('a');
        link.href = p.url || '#';
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = p.title;
        titleRow.appendChild(link);
        item.appendChild(titleRow);

        const meta = document.createElement('div');
        meta.className = 'pub-meta';
        meta.textContent =
          `${(p.authors || []).join(', ')} — (${p.year || ''}) — ${p.venue || ''}`;
        item.appendChild(meta);

        list.appendChild(item);
      });

      container.appendChild(list);
    }

    // --- Projects ------------------------------------------------------------
    // Grid of cards: title, summary paragraph, tag pills.
    // (Will gain a detail-page link in a future step once the two-tier
    //  project architecture is in place.)
    function renderProjects(data, container) {
      if (!Array.isArray(data.items) || data.items.length === 0) return;

      const grid = document.createElement('div');
      grid.className = 'project-grid';

      data.items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'project-card';

        const title = document.createElement('strong');
        title.textContent = item.title;
        card.appendChild(title);

        const summary = document.createElement('div');
        summary.className = 'project-summary';
        summary.textContent = item.summary;
        card.appendChild(summary);

        if (item.tags && item.tags.length) {
          const tagRow = document.createElement('div');
          tagRow.className = 'tags';
          item.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            tagRow.appendChild(span);
          });
          card.appendChild(tagRow);
        }

        grid.appendChild(card);
      });

      container.appendChild(grid);
    }

// --- Events --------------------------------------------------------------
// Renders a chronological (descending) list of event entries.
//
// Expected structure per item in events.json — all fields optional unless marked (required):
//
//   id          (required) — stable string identifier
//   title       (required) — display name of the event
//   subtitle              — short descriptive sub-title
//   url                   — link to the event's homepage
//   date_start  (required) — ISO date string "YYYY-MM-DD"
//   date_end              — ISO date string; if absent or equal to date_start → single day
//   languages             — array of spoken language strings, e.g. ["English", "German"]
//   roles       (required) — array of role strings, e.g. ["Presenter"], ["Attendee"]
//                            Drives the colour-coded role badges via CSS class role-<slug>.
//                            See layout.css for supported variants; add new rows freely.
//   location              — object { name, city, country, url }
//   description           — factual overview paragraph
//   personal_note         — informal/personal comment (rendered distinctly)
//   images                — array of { file, alt, caption }
//                           file is relative to assets/images/events/ on the server.
//                           caption may be null.
//   presentations         — array of presentation sub-entries (see below)
//   resources             — array of { label, url } — event-level links (e.g. proceedings)
//
// Per presentation object:
//   type         — e.g. "Poster Presentation", "Paper Presentation", "Pitch Session", "Award"
//   title
//   description
//   related_project_ids      — array of project IDs (for future cross-linking)
//   related_publication_ids  — array of publication IDs (for future cross-linking)
//   image        — optional { file, alt, caption }
//   resources    — array of { label, url }

function renderEvents(data, container) {
  if (!Array.isArray(data.items) || data.items.length === 0) return;

  const list = document.createElement('div');
  list.className = 'event-list';

  // Sort descending by date_start
  const sorted = data.items.slice()
    .sort((a, b) => new Date(b.date_start) - new Date(a.date_start));

  sorted.forEach(ev => {
    const item = document.createElement('article');
    item.className = 'event-item';
    item.id = `event-${ev.id}`;

    // ── Title bar ──────────────────────────────────────────────────────────
    const titleBar = document.createElement('div');
    titleBar.className = 'event-title-bar';

    // Linked or plain title
    const titleEl = document.createElement(ev.url ? 'a' : 'span');
    titleEl.className = 'event-title';
    if (ev.url) {
      titleEl.href = ev.url;
      titleEl.target = '_blank';
      titleEl.rel = 'noopener';
    }
    titleEl.textContent = ev.title;
    titleBar.appendChild(titleEl);

    if (ev.subtitle) {
      const subtitleEl = document.createElement('span');
      subtitleEl.className = 'event-subtitle';
      subtitleEl.textContent = ev.subtitle;
      titleBar.appendChild(subtitleEl);
    }
    item.appendChild(titleBar);

    // ── Meta row: date · location · languages · role badges ───────────────
    const meta = document.createElement('div');
    meta.className = 'event-meta';

    // Date — single day vs. range
    if (ev.date_start) {
      const fmt = d => new Date(d).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const dateText = (ev.date_end && ev.date_end !== ev.date_start)
        ? `${fmt(ev.date_start)} – ${fmt(ev.date_end)}`
        : fmt(ev.date_start);

      const dateEl = document.createElement('span');
      dateEl.className = 'event-meta-item event-date';
      dateEl.innerHTML = `<span class="meta-icon" aria-hidden="true">📅</span>${dateText}`;
      meta.appendChild(dateEl);
    }

    // Location
    if (ev.location) {
      const parts = [ev.location.name, ev.location.city, ev.location.country].filter(Boolean);
      const locationEl = document.createElement('span');
      locationEl.className = 'event-meta-item event-location';
      const icon = `<span class="meta-icon" aria-hidden="true">📍</span>`;
      if (ev.location.url) {
        locationEl.innerHTML = `${icon}<a href="${ev.location.url}" target="_blank" rel="noopener">${parts.join(', ')}</a>`;
      } else {
        locationEl.innerHTML = `${icon}${parts.join(', ')}`;
      }
      meta.appendChild(locationEl);
    }

    // Languages
    if (ev.languages && ev.languages.length) {
      const langEl = document.createElement('span');
      langEl.className = 'event-meta-item event-languages';
      langEl.innerHTML = `<span class="meta-icon" aria-hidden="true">📝</span>${ev.languages.join(' & ')}`;
      meta.appendChild(langEl);
    }

    // Role badges (one per role, colours via CSS class)
    if (ev.roles && ev.roles.length) {
      const badgeGroup = document.createElement('span');
      badgeGroup.className = 'event-role-group';
      ev.roles.forEach(role => {
        const slug = role.toLowerCase().replace(/\s+/g, '-');
        const badge = document.createElement('span');
        badge.className = `event-role role-${slug}`;
        badge.textContent = role;
        badgeGroup.appendChild(badge);
      });
      meta.appendChild(badgeGroup);
    }

    item.appendChild(meta);

    // ── Description ────────────────────────────────────────────────────────
    if (ev.description) {
      const desc = document.createElement('p');
      desc.className = 'event-description';
      desc.textContent = ev.description;
      item.appendChild(desc);
    }

    // ── Primary image + additional images gallery ──────────────────────────
    // First image = primary (wider); rest form a small gallery row below.
    if (ev.images && ev.images.length) {
      const galleryEl = document.createElement('div');
      galleryEl.className = ev.images.length > 1 ? 'event-gallery' : 'event-gallery event-gallery--single';

      ev.images.forEach((img, idx) => {
        const figure = document.createElement('figure');
        figure.className = idx === 0 ? 'event-figure event-figure--primary' : 'event-figure';

        const imgEl = document.createElement('img');
        imgEl.src = `pictures/${img.file}`;
        imgEl.alt = img.alt || '';
        imgEl.loading = 'lazy';
        figure.appendChild(imgEl);

        if (img.caption) {
          const cap = document.createElement('figcaption');
          cap.textContent = img.caption;
          figure.appendChild(cap);
        }

        galleryEl.appendChild(figure);
      });

      item.appendChild(galleryEl);
    }

    // ── Presentations ──────────────────────────────────────────────────────
    if (ev.presentations && ev.presentations.length) {
      const presSection = document.createElement('div');
      presSection.className = 'event-presentations';

      ev.presentations.forEach(pres => {
        const presEl = document.createElement('div');
        presEl.className = 'event-presentation';

        // Header: type badge + title
        const presHeader = document.createElement('div');
        presHeader.className = 'event-pres-header';

        const typeSlug = pres.type.toLowerCase().replace(/\s+/g, '-');
        const typeBadge = document.createElement('span');
        typeBadge.className = `event-pres-type pres-type-${typeSlug}`;
        typeBadge.textContent = pres.type;
        presHeader.appendChild(typeBadge);

        const presTitleEl = document.createElement('span');
        presTitleEl.className = 'event-pres-title';
        presTitleEl.textContent = pres.title;
        presHeader.appendChild(presTitleEl);
        presEl.appendChild(presHeader);

        // Presentation image + description side by side when both present
        const presBody = document.createElement('div');
        presBody.className = 'event-pres-body';

        if (pres.image) {
          const figure = document.createElement('figure');
          figure.className = 'event-pres-figure';
          const imgEl = document.createElement('img');
          imgEl.src = `pictures/${pres.image.file}`;
          imgEl.alt = pres.image.alt || '';
          imgEl.loading = 'lazy';
          figure.appendChild(imgEl);
          if (pres.image.caption) {
            const cap = document.createElement('figcaption');
            cap.textContent = pres.image.caption;
            figure.appendChild(cap);
          }
          presBody.appendChild(figure);
        }

        if (pres.description) {
          const presDesc = document.createElement('p');
          presDesc.className = 'event-pres-desc';
          presDesc.textContent = pres.description;
          presBody.appendChild(presDesc);
        }
        presEl.appendChild(presBody);

        // Presentation-level resource links
        if (pres.resources && pres.resources.length) {
          presEl.appendChild(buildResourceLinks(pres.resources));
        }

        presSection.appendChild(presEl);
      });

      item.appendChild(presSection);
    }

    // ── Event-level resource links ──────────────────────────────────────────
    if (ev.resources && ev.resources.length) {
      item.appendChild(buildResourceLinks(ev.resources));
    }

    // ── Personal note ──────────────────────────────────────────────────────
    if (ev.personal_note) {
      const note = document.createElement('p');
      note.className = 'event-personal-note';
      note.innerHTML = `<span class="meta-icon" aria-hidden="true"></span>${ev.personal_note}`;
      item.appendChild(note);
    }

    list.appendChild(item);
  });

  container.appendChild(list);
}

// Helper: renders a row of labelled anchor links
function buildResourceLinks(resources) {
  const row = document.createElement('div');
  row.className = 'event-resources';
  resources.forEach((res, idx) => {
    if (idx > 0) {
      const sep = document.createElement('span');
      sep.className = 'event-resource-sep';
      sep.textContent = '|';
      row.appendChild(sep);
    }
    const link = document.createElement('a');
    link.href = res.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = res.label;
    row.appendChild(link);
  });
  return row;
}

    // Registry map — the only place that needs editing when adding a new section type.
    const renderers = {
      publications: renderPublications,
      projects:     renderProjects,
      events:       renderEvents,
    };

    // =========================================================================
    // SECTION POPULATION
    // =========================================================================
    async function populateSections(lang) {
      const mainContainer = document.getElementById('content');
      mainContainer.innerHTML = '';

      for (const secId of siteConfig.order) {
        let contentData;
        try {
          contentData = await loader.loadContent(lang, secId);
        } catch (e) {
          try {
            contentData = await loader.loadContent('eng_Latn', secId);
          } catch (e2) {
            contentData = {
              title: secId,
              sections: [{ type: 'paragraph', value: 'Content not yet available.' }]
            };
          }
        }

        const secEl = document.createElement('section');
        secEl.id = secId;
        secEl.className = 'page-section';

        // Section heading — prefer locale.json key, fall back to JSON title or raw ID
        const h1 = document.createElement('h1');
        const localizedTitle = i18n.t(`sections.${secId}.title`);
        h1.textContent =
          (localizedTitle && localizedTitle !== `sections.${secId}.title`)
            ? localizedTitle
            : (contentData.title || secId);
        secEl.appendChild(h1);

        const body = document.createElement('div');
        body.className = 'section-body';

        // 1. Generic block renderer — paragraph / list / html from contentData.sections
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
            div.innerHTML = block.value; // Ensure block.value is sanitized before use
            body.appendChild(div);
          }
        });

        // 2. Registry renderer — handles structured contentData.items
        const renderer = renderers[secId];
        if (renderer) renderer(contentData, body);

        secEl.appendChild(body);
        mainContainer.appendChild(secEl);
      }

      // Reinitialise scrollspy so it observes the freshly rebuilt section elements
      scrollspy.initScrollSpy();
    }

    // Initial render
    await populateSections(defaultLang);

    // =========================================================================
    // STEP 7 — Language switcher
    // Attached to document.body (not #navigation) — it is positioned fixed in
    // the top-right corner via layout.css and is independent of the sidebar.
    // =========================================================================
    let languagesCfg = { available: [{ code: 'eng_Latn' }], defaultLanguage: defaultLang };
    try {
      languagesCfg = await loader.loadConfig('languages');
    } catch (e) { /* keep fallback */ }

    const langBox = document.createElement('div');
    langBox.className = 'language-switcher';

    languagesCfg.available.forEach(lang => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = lang.code.split('_')[0].toUpperCase(); // 'ENG', 'DEU', …
      btn.dataset.lang = lang.code;
      btn.addEventListener('click', async () => {
        await i18n.setLanguage(lang.code);
        i18n.applyTranslations();           // Update nav labels + any data-i18n elements
        await populateSections(lang.code);  // Re-fetch and re-render all section content
      });
      langBox.appendChild(btn);
    });

    document.body.appendChild(langBox);

  } catch (err) {
    console.error('Fatal error during site initialization:', err);
    const c = document.getElementById('content');
    if (c) c.innerHTML =
      '<p style="color:tomato">Failed to initialize site — see console for details.</p>';
  }
})();
