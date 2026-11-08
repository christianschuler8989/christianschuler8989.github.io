// Enhancement: interlocks the hexagonal navigation buttons of every .hex-nav list as a honeycomb.
// Without JavaScript the buttons sit in plain rows (assets/css/hexagons.css), so nothing breaks.
//
// The grid of .hex-nav.is-honeycomb has tracks a quarter hexagon wide and half a hexagon high.
// A hexagon spans 4 x 2 tracks, the next column starts 3 tracks later, and odd columns sit one
// track lower, so neighbours interlock. As many columns as fit the width, spread evenly over the
// needed number of bands.

(function () {
  'use strict';

  function layout(list) {
    const items = Array.from(list.children);
    if (items.length === 0 || !list.isConnected) {
      return;
    }
    const hexWidth = parseFloat(getComputedStyle(list).getPropertyValue('--nav-hex-width'));
    if (!(hexWidth > 0)) {
      console.error('honeycomb.js: the CSS custom property --nav-hex-width is missing or not a length in px.');
      return;
    }
    // n columns need (0.75 n + 0.25) hexagon widths.
    const fitting = Math.max(1, Math.floor((list.clientWidth / hexWidth - 0.25) / 0.75));
    const bands = Math.ceil(items.length / Math.min(fitting, items.length));
    const columns = Math.ceil(items.length / bands);

    items.forEach(function (item, index) {
      const column = index % columns;
      const band = Math.floor(index / columns);
      item.style.gridColumn = (column * 3 + 1) + ' / span 4';
      item.style.gridRow = (band * 2 + (column % 2) + 1) + ' / span 2';
    });
  }

  function watch(list) {
    list.classList.add('is-honeycomb');
    let width = -1;
    const observer = new ResizeObserver(function () {
      if (list.clientWidth !== width) {
        width = list.clientWidth;
        layout(list);
      }
    });
    observer.observe(list);
  }

  document.querySelectorAll('.hex-nav').forEach(watch);
})();
