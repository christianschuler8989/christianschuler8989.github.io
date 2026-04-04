/* sitenavigation.js
   Handles hash-based routing for standalone sub-pages (projects, seminar curricula, etc.)
   that live outside the main single-page scroll layout.

   Supported routes:
     #projects/<id>           → loads content/<lang>/projects/<id>.json
     #teachings/<seminarId>   → loads content/<lang>/teachings/<seminarId>.json
                                + content/<lang>/teachings/LRMTSeminarPapers.json

   Adding a new sub-page type:
     1. Add a startsWith check in handleRoute().
     2. Write a render*Page() method.
     That's it - the loader and createSection helper are shared.

   Navigation back to the landing page is handled entirely by the hex-nav buttons:
   clicking any hex-button while on a sub-page stores the target section in
   sessionStorage and clears the hash, triggering a reload back to the landing page.
   No back-link element is needed here.
*/

(function(global) {
  const siteNavigation = {
    currentView: null,

    async init() {
      window.addEventListener('hashchange', () => this.handleRoute());
      await this.handleRoute();
    },

    async handleRoute() {
      const hash = window.location.hash || '#';
      const mainContainer = document.getElementById('content');

      if (hash.startsWith('#projects/')) {
        // e.g. #projects/TextAsCorpusRep → path = "projects/TextAsCorpusRep"
        const projectPath = hash.substring(1);
        this.currentView = 'subpage';
        mainContainer.innerHTML = '<div class="loader">Loading project…</div>';
        await this.renderProjectPage(projectPath);

      } else if (hash.startsWith('#teachings/')) {
        // e.g. #teachings/LRMTSeminar2026
        const seminarId = hash.substring(1);
        this.currentView = 'subpage';
        mainContainer.innerHTML = '<div class="loader">Loading seminar curriculum…</div>';
        await this.renderSeminarPage(seminarId);

      } else {
        if (this.currentView === 'subpage') {
          // Returning to the main landing page - reload so main.js repopulates #content
          this.currentView = 'landing';
          location.reload();
        } else {
          this.currentView = 'landing';
        }
      }
    },

    // =========================================================================
    // PROJECT DETAIL PAGE
    // =========================================================================
    async renderProjectPage(projectPath) {
      const mainContainer = document.getElementById('content');
      const lang = (global.i18n && typeof global.i18n.getLanguage === 'function')
                   ? global.i18n.getLanguage()
                   : 'eng_Latn';

      try {
        const project = await global.loader.loadContent(lang, projectPath);
        mainContainer.innerHTML = '';

        // ── Project header section ─────────────────────────────────────────
        const headerSec = this.createSection(`project-${project.id}`, project.title);
        const headerBody = headerSec.querySelector('.section-body');

        if (project.subtitle) {
          const sub = document.createElement('p');
          sub.className = 'project-detail-subtitle';
          sub.textContent = project.subtitle;
          headerBody.appendChild(sub);
        }

        // Meta row: status badge · period
        const meta = document.createElement('div');
        meta.className = 'project-detail-meta';
        if (project.status) {
          const badge = document.createElement('span');
          badge.className = `project-status project-status--${project.status}`;
          badge.textContent = project.status;
          meta.appendChild(badge);
        }
        if (project.period) {
          const period = document.createElement('span');
          period.className = 'project-detail-period';
          period.innerHTML = `<span class="meta-icon" aria-hidden="true">📅</span>${project.period}`;
          meta.appendChild(period);
        }
        if (meta.childElementCount > 0) headerBody.appendChild(meta);

        // Tags
        if (project.tags && project.tags.length) {
          const tagRow = document.createElement('div');
          tagRow.className = 'tags';
          project.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            tagRow.appendChild(span);
          });
          headerBody.appendChild(tagRow);
        }

        // Collaborators
        if (project.collaborators && project.collaborators.length) {
          const collabHeading = document.createElement('h3');
          collabHeading.textContent = 'Collaborators';
          headerBody.appendChild(collabHeading);
          const collabList = document.createElement('ul');
          collabList.className = 'project-collaborators';
          project.collaborators.forEach(c => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${c.name}</strong>${c.role ? ` - ${c.role}` : ''}`;
            collabList.appendChild(li);
          });
          headerBody.appendChild(collabList);
        }

        // Links
        if (project.links && project.links.length) {
          const linksRow = document.createElement('div');
          linksRow.className = 'project-detail-links';
          project.links.forEach(l => {
            const a = document.createElement('a');
            a.href = l.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.className = 'project-detail-link';
            a.textContent = l.label;
            linksRow.appendChild(a);
          });
          headerBody.appendChild(linksRow);
        }

        mainContainer.appendChild(headerSec);

        // ── Content sections ───────────────────────────────────────────────
        (project.sections || []).forEach((block, idx) => {
          const secEl = this.createSection(
            `project-${project.id}-section-${idx}`,
            block.heading || null
          );
          const body = secEl.querySelector('.section-body');

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
            div.innerHTML = block.value;
            body.appendChild(div);
          } else if (block.type === 'images') {
            const gallery = document.createElement('div');
            gallery.className = (block.items || []).length > 1
              ? 'event-gallery'
              : 'event-gallery event-gallery--single';
            (block.items || []).forEach((img, imgIdx) => {
              const figure = document.createElement('figure');
              figure.className = imgIdx === 0
                ? 'event-figure event-figure--primary'
                : 'event-figure';
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
              gallery.appendChild(figure);
            });
            body.appendChild(gallery);
          }

          mainContainer.appendChild(secEl);
        });

        window.scrollTo(0, 0);

      } catch (err) {
        console.error('Project page load failed:', err);
        mainContainer.innerHTML =
          '<section class="page-section"><h1>Error</h1><p>Failed to load project details.</p></section>';
      }
    },

    // =========================================================================
    // SEMINAR PAGE
    // =========================================================================
    async renderSeminarPage(seminarPath) {
      const mainContainer = document.getElementById('content');
      const lang = (global.i18n && typeof global.i18n.getLanguage === 'function')
                   ? global.i18n.getLanguage()
                   : 'eng_Latn';

      try {
        const [syllabus, paperDb] = await Promise.all([
          global.loader.loadContent(lang, seminarPath),
          global.loader.loadContent(lang, 'teachings/LRMTSeminarPapers')
        ]);

        const paperMap = new Map(paperDb.papers.map(p => [p.id, p]));
        mainContainer.innerHTML = '';

        const gen = syllabus.general;
        const genSec = this.createSection('general-info', gen.title);
        const genBody = genSec.querySelector('.section-body');
        genBody.innerHTML = `
          <p><strong>${gen.subtitle}</strong></p>
          <ul>
            <li><strong>Instructor:</strong> ${gen.instructor}</li>
            <li><strong>Affiliation:</strong> ${gen.affiliation}</li>
            <li><strong>Version:</strong> ${gen.version} (${gen.last_updated})</li>
          </ul>
          <p><strong>${gen.firstsession.title}</strong></p>
          <ul>
            <li><strong>Date:</strong> ${gen.firstsession.date}</li>
            <li><strong>Time:</strong> ${gen.firstsession.time}</li>
            <li><strong>Place:</strong> ${gen.firstsession.place}</li>
          </ul>
          <p><strong>${gen.prerequisites.title}</strong></p>
          ${gen.prerequisites.info}
          <p><strong>${gen.coursecontent.title}</strong></p>
          ${gen.coursecontent.info}
          <p><strong>${gen.grading.title}</strong></p>
          ${gen.grading.info}
        `;
        mainContainer.appendChild(genSec);

        syllabus.sessions.forEach(session => {
          const sessSec = this.createSection(session.id, `Session ${session.session}: ${session.title}`);
          const sessBody = sessSec.querySelector('.section-body');
          if (session.header_question) {
            const bq = document.createElement('blockquote');
            bq.innerHTML = `<em>"${session.header_question}"</em>`;
            sessBody.appendChild(bq);
          }
          if (session.topic_summary) {
            const p = document.createElement('p');
            p.textContent = session.topic_summary;
            sessBody.appendChild(p);
          }
          this.appendPaperList(sessBody, 'Selected Reading', session.paper_ids, paperMap);
          this.appendPaperList(sessBody, 'Recommended Reading', session.recommended_paper_ids, paperMap);
          mainContainer.appendChild(sessSec);
        });

        window.scrollTo(0, 0);

      } catch (err) {
        console.error('Seminar load failed:', err);
        mainContainer.innerHTML =
          '<section class="page-section"><h1>Error</h1><p>Failed to load seminar materials.</p></section>';
      }
    },

    // ── Shared helpers ────────────────────────────────────────────────────────

    // Creates a <section> with a .section-body, mirroring the main.js structure.
    // Pass null for titleText to produce a section without a visible heading.
    createSection(id, titleText) {
      const secEl = document.createElement('section');
      secEl.id = id;
      secEl.className = 'page-section standalone-sub';
      if (titleText) {
        const h1 = document.createElement('h1');
        h1.textContent = titleText;
        secEl.appendChild(h1);
      }
      const body = document.createElement('div');
      body.className = 'section-body';
      secEl.appendChild(body);
      return secEl;
    },

    appendPaperList(container, label, ids, paperMap) {
      if (!ids || ids.length === 0) return;
      const heading = document.createElement('h3');
      heading.textContent = label;
      container.appendChild(heading);
      const ul = document.createElement('ul');
      ids.forEach(id => {
        const paper = paperMap.get(id);
        const li = document.createElement('li');
        if (paper) {
          li.innerHTML = `<a href="${paper.url}" target="_blank" rel="noopener"><strong>${paper.title}</strong></a> (${paper.reference_short}, ${paper.venue} ${paper.year})`;
        } else {
          li.textContent = `Missing paper data for ID: ${id}`;
        }
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }
  };

  global.siteNavigation = siteNavigation;
  if (document.readyState === 'complete') {
    siteNavigation.init();
  } else {
    window.addEventListener('load', () => siteNavigation.init());
  }
})(window);
