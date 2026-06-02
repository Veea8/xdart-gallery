# xdart gallery

Art gallery website for Xuan Dung Burckhardt, hosted at **gallery.xdart.ch** (subdomain of xdart.ch).

## Stack

Plain HTML / CSS / JS — no framework, no build step. All artwork data lives in `artworks.json`.

## Run locally

```
npx serve .
```

Must be served over HTTP (not opened as a `file://` URL) because the JS uses `fetch()` to load `artworks.json`.

## File structure

```
index.html          Gallery page
artwork.html        Artwork detail page (?id=between-layers-N)
about.html          About / exhibition text
contact.html        Contact (mailto: info@xdart.ch)
artworks.json       Single source of truth for all artworks
css/
  main.css          Shared styles, header, footer, back-to-top button
  gallery.css       Filter bar, group grid, square tiles, group separators
  artwork.css       Detail page layout, image toggle
js/
  main.js           Shared: nav toggle, footer year, back-to-top
  gallery.js        Load artworks, render groups, filter by collection/year
  artwork.js        Load single artwork by ?id=, image swap, dimensions
images/
  logo.svg          Header logo (SVG)
  artworks/         Web-optimised images for detail page (max 1800px, ~82% JPEG)
  thumbs/           Square thumbnails for gallery grid (600×600px, ~80% JPEG)
  rooms/            Room-context images (optional, shown as second image on detail page)
```

## artworks.json schema

```json
{
  "id": "between-layers-1",
  "year": 2025,
  "medium": "Mixed Media on Canvas",
  "dimensions": { "height": 100, "width": 80, "depth": null, "unit": "cm" },
  "collection": "Between Layers",
  "gruppe": 1,
  "image": "images/artworks/between-layers-1.jpg",
  "roomImage": null
}
```

- `gruppe` — integer grouping number; artworks with the same value appear together, separated by a thin line in the gallery
- `dimensions.round: true` — set instead of `width` for round canvases; displays as `Ø 50 cm`
- `roomImage` — set to `null` if no room photo exists; hides the thumbnail toggle on the detail page

## Adding new artworks

**Option A — manually:**
1. Add entry to `artworks.json` following the schema above
2. Drop web image into `images/artworks/` and thumbnail into `images/thumbs/`

**Option B — from Excel (recommended for bulk import):**

Excel columns: `Bild` (number), `Jahr`, `Mass in cm H/B/T` (cols C/D/E), `Material`, `Gruppe`

```bash
pip install openpyxl Pillow
python import_artworks.py   # see script below
```

The import script:
- Reads the Excel file
- Matches images from source folder by number prefix (e.g. `32_something.jpg` → artwork 32)
- Generates web images (max 1800px, JPEG 82%) into `images/artworks/`
- Generates square thumbnails (600×600px, JPEG 80%) into `images/thumbs/`
- Writes sorted `artworks.json` (sorted by `gruppe`, then by artwork number within group)

See conversation history for the full script — it lives in the project as an ad-hoc Python command, not a committed file yet.

## Design

- **Aesthetic:** Clean & minimal, ivory palette
- **Fonts:** Cormorant Garamond (headings) + Jost (body/UI) — loaded from Google Fonts
- **Colours:** `--bg: #F3ECE0`, `--surface: #FAF6EE`, `--text: #2A1800`, `--text2: #8A7055`, `--accent: #A8803C`, `--border: #DDD0BA`
- **Gallery layout:** CSS Grid (4 → 3 → 2 → 1 columns), fills left-to-right; artworks sorted by `gruppe` in JSON
- **Group separation:** thin `var(--border)` line with 32px margin between groups
- **Thumbnails:** square crop (`object-fit: cover`)
- **Filtering:** two `<select>` dropdowns — Collection and Year; both filter simultaneously (AND logic); state stored in URL hash

## Current collection

**Between Layers** — 65 artworks in 8 groups, years 2020 / 2025 / 2026

## GitHub

Private repo: `https://github.com/Veea8/xdart-gallery`

```bash
git add .
git commit -m "description"
git push
```
