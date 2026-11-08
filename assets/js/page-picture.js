// Enhancement: shows a random picture of the section's picture set in the page picture hexagon.
// The build tool writes the set into data-picture-set and places one picture statically, so the
// page has a picture without JavaScript too.

(function () {
  'use strict';

  document.querySelectorAll('.page-picture[data-picture-set]').forEach(function (figure) {
    let pictures;
    try {
      pictures = JSON.parse(figure.dataset.pictureSet);
    } catch (error) {
      console.error('page-picture.js: data-picture-set is not valid JSON.', error);
      return;
    }
    const image = figure.querySelector('img');
    if (!Array.isArray(pictures) || pictures.length === 0 || !image) {
      return;
    }
    const picture = pictures[Math.floor(Math.random() * pictures.length)];
    image.src = picture.src;
    image.alt = picture.alt;
  });
})();
