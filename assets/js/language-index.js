// Enhancement for the language index page (templates/languages.html):
// - a search field that filters the list by autonym, exonyms and code,
// - links that lead back to the section (and entity) the visitor came from, given as
//   ?section=<id>&entity=<id> by the "All languages" link of every page.
// URL patterns come from the page (data-patterns), so this file knows nothing about the site layout.

(function () {
  'use strict';

  const main = document.querySelector('.language-index');
  if (!main) {
    return;
  }

  let patterns = {};
  try {
    patterns = JSON.parse(main.dataset.patterns || '{}');
  } catch (error) {
    console.error('language-index.js: data-patterns is not valid JSON.', error);
  }

  const params = new URLSearchParams(window.location.search);
  const section = params.get('section');
  const entity = params.get('entity');
  const safe = /^[a-z0-9][a-z0-9-]*$/;

  function target(code) {
    if (section && entity && safe.test(section) && safe.test(entity) && patterns.entity) {
      return patterns.entity.replace('{language}', code).replace('{section}', section).replace('{entity}', entity);
    }
    if (section && safe.test(section) && section !== main.dataset.defaultSection && patterns.section) {
      return patterns.section.replace('{language}', code).replace('{section}', section);
    }
    return null;
  }

  const items = Array.from(main.querySelectorAll('.language-index-list li'));
  items.forEach(function (item) {
    const link = item.querySelector('a[data-code]');
    const href = link ? target(link.dataset.code) : null;
    if (href) {
      link.href = href;
    }
  });

  const searchBox = main.querySelector('.language-search');
  const input = main.querySelector('#language-search');
  if (searchBox && input) {
    searchBox.hidden = false;
    input.addEventListener('input', function () {
      const query = input.value.trim().toLocaleLowerCase();
      items.forEach(function (item) {
        item.hidden = query !== '' && !(item.dataset.search || '').includes(query);
      });
    });
  }
})();
