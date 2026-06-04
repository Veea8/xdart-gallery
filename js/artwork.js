(function () {
  'use strict';

  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  fetch('artworks.json')
    .then(r => r.json())
    .then(data => {
      const artwork = data.artworks.find(a => a.id === id);
      if (!artwork) { showError(); return; }
      render(artwork);
    })
    .catch(showError);

  function render(a) {
    document.title = a.collection + ' — xdart gallery';

    // Back link: preserve gallery filter via referrer hash
    const backLink = document.getElementById('back-link');
    if (document.referrer && document.referrer.startsWith(location.origin) && document.referrer.includes('#')) {
      backLink.href = '/#' + document.referrer.split('#')[1];
    } else {
      backLink.href = '/';
    }

    // Main image
    const mainImg = document.getElementById('main-img');
    mainImg.addEventListener('load', function () { this.classList.add('loaded'); });
    mainImg.src = a.image;
    mainImg.alt = a.collection + ', ' + a.year;

    // Thumbnails
    const strip = document.getElementById('thumb-strip');
    if (a.roomImage) {
      const t1 = document.getElementById('thumb-artwork');
      const t2 = document.getElementById('thumb-room');
      t1.src = a.image;
      t1.alt = 'Artwork photo';
      t2.src = a.roomImage;
      t2.alt = 'Room view';
      t1.classList.add('active');

      [t1, t2].forEach(thumb => {
        thumb.addEventListener('click', () => {
          mainImg.classList.add('fading');
          setTimeout(() => {
            mainImg.src = thumb.src;
            mainImg.onload = () => mainImg.classList.remove('fading');
          }, 180);
          t1.classList.toggle('active', thumb === t1);
          t2.classList.toggle('active', thumb === t2);
        });
      });
    } else {
      strip.classList.add('hidden');
    }

    // Details
    document.getElementById('artwork-collection').textContent = a.collection;
    document.getElementById('artwork-year').textContent = a.year;
    document.getElementById('detail-medium').textContent = a.medium;

    const { height, width, depth, unit } = a.dimensions;
    let dim;
    if (a.dimensions.round) {
      dim = 'Ø ' + height + ' ' + unit;
    } else {
      dim = height + ' × ' + width;
      if (depth) dim += ' × ' + depth;
      dim += ' ' + unit;
    }
    document.getElementById('detail-dimensions').textContent = dim;

    document.getElementById('detail-content').style.display = '';
  }

  function showError() {
    document.getElementById('detail-content').style.display = 'none';
    document.getElementById('error-msg').style.display = '';
  }

})();
