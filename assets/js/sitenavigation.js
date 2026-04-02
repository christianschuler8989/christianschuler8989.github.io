/* sitenavigation.js
   Updated to handle dual-JSON fetching for Seminar content.
   Integrates syllabus structure with paper-specific metadata.
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
      const isSeminarPage = hash.startsWith('#teachings/');

      if (isSeminarPage) {
        const seminarId = hash.substring(1); // e.g., "teachings/LRMTSeminar2026"
        this.currentView = 'subpage';
        mainContainer.innerHTML = '<div class="loader">Loading seminar curriculum...</div>';
        await this.renderSeminarPage(seminarId);
      } else {
        if (this.currentView === 'subpage') {
          this.currentView = 'landing';
          location.reload(); 
        } else {
          this.currentView = 'landing';
        }
      }
    },

    async renderSeminarPage(seminarPath) {
      const mainContainer = document.getElementById('content');
      const lang = (global.i18n && typeof global.i18n.getLanguage === 'function') 
                   ? global.i18n.getLanguage() 
                   : 'eng_Latn';

      try {
        // Step 1: Concurrent fetch of Syllabus and Paper Database
        // loader.loadContent handles the "content/lang/path.json" structure
        const [syllabus, paperDb] = await Promise.all([
          global.loader.loadContent(lang, seminarPath),
          global.loader.loadContent(lang, 'teachings/LRMTSeminarPapers')
        ]);

        // Create a Map for O(1) paper lookups by ID
        const paperMap = new Map(paperDb.papers.map(p => [p.id, p]));

        mainContainer.innerHTML = '';

        // Step 2: Render General Information Section
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
                <li><strong>Data:</strong> ${gen.firstsession.date}</li>
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

        // // Step 3: Render Additional Information Sections
        // const prereq = syllabus.prerequisites;
        // const prereqSec = this.createSection('prerequisites-info', prereq.title);
        // const prereqBody = prereqSec.querySelector('.section-body');
        
        // prereqBody.innerHTML = `
        //     <p><strong>${prereq.subtitle}</strong></p>
        //     <ul>
        //         <li>${prereq.info}</li>
        //     </ul>
        // `;
        // mainContainer.appendChild(prereqSec);

        // Step 4: Render Sessions
        syllabus.sessions.forEach(session => {
          const sessSec = this.createSection(session.id, `Session ${session.session}: ${session.title}`);
          const sessBody = sessSec.querySelector('.section-body');

          // Header Question & Summary
          if (session.header_question) {
            const blockquote = document.createElement('blockquote');
            blockquote.innerHTML = `<em>"${session.header_question}"</em>`;
            sessBody.appendChild(blockquote);
          }

          if (session.topic_summary) {
            const summary = document.createElement('p');
            summary.textContent = session.topic_summary;
            sessBody.appendChild(summary);
          }

          // Step 4: Render Paper Lists
          this.appendPaperList(sessBody, "Selected Reading", session.paper_ids, paperMap);
          this.appendPaperList(sessBody, "Recommended Reading", session.recommended_paper_ids, paperMap);

          mainContainer.appendChild(sessSec);
        });

        window.scrollTo(0, 0);

      } catch (err) {
        console.error("Seminar load failed:", err);
        mainContainer.innerHTML = '<section class="page-section"><h1>Error</h1><p>Failed to load seminar materials.</p></section>';
      }
    },

    // Helper: Creates a section mimicking main.js structure
    createSection(id, titleText) {
      const secEl = document.createElement('section');
      secEl.id = id;
      secEl.className = 'page-section standalone-sub';
      
      const h1 = document.createElement('h1');
      h1.textContent = titleText;
      secEl.appendChild(h1);

      const body = document.createElement('div');
      body.className = 'section-body';
      secEl.appendChild(body);
      
      return secEl;
    },

    // Helper: Maps IDs to Paper objects and renders a list
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