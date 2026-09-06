# RSM STONE DESIGN — website (v3)

## Latest fixes
- **Broken logo, fixed for good.** It was showing as alt text because
  the `assets/logo.png` file wasn't uploaded/kept alongside the HTML
  when you deployed — a very common static-site slip. The logo is now
  embedded directly inside every HTML page as base64 (see `__LOGO_SRC__`
  in `gen.py` / `assets/logo_b64.txt`), so there's no separate image
  file that can go missing. `assets/logo.png` is still included for
  your own reference (e.g. printing, other materials).
- **More hover feedback** across the site: the logo, nav links, cart/
  hamburger icons, buttons, category tiles, contact cards and footer
  links all now lift, scale, or change color on hover.
- **Livelier home page background** — the hero now has a soft multi-
  color glow (green, navy, and a warm amber accent) plus a subtle grid
  texture, and the glow follows your mouse as you move over it.
- **Placeholder photo slots now match real product cards** — same
  photo box, name, price, and Order Now / Add to Cart buttons — just
  shown as "Coming soon" with the buttons disabled until you fill the
  slot with a real product in `script.js`.


## What changed in this update
1. **Logo placed** — extracted from `RSM_stone.pdf` and saved as
   `assets/logo.png` (transparent background), used in the header and
   footer of every page.
2. **Light theme** — background is white/off-white, with the site's
   color palette pulled directly from the logo:
   - Navy `#2E358C` (the "R"/"M")
   - Green `#2EA248` (the "S")
   - Near-black `#231F20` for body text
3. **Navbar** now shows visible links (Home, About us, Designs, Contact)
   next to the logo, **and** keeps the hamburger for the full menu
   (Home, About us, Category → Men/Women/Kids/Our Designs/Raw Materials,
   Contact & Address). On narrow/mobile screens the visible links hide
   automatically and the hamburger becomes the only nav, which is
   standard responsive behaviour.

Everything from the previous update is unchanged: multi-page structure,
cart with correct quantity × price totals, and the order form that
posts to a Google Sheet.

## Files
- `index.html` … `contact.html` — the 8 pages
- `assets/logo.png` — your logo, transparent background
- `style.css` — all styling (light theme)
- `script.js` — menu, cart, product rendering, order form
- `apps-script.gs` — backend that turns orders into spreadsheet rows
- `gen.py` — regenerates the 8 HTML files from shared templates (only
  needed if you want to add/edit pages later; not required to run the site)

## 1. Connect the order form to a live spreadsheet

1. Create a Google Sheet at [sheets.google.com](https://sheets.google.com).
2. **Extensions → Apps Script**, paste in `apps-script.gs`.
3. **Deploy → New deployment** → Web app → Execute as **Me** → Access:
   **Anyone**. Deploy and authorize.
4. Copy the Web app URL (ends `/exec`) into `script.js`:
   ```js
   const ORDER_ENDPOINT = "https://script.google.com/macros/s/XXXXXXXX/exec";
   ```
5. Test an order — a row appears in your "Orders" sheet in a couple of
   seconds. Export to `.xlsx` any time via File → Download.

## 2. Add your real products and photos

Edit the `PRODUCTS` array near the top of `script.js`. Cards currently
show a line-art icon; once you have real photos, add an `img` field and
I can wire the card template to show it.

## 3. Update contact details

Edit `contact.html`, and the phone/email in the hamburger menu footer
(appears on every page — search `menu-overlay__foot`, or edit `gen.py`
and re-run it to update every page at once).

## 4. Replacing the logo later

Drop a new file at `assets/logo.png` (same filename) and every page
picks it up automatically — no HTML edits needed.

## 5. Hosting

Static site, no server required — Netlify/Vercel (drag-and-drop),
GitHub Pages, or any regular web host.
