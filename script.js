/* ============================================================
   RSM STONE DESIGN — site script
   ============================================================ */

/* ------------------------------------------------------------
   0. CONFIG — paste your Google Apps Script Web App URL here.
      See apps-script.gs + README.md for setup instructions.
   ------------------------------------------------------------ */
const ORDER_ENDPOINT = "https://script.google.com/macros/s/XXXXXXXX/exec"; // e.g. "https://script.google.com/macros/s/AKfycbxxxx/exec"

/* ------------------------------------------------------------
   1. Product data — replace image/name/price with real products.
      Add an "img" field (e.g. "images/basalt-tee.jpg") once you have
      a real photo for an item — it will render in place of the icon.
   ------------------------------------------------------------ */
const PRODUCTS = [
  { id: "m01", name: "Basalt Crewneck Tee",     category: "men",   price: 850,  type: "tee" },
  { id: "m02", name: "Quarry Overshirt",        category: "men",   price: 2200, type: "jacket" },
  { id: "m03", name: "Granite Cargo Trouser",   category: "men",   price: 1750, type: "pants" },
  { id: "m04", name: "Slate Zip Hoodie",        category: "men",   price: 1950, type: "hoodie" },

  { id: "w01", name: "Sandstone Wrap Dress",    category: "women", price: 2400, type: "dress" },
  { id: "w02", name: "Marble Knit Top",         category: "women", price: 1100, type: "tee" },
  { id: "w03", name: "Chalk Wide-Leg Pant",     category: "women", price: 1850, type: "pants" },
  { id: "w04", name: "Verdigris Denim Jacket",  category: "women", price: 2600, type: "jacket" },

  { id: "k01", name: "Pebble Graphic Tee",      category: "kids",  price: 550,  type: "tee" },
  { id: "k02", name: "Little Boulder Hoodie",   category: "kids",  price: 950,  type: "hoodie" },
  { id: "k03", name: "Mini Mason Joggers",      category: "kids",  price: 800,  type: "pants" },

  { id: "d01", name: "Signature Quarry Set",       category: "designs", price: 3200, type: "jacket" },
  { id: "d02", name: "Limited Stone Capsule Tee",  category: "designs", price: 1200, type: "tee" },
  { id: "d03", name: "Custom Fit Statement Piece", category: "designs", price: 2800, type: "dress" },
];

/* How many photo slots each category page shows — used products fill
   the first slots, the rest render as empty "add a photo" placeholders
   so it's obvious how much room is left. */
const CATEGORY_CAPACITY = { men: 10, women: 10, kids: 10, designs: 20 };
const MATERIALS_CAPACITY = 20;

const ICONS = {
  tee: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M22 8 L10 16 L14 26 L20 22 L20 56 L44 56 L44 22 L50 26 L54 16 L42 8 C42 12 38 15 32 15 C26 15 22 12 22 8 Z"/></svg>`,
  hoodie: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 10 C20 10 14 9 12 16 L8 24 L15 27 L18 21 L18 56 L46 56 L46 21 L49 27 L56 24 L52 16 C50 9 44 10 44 10 C44 10 39 18 32 18 C25 18 20 10 20 10 Z"/><path d="M25 12 C25 12 28 22 32 22 C36 22 39 12 39 12"/></svg>`,
  jacket: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M24 8 L12 15 L16 27 L20 23 L20 57 L32 57 L32 30 L32 57 L44 57 L44 23 L48 27 L52 15 L40 8 L32 16 Z"/><path d="M32 16 L32 57"/></svg>`,
  pants: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M18 8 L46 8 L47 30 L52 56 L42 56 L34 30 L32 30 L30 56 L20 56 L18 30 Z"/><path d="M18 8 L46 8"/></svg>`,
  dress: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M25 8 L14 16 L18 24 L22 20 L16 56 L48 56 L42 20 L46 24 L50 16 L39 8 C39 12 35 15 32 15 C29 15 25 12 25 8 Z"/></svg>`,
};

const currency = (n) => `৳${Number(n || 0).toLocaleString("en-BD")}`;

/* ------------------------------------------------------------
   2. Product grid rendering — one fixed category per page
      (men / women / kids / designs), each with a capped number
      of photo slots. Empty slots render as placeholders.
   ------------------------------------------------------------ */
const productGrid = document.getElementById("productGrid");
const designsSection = document.querySelector(".designs[data-category]");
const slotInfoEl = document.getElementById("slotInfo");
const activeCategory = designsSection ? designsSection.dataset.category : null;
const categoryCapacity = activeCategory ? (CATEGORY_CAPACITY[activeCategory] || 10) : 0;

function productCardHTML(p) {
  const media = p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy">`
    : (ICONS[p.type] || ICONS.tee);
  return `
    <article class="product-card" data-id="${p.id}">
      <div class="product-card__media">
        <span class="product-card__tag">${p.category}</span>
        ${media}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name">${p.name}</h3>
        <span class="product-card__price">${currency(p.price)}</span>
        <div class="product-card__actions">
          <button class="btn btn--outline" data-action="order" data-id="${p.id}">Order now</button>
          <button class="btn btn--ghost" data-action="add" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `;
}

function placeholderSlotHTML(slotNumber) {
  // Same card layout as a real product (photo, name, price, buttons) so
  // the grid stays visually consistent — buttons are disabled since
  // there's no real product behind the slot yet.
  return `
    <article class="product-card product-card--empty">
      <div class="product-card__media product-card__media--empty">
        <span class="product-card__tag">Slot ${String(slotNumber).padStart(2, "0")}</span>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.2"/><path d="M8 6l1.2-2h5.6L16 6"/></svg>
      </div>
      <div class="product-card__body">
        <h3 class="product-card__name product-card__name--empty">Coming soon</h3>
        <span class="product-card__price product-card__price--empty">&mdash;</span>
        <div class="product-card__actions">
          <button class="btn btn--outline" disabled title="Add a product in script.js to activate this slot">Order now</button>
          <button class="btn btn--ghost" disabled title="Add a product in script.js to activate this slot">Add to cart</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  if (!productGrid || !activeCategory) return;
  const list = PRODUCTS.filter(p => p.category === activeCategory);

  let html = list.map(productCardHTML).join("");
  for (let i = list.length + 1; i <= categoryCapacity; i++) {
    html += placeholderSlotHTML(i);
  }
  productGrid.innerHTML = html;

  if (slotInfoEl) {
    slotInfoEl.textContent = `${list.length} of ${categoryCapacity} photo slots used`;
  }
}
renderProducts();

if (productGrid) {
  productGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === "add") addToCart(id);
    if (action === "order") openOrderModal({ single: id });
  });
}

/* ------------------------------------------------------------
   2b. Raw Materials gallery — its own 20-slot grid (no price/cart,
       just a photo + name + short note per material).
   ------------------------------------------------------------ */
const MATERIALS = [
  { id: "mat01", name: "Heavyweight Cotton",          note: "240–320 GSM combed cotton for tees, hoodies and sweats." },
  { id: "mat02", name: "Selvedge & Twill Denim",      note: "Mid-to-heavyweight denim and twill for outerwear and trousers." },
  { id: "mat03", name: "Recycled & Deadstock Fabric", note: "Recycled fibre blends and deadstock rolls to cut waste." },
  { id: "mat04", name: "Natural Dyes & Finishes",     note: "Stone-washed, mineral-dyed finishes for a tonal palette." },
];

const materialsGrid = document.getElementById("materialsGrid");
const materialsSlotInfoEl = document.getElementById("materialsSlotInfo");

function materialCardHTML(m) {
  const media = m.img
    ? `<img src="${m.img}" alt="${m.name}" loading="lazy">`
    : `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 4h16v16H4z"/><path d="M4 15l4-4 4 4 4-6 4 4"/></svg>`;
  return `
    <article class="product-card material-photo-card">
      <div class="product-card__media">${media}</div>
      <div class="product-card__body">
        <h3 class="product-card__name">${m.name}</h3>
        <p class="material-photo-card__note">${m.note || ""}</p>
      </div>
    </article>
  `;
}

function renderMaterials() {
  if (!materialsGrid) return;
  let html = MATERIALS.map(materialCardHTML).join("");
  for (let i = MATERIALS.length + 1; i <= MATERIALS_CAPACITY; i++) {
    html += placeholderSlotHTML(i);
  }
  materialsGrid.innerHTML = html;
  if (materialsSlotInfoEl) {
    materialsSlotInfoEl.textContent = `${MATERIALS.length} of ${MATERIALS_CAPACITY} photo slots used`;
  }
}
renderMaterials();

/* ------------------------------------------------------------
   3. Hamburger menu + category accordion
   ------------------------------------------------------------ */
const menuTrigger = document.getElementById("menuTrigger");
const menuClose = document.getElementById("menuClose");
const menuOverlay = document.getElementById("menuOverlay");
const categoryToggle = document.getElementById("categoryToggle");
const categorySubmenu = document.getElementById("categorySubmenu");

function openMenu() {
  menuOverlay.classList.add("is-open");
  menuTrigger.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}
function closeMenu() {
  menuOverlay.classList.remove("is-open");
  menuTrigger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}
menuTrigger.addEventListener("click", () => {
  menuOverlay.classList.contains("is-open") ? closeMenu() : openMenu();
});
menuClose.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", (e) => { if (e.target === menuOverlay) closeMenu(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

categoryToggle.addEventListener("click", () => {
  const isOpen = categorySubmenu.classList.toggle("is-open");
  categoryToggle.setAttribute("aria-expanded", String(isOpen));
});

/* Highlight the current page's link — in the visible navbar, and in
   the hamburger overlay (expanding the Category accordion if needed) */
(function highlightActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll(".nav-link[data-page], .menu-link[data-page], .menu-sublink[data-page]").forEach(link => {
    if (link.dataset.page === page) {
      link.classList.add("is-current");
      if (link.classList.contains("menu-sublink")) {
        categorySubmenu.classList.add("is-open");
        categoryToggle.setAttribute("aria-expanded", "true");
      }
    }
  });
})();

/* ------------------------------------------------------------
   4. Cart (persists across pages via localStorage)
   ------------------------------------------------------------ */
let cart = JSON.parse(localStorage.getItem("rsm_cart") || "[]");

const cartTrigger = document.getElementById("cartTrigger");
const cartDrawer = document.getElementById("cartDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const cartClose = document.getElementById("cartClose");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");

function saveCart() { localStorage.setItem("rsm_cart", JSON.stringify(cart)); }

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  openCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

/* Total price = SUM(unit price × quantity) for every line. */
function cartTotal() {
  return cart.reduce((sum, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function renderCart() {
  const count = cart.reduce((n, i) => n + i.qty, 0);
  if (cartCountEl) cartCountEl.textContent = count;
  if (!cartItemsEl) return;

  if (!cart.length) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty. Browse <a href="designs.html">our designs</a>.</p>`;
  } else {
    cartItemsEl.innerHTML = cart.map(item => {
      const p = PRODUCTS.find(p => p.id === item.id);
      if (!p) return "";
      const lineTotal = p.price * item.qty;
      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item__media">${ICONS[p.type] || ICONS.tee}</div>
          <div class="cart-item__info">
            <span class="cart-item__name">${p.name}</span>
            <div class="cart-item__meta">
              <span class="cart-item__unit">${currency(p.price)} each</span>
              <div class="cart-item__qty">
                <button data-action="dec" data-id="${p.id}">&minus;</button>
                <span>${item.qty}</span>
                <button data-action="inc" data-id="${p.id}">+</button>
              </div>
            </div>
            <div class="cart-item__meta">
              <button class="cart-item__remove" data-action="remove" data-id="${p.id}">Remove</button>
              <span class="cart-item__linetotal">${currency(lineTotal)}</span>
            </div>
          </div>
        </div>`;
    }).join("");
  }
  if (cartTotalEl) cartTotalEl.textContent = currency(cartTotal());
}
renderCart();

function openCart() {
  cartDrawer.classList.add("is-open");
  drawerBackdrop.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartDrawer.classList.remove("is-open");
  drawerBackdrop.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}
if (cartTrigger) cartTrigger.addEventListener("click", openCart);
if (cartClose) cartClose.addEventListener("click", closeCart);
if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeCart);

if (cartItemsEl) {
  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === "inc") updateQty(id, 1);
    if (action === "dec") updateQty(id, -1);
    if (action === "remove") removeFromCart(id);
  });
}

/* ------------------------------------------------------------
   5. Order modal + submission (total = unit price × qty)
   ------------------------------------------------------------ */
const orderModal = document.getElementById("orderModal");
const orderClose = document.getElementById("orderClose");
const orderForm = document.getElementById("orderForm");
const orderSummary = document.getElementById("orderSummary");
const orderLiveTotal = document.getElementById("orderLiveTotal");
const orderModalTitle = document.getElementById("orderModalTitle");
const orderQtyLabel = document.getElementById("orderQtyLabel");
const orderQtyInput = orderForm ? orderForm.querySelector('[name="quantity"]') : null;
const orderProductField = document.getElementById("orderProductField");
const orderUnitPriceField = document.getElementById("orderUnitPriceField");
const orderTotalPriceField = document.getElementById("orderTotalPriceField");
const orderSuccess = document.getElementById("orderSuccess");
const orderSuccessClose = document.getElementById("orderSuccessClose");
const orderSubmitBtn = document.getElementById("orderSubmitBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

let orderContext = null; // { single: id } or { cart: true }

function refreshLiveTotal() {
  if (!orderLiveTotal || !orderContext) return;
  if (orderContext.single) {
    const p = PRODUCTS.find(p => p.id === orderContext.single);
    const qty = Math.max(1, parseInt(orderQtyInput.value, 10) || 1);
    const total = p.price * qty;
    orderTotalPriceField.value = total;
    orderLiveTotal.textContent = `Total: ${currency(total)} (${qty} × ${currency(p.price)})`;
  } else {
    orderLiveTotal.textContent = `Total: ${currency(cartTotal())}`;
  }
}

function openOrderModal(context) {
  orderContext = context;
  orderForm.reset();
  orderForm.style.display = "flex";
  orderSuccess.classList.remove("is-active");
  orderQtyInput.value = 1;

  if (context.single) {
    const p = PRODUCTS.find(p => p.id === context.single);
    orderModalTitle.textContent = "Order this piece";
    orderSummary.textContent = `${p.name} — ${currency(p.price)} each`;
    orderProductField.value = p.name;
    orderUnitPriceField.value = p.price;
    orderQtyLabel.style.display = "flex";
  } else {
    if (!cart.length) return;
    const summary = cart.map(item => {
      const p = PRODUCTS.find(p => p.id === item.id);
      return `${p.name} x${item.qty}`;
    }).join(", ");
    orderModalTitle.textContent = "Checkout";
    orderSummary.textContent = summary;
    orderProductField.value = summary;
    orderUnitPriceField.value = "-";
    orderQtyLabel.style.display = "none";
  }

  refreshLiveTotal();
  orderModal.classList.add("is-open");
  orderModal.setAttribute("aria-hidden", "false");
  closeCart();
}
function closeOrderModal() {
  orderModal.classList.remove("is-open");
  orderModal.setAttribute("aria-hidden", "true");
}
if (orderQtyInput) orderQtyInput.addEventListener("input", refreshLiveTotal);
if (orderClose) orderClose.addEventListener("click", closeOrderModal);
if (orderSuccessClose) orderSuccessClose.addEventListener("click", closeOrderModal);
if (orderModal) orderModal.addEventListener("click", (e) => { if (e.target === orderModal) closeOrderModal(); });
if (checkoutBtn) checkoutBtn.addEventListener("click", () => openOrderModal({ cart: true }));

if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(orderForm);
    const payload = {
      name: formData.get("name"),
      number: formData.get("number"),
      address: formData.get("address"),
      quantity: orderContext.cart ? cart.reduce((n, i) => n + i.qty, 0) : formData.get("quantity"),
      product: orderProductField.value,
      unitPrice: orderUnitPriceField.value,
      totalPrice: orderContext.cart ? cartTotal() : orderTotalPriceField.value,
      timestamp: new Date().toISOString(),
    };

    orderSubmitBtn.disabled = true;
    orderSubmitBtn.textContent = "Submitting…";

    try {
      if (ORDER_ENDPOINT) {
        await fetch(ORDER_ENDPOINT, {
          method: "POST",
          mode: "no-cors", // Apps Script web apps require no-cors from the browser
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
        });
      } else {
        console.warn("ORDER_ENDPOINT is not set — order was not sent anywhere. See README.md.");
      }

      orderForm.style.display = "none";
      orderSuccess.classList.add("is-active");

      if (orderContext.cart) {
        cart = [];
        saveCart();
        renderCart();
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong sending your order. Please call us directly, or try again.");
    } finally {
      orderSubmitBtn.disabled = false;
      orderSubmitBtn.textContent = "Submit order";
    }
  });
}

/* ------------------------------------------------------------
   6. Hero — interactive cursor glow (front page only)
   ------------------------------------------------------------ */
const heroEl = document.querySelector(".hero");
if (heroEl) {
  heroEl.addEventListener("mousemove", (e) => {
    const rect = heroEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    heroEl.style.setProperty("--mx", `${x}%`);
    heroEl.style.setProperty("--my", `${y}%`);
  });
}

/* ------------------------------------------------------------
   7. Misc
   ------------------------------------------------------------ */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
