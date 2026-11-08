// Enhancement: filters the cards of a collection by year and keywords.
// The filters aside (templates/asides/filters.html) stays hidden without JavaScript, so visitors
// without it see the full list. A card stays visible when it matches the chosen year (or no year
// is chosen) and carries at least one of the checked keywords (or none is checked).
// The count text comes from the page (data-count-text), so no visible text lives in this file.

(function () {
  'use strict';

  document.querySelectorAll('.filters[data-filter-target]').forEach(function (panel) {
    const collection = document.getElementById(panel.dataset.filterTarget);
    if (!collection) {
      console.error('filters.js: no collection with id "' + panel.dataset.filterTarget + '".');
      return;
    }
    const cards = Array.from(collection.querySelectorAll('.card'));
    const groups = Array.from(collection.querySelectorAll('.collection-group'));
    const yearSelect = panel.querySelector('.filter-year');
    const boxes = Array.from(panel.querySelectorAll('.filter-keywords input[type="checkbox"]'));
    const count = panel.querySelector('.filter-count');
    const reset = panel.querySelector('.filter-reset');
    const countText = panel.dataset.countText || '{shown} / {total}';

    const keywordsOf = new Map(cards.map(function (card) {
      try {
        return [card, JSON.parse(card.dataset.keywords || '[]')];
      } catch (error) {
        console.error('filters.js: data-keywords of a card is not valid JSON.', error);
        return [card, []];
      }
    }));

    function apply() {
      const year = yearSelect ? yearSelect.value : '';
      const wanted = boxes.filter(function (box) { return box.checked; }).map(function (box) { return box.value; });
      let shown = 0;
      cards.forEach(function (card) {
        const yearOk = !year || card.dataset.year === year;
        const keywordsOk = wanted.length === 0 || keywordsOf.get(card).some(function (k) { return wanted.includes(k); });
        card.hidden = !(yearOk && keywordsOk);
        if (!card.hidden) {
          shown += 1;
        }
      });
      groups.forEach(function (group) {
        group.hidden = !group.querySelector('.card:not([hidden])');
      });
      if (count) {
        count.textContent = countText.replace('{shown}', String(shown)).replace('{total}', String(cards.length));
      }
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    boxes.forEach(function (box) { box.addEventListener('change', apply); });
    if (reset) {
      reset.addEventListener('click', function () {
        if (yearSelect) {
          yearSelect.value = '';
        }
        boxes.forEach(function (box) { box.checked = false; });
        apply();
      });
    }
    panel.hidden = false;
    apply();
  });
})();
