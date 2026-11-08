// Enhancement for the language dropdown (templates/partials/language_selector.html):
// - closes the panel on a click outside of it and on Escape,
// - adds a search field that filters the grid by autonym, exonyms and code,
// - loads the full language list from languages.json when the page carries only part of it
//   (data-complete="false"), so pages stay small with thousands of languages.
// URL patterns, section and entity come from the page, so this file knows nothing about the site layout.

(function () {
  'use strict';

  const safe = /^[a-z0-9][a-z0-9-]*$/;

  function targetUrl(selector, patterns, code) {
    const section = selector.dataset.section;
    const entity = selector.dataset.entity;
    if (entity && safe.test(section) && safe.test(entity)) {
      return patterns.entity.replace('{language}', code).replace('{section}', section).replace('{entity}', entity);
    }
    if (section && safe.test(section) && section !== selector.dataset.defaultSection) {
      return patterns.section.replace('{language}', code).replace('{section}', section);
    }
    return patterns.default_section.replace('{language}', code);
  }

  function fillGrid(selector, grid, languages) {
    let patterns;
    try {
      patterns = JSON.parse(selector.dataset.patterns || '{}');
    } catch (error) {
      console.error('language-selector.js: data-patterns is not valid JSON.', error);
      return;
    }
    const items = languages.map(function (language) {
      const link = document.createElement('a');
      link.href = targetUrl(selector, patterns, language.code);
      link.hreflang = language.lang;
      link.lang = language.lang;
      link.dir = language.dir;
      link.textContent = language.autonym;
      if (language.code === selector.dataset.current) {
        link.setAttribute('aria-current', 'true');
      }
      const item = document.createElement('li');
      item.dataset.search = language.search;
      item.append(link);
      return item;
    });
    grid.replaceChildren.apply(grid, items);
  }

  function setUp(selector) {
    const grid = selector.querySelector('.language-grid');
    const filterRow = selector.querySelector('.language-filter-row');
    const filter = selector.querySelector('.language-filter');
    let loaded = selector.dataset.complete === 'true';

    if (filterRow && filter) {
      filterRow.hidden = false;
      filter.addEventListener('input', function () {
        const query = filter.value.trim().toLocaleLowerCase();
        grid.querySelectorAll('li').forEach(function (item) {
          item.hidden = query !== '' && !(item.dataset.search || '').includes(query);
        });
      });
    }

    selector.addEventListener('toggle', function () {
      if (!selector.open) {
        return;
      }
      if (filter) {
        filter.focus();
      }
      if (loaded) {
        return;
      }
      loaded = true;
      fetch(selector.dataset.languagesUrl)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('HTTP ' + response.status + ' for ' + selector.dataset.languagesUrl);
          }
          return response.json();
        })
        .then(function (languages) {
          fillGrid(selector, grid, languages);
          if (filter && filter.value) {
            filter.dispatchEvent(new Event('input'));
          }
        })
        .catch(function (error) {
          loaded = false;
          console.error('language-selector.js: the full language list could not be loaded, ' +
            'the dropdown keeps the languages of this page.', error);
        });
    });

    document.addEventListener('click', function (event) {
      if (selector.open && !selector.contains(event.target)) {
        selector.open = false;
      }
    });

    selector.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && selector.open) {
        selector.open = false;
        selector.querySelector('summary').focus();
      }
    });
  }

  document.querySelectorAll('.language-switcher').forEach(setUp);
})();
