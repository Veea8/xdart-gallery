(function () {
  'use strict';

  let allArtworks = [];
  let activeCollection = 'All';
  let activeYear = 'All';
  let selCollection, selYear;
  let resizeTimer;

  fetch('artworks.json')
    .then(r => r.json())
    .then(data => {
      allArtworks = data.artworks;
      init();
    })
    .catch(() => {
      document.querySelector('.masonry').innerHTML =
        '<p style="color:var(--text2);padding:24px">Could not load artworks.</p>';
    });

  function init() {
    readHash();
    buildFilters();
    renderGrid();
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutMasonry, 120);
    });
    window.addEventListener('hashchange', () => {
      readHash();
      updateSelects();
      filterGrid();
    });
  }

  // ── Hash helpers ──────────────────────────────────────────────
  function readHash() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    activeCollection = params.get('collection') || 'All';
    activeYear       = params.get('year') || 'All';
  }

  function writeHash() {
    const params = new URLSearchParams();
    if (activeCollection !== 'All') params.set('collection', activeCollection);
    if (activeYear !== 'All')       params.set('year', activeYear);
    const str = params.toString();
    history.replaceState(null, '', str ? '#' + str : location.pathname);
  }

  // ── Filter selects ────────────────────────────────────────────
  function buildFilters() {
    const bar = document.getElementById('filter-bar');
    const collections = ['All', ...new Set(allArtworks.map(a => a.collection).sort())];
    const years = ['All', ...[...new Set(allArtworks.map(a => String(a.year)))].sort((a, b) => b - a)];

    selCollection = buildSelect('sel-collection', 'Collection', collections, activeCollection, val => {
      activeCollection = val;
      writeHash();
      filterGrid();
    });
    selYear = buildSelect('sel-year', 'Year', years, activeYear, val => {
      activeYear = val;
      writeHash();
      filterGrid();
    });

    bar.appendChild(selCollection.group);
    bar.appendChild(selYear.group);
  }

  function buildSelect(id, label, values, activeValue, onChange) {
    const group = document.createElement('div');
    group.className = 'filter-select-group';

    const lbl = document.createElement('label');
    lbl.className = 'filter-label';
    lbl.setAttribute('for', id);
    lbl.textContent = label;

    const wrap = document.createElement('div');
    wrap.className = 'select-wrap';

    const sel = document.createElement('select');
    sel.className = 'filter-select';
    sel.id = id;

    values.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      if (v === activeValue) opt.selected = true;
      sel.appendChild(opt);
    });

    sel.addEventListener('change', () => onChange(sel.value));
    wrap.appendChild(sel);
    group.appendChild(lbl);
    group.appendChild(wrap);
    return { group, sel };
  }

  function updateSelects() {
    if (selCollection) selCollection.sel.value = activeCollection;
    if (selYear)       selYear.sel.value = activeYear;
  }

  // ── Grid render ───────────────────────────────────────────────
  function renderGrid() {
    const grid = document.getElementById('masonry');
    grid.innerHTML = '';

    allArtworks.forEach(artwork => {
      const item = document.createElement('div');
      item.className = 'masonry-item';
      item.dataset.collection = artwork.collection;
      item.dataset.year = String(artwork.year);

      // Store width/height aspect ratio for mathematical layout
      const d = artwork.dimensions;
      const ar = d.round ? 1 : (d.width && d.height ? d.width / d.height : 1);
      item.dataset.ar = ar;

      const img = document.createElement('img');
      img.src = artwork.image;
      img.alt = artwork.collection + ', ' + artwork.year;
      img.loading = 'lazy';
      // Aspect ratio reserves correct space before images load
      img.style.aspectRatio = d.round ? '1' : (d.width + ' / ' + d.height);

      const overlay = document.createElement('div');
      overlay.className = 'masonry-overlay';
      overlay.innerHTML =
        '<span class="ov-collection">' + artwork.collection + '</span>' +
        '<span class="ov-year">' + artwork.year + '</span>';

      item.appendChild(img);
      item.appendChild(overlay);
      item.addEventListener('click', () => {
        location.href = 'artwork.html?id=' + encodeURIComponent(artwork.id);
      });

      grid.appendChild(item);
    });

    filterGrid();
  }

  function filterGrid() {
    document.querySelectorAll('.masonry-item').forEach(item => {
      const collOk = activeCollection === 'All' || item.dataset.collection === activeCollection;
      const yearOk = activeYear === 'All' || item.dataset.year === activeYear;
      item.classList.toggle('hidden', !(collOk && yearOk));
    });
    layoutMasonry();
  }

  // ── Masonry layout — left-to-right fill, tight packing ────────
  function getNumCols() {
    const w = window.innerWidth;
    if (w >= 1200) return 4;
    if (w >= 768)  return 3;
    if (w >= 480)  return 2;
    return 1;
  }

  function layoutMasonry() {
    const grid = document.getElementById('masonry');
    const items = Array.from(grid.querySelectorAll('.masonry-item:not(.hidden)'));

    if (!items.length) { grid.style.height = '0'; return; }

    const numCols = getNumCols();
    const gap     = window.innerWidth < 480 ? 10 : 16;
    const cs      = getComputedStyle(grid);
    const padL    = parseFloat(cs.paddingLeft);
    const padB    = parseFloat(cs.paddingBottom);
    const avail   = grid.clientWidth - padL - parseFloat(cs.paddingRight);
    const colW    = (avail - gap * (numCols - 1)) / numCols;

    const colH = new Array(numCols).fill(0);

    items.forEach((item, i) => {
      const col  = i % numCols;
      const ar   = parseFloat(item.dataset.ar) || 1;
      // height = width / aspect-ratio + 2px for top+bottom border
      const itemH = colW / ar + 2;

      item.style.position = 'absolute';
      item.style.width    = colW + 'px';
      item.style.left     = (padL + col * (colW + gap)) + 'px';
      item.style.top      = colH[col] + 'px';

      colH[col] += itemH + gap;
    });

    grid.style.height = (Math.max(...colH) - gap + padB) + 'px';
  }

})();
