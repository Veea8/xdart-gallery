(function () {
  'use strict';

  let allArtworks = [];
  let activeCollection = 'All';
  let activeYear = 'All';
  let selCollection, selYear;

  fetch('artworks.json')
    .then(r => r.json())
    .then(data => {
      allArtworks = data.artworks;
      init();
    })
    .catch(() => {
      document.getElementById('masonry').innerHTML =
        '<p style="color:var(--text2);padding:24px">Could not load artworks.</p>';
    });

  function init() {
    readHash();
    buildFilters();
    renderGrid();
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
    const masonry = document.getElementById('masonry');
    masonry.innerHTML = '';

    // Collect consecutive artworks into groups by gruppe value
    const groups = [];
    allArtworks.forEach(artwork => {
      const last = groups[groups.length - 1];
      if (last && last.gruppe === artwork.gruppe) {
        last.items.push(artwork);
      } else {
        groups.push({ gruppe: artwork.gruppe, items: [artwork] });
      }
    });

    groups.forEach((group, gi) => {
      const groupEl = document.createElement('div');
      groupEl.className = 'artwork-group';
      groupEl.dataset.gruppe = group.gruppe;

      group.items.forEach(artwork => {
        groupEl.appendChild(createItem(artwork));
      });

      masonry.appendChild(groupEl);

      // Separator between groups (not after the last)
      if (gi < groups.length - 1) {
        const sep = document.createElement('div');
        sep.className = 'group-sep';
        masonry.appendChild(sep);
      }
    });

    filterGrid();
  }

  function createItem(artwork) {
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.dataset.collection = artwork.collection;
    item.dataset.year = String(artwork.year);

    const img = document.createElement('img');
    img.src = artwork.image;
    img.alt = artwork.collection + ', ' + artwork.year;
    img.loading = 'lazy';

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

    return item;
  }

  // ── Filter ────────────────────────────────────────────────────
  function filterGrid() {
    // Filter individual items and track group visibility
    document.querySelectorAll('.artwork-group').forEach(group => {
      let anyVisible = false;
      group.querySelectorAll('.masonry-item').forEach(item => {
        const collOk = activeCollection === 'All' || item.dataset.collection === activeCollection;
        const yearOk = activeYear === 'All' || item.dataset.year === activeYear;
        const show = collOk && yearOk;
        item.classList.toggle('hidden', !show);
        if (show) anyVisible = true;
      });
      group.classList.toggle('hidden', !anyVisible);
    });

    // Hide all separators, then show one between each pair of consecutive visible groups
    document.querySelectorAll('.group-sep').forEach(sep => sep.classList.add('hidden'));

    const visibleGroups = Array.from(document.querySelectorAll('.artwork-group:not(.hidden)'));
    for (let i = 0; i < visibleGroups.length - 1; i++) {
      // Walk forward from visibleGroups[i] until we find a separator before visibleGroups[i+1]
      let el = visibleGroups[i].nextElementSibling;
      while (el && el !== visibleGroups[i + 1]) {
        if (el.classList.contains('group-sep')) {
          el.classList.remove('hidden');
          break;
        }
        el = el.nextElementSibling;
      }
    }
  }

})();
