(function () {
  const config = window.ELEGANZA_CONFIG || {};
  const products = window.ELEGANZA_PRODUCTS || [];
  const productMap = new Map(products.map((product) => [product.slug, product]));

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function buildWhatsAppUrl(message) {
    const number = (config.whatsappNumber || "").replace(/\D/g, "");
    const encoded = encodeURIComponent(message);
    return number
      ? `https://wa.me/${number}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
  }

  function createMessage(product, extras = {}) {
    const lines = [
      `مرحباً فريق ${config.brandArabic || config.brandName || "Eleganza"}`,
      extras.intent || product.whatsAppMessage || config.whatsappDefaultNote,
      `المنتج: ${product.name}`,
      `الكود: ${product.sku}`,
      `النوع: ${product.mode === "exclusive" ? "Exclusive 2026" : "Regular"}`
    ];

    if (extras.size) {
      lines.push(`المقاس: ${extras.size}`);
    }

    if (extras.city) {
      lines.push(`المدينة: ${extras.city}`);
    }

    if (extras.name) {
      lines.push(`الاسم: ${extras.name}`);
    }

    if (extras.phone) {
      lines.push(`رقم التواصل: ${extras.phone}`);
    }

    if (extras.notes) {
      lines.push(`ملاحظات: ${extras.notes}`);
    }

    return lines.join("\n");
  }

  function getModeLabel(mode) {
    return mode === "exclusive" ? "Exclusive 2026" : "Regular";
  }

  function getModeTone(mode) {
    return mode === "exclusive" ? "chip chip--gold" : "chip chip--soft";
  }

  function navLink(pageId, href, label) {
    const active = document.body.dataset.page === pageId ? "is-active" : "";
    return `<a class="site-nav__link ${active}" href="${href}">${label}</a>`;
  }

  function renderHeader() {
    const target = document.querySelector("[data-site-header]");

    if (!target) {
      return;
    }

    target.innerHTML = `
      <div class="topbar">
        <div class="shell topbar__inner">
          <a class="brand" href="index.html" aria-label="Eleganza home">
            <span class="brand__latin">${escapeHtml(config.brandName || "ELEGANZA")}</span>
            <span class="brand__arabic">${escapeHtml(config.brandArabic || "إيليجانزا")}</span>
          </a>
          <nav class="site-nav" aria-label="Main navigation">
            ${navLink("home", "index.html", "الرئيسية")}
            ${navLink("shop", "shop.html", "المتجر")}
            ${navLink("exclusive", "exclusive-2026.html", "Exclusive 2026")}
            ${navLink("about", "about.html", "عن العلامة")}
            ${navLink("booking", "booking.html", "الحجز")}
            ${navLink("contact", "contact.html", "التواصل")}
          </nav>
          <div class="topbar__actions">
            <a class="button button--ghost" href="${escapeHtml(config.facebookUrl)}" target="_blank" rel="noreferrer">Facebook</a>
            <a class="button button--gold" href="booking.html">ابدئي الطلب</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderFooter() {
    const target = document.querySelector("[data-site-footer]");

    if (!target) {
      return;
    }

    target.innerHTML = `
      <footer class="site-footer">
        <div class="shell site-footer__grid">
          <div>
            <span class="eyebrow">Luxury Evening Couture</span>
            <h2 class="site-footer__title">${escapeHtml(config.brandName || "ELEGANZA")}</h2>
            <p class="site-footer__text">
              تجربة رقمية فاخرة لعرض فساتين السهرة، مع فصل واضح بين الطلب المباشر والقطع الحصرية
              ضمن مجموعة Exclusive 2026.
            </p>
          </div>
          <div>
            <strong class="site-footer__heading">روابط سريعة</strong>
            <div class="site-footer__links">
              <a href="shop.html">المتجر</a>
              <a href="exclusive-2026.html">Exclusive 2026</a>
              <a href="booking.html">الحجز</a>
              <a href="contact.html">التواصل</a>
            </div>
          </div>
          <div>
            <strong class="site-footer__heading">قنوات التواصل</strong>
            <div class="site-footer__links">
              <a href="${buildWhatsAppUrl(config.whatsappDefaultNote || "")}" target="_blank" rel="noreferrer">WhatsApp</a>
              <a href="${escapeHtml(config.facebookUrl)}" target="_blank" rel="noreferrer">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function productCard(product) {
    const message = createMessage(product);

    return `
      <article class="product-card">
        <a class="product-card__media" href="product.html?slug=${encodeURIComponent(product.slug)}">
          <img src="${escapeHtml(product.images[0].src)}" alt="${escapeHtml(product.images[0].alt)}" loading="lazy" />
        </a>
        <div class="product-card__body">
          <div class="product-card__badges">
            <span class="${getModeTone(product.mode)}">${getModeLabel(product.mode)}</span>
            <span class="chip chip--line">${escapeHtml(product.sku)}</span>
          </div>
          <h3 class="product-card__title">${escapeHtml(product.name)}</h3>
          <p class="product-card__text">${escapeHtml(product.shortDescription)}</p>
          <div class="product-card__meta">
            <div>
              <strong class="product-card__price">${escapeHtml(product.priceLabel)}</strong>
              <span class="product-card__hint">${escapeHtml(product.deliveryWindow)}</span>
            </div>
            <div class="product-card__actions">
              <a class="button button--ghost" href="product.html?slug=${encodeURIComponent(product.slug)}">التفاصيل</a>
              <a class="button ${product.mode === "exclusive" ? "button--gold" : "button--dark"}" href="${buildWhatsAppUrl(message)}" target="_blank" rel="noreferrer">
                ${product.mode === "exclusive" ? "ابدئي الحجز" : "اطلبي عبر واتساب"}
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderProducts(targetSelector, list) {
    const target = document.querySelector(targetSelector);

    if (!target) {
      return;
    }

    target.innerHTML = list.map(productCard).join("");
  }

  function renderHomePage() {
    renderProducts("[data-featured-exclusive]", products.filter((item) => item.mode === "exclusive").slice(0, 3));
    renderProducts("[data-home-preview]", products.slice(0, 4));
  }

  function renderShopPage() {
    const target = document.querySelector("[data-shop-grid]");
    const filters = document.querySelector("[data-shop-filters]");

    if (!target || !filters) {
      return;
    }

    const render = (mode) => {
      const filtered = mode === "all" ? products : products.filter((item) => item.mode === mode);
      target.innerHTML = filtered.map(productCard).join("");
    };

    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");

      if (!button) {
        return;
      }

      filters.querySelectorAll("[data-filter]").forEach((node) => {
        node.classList.remove("is-selected");
      });
      button.classList.add("is-selected");
      render(button.dataset.filter);
    });

    render("all");
  }

  function galleryMarkup(product) {
    const thumbs = product.images
      .map(
        (image, index) => `
          <button class="thumb ${index === 0 ? "is-active" : ""}" type="button" data-gallery-thumb data-src="${escapeHtml(image.src)}" data-alt="${escapeHtml(image.alt)}">
            <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" />
          </button>
        `
      )
      .join("");

    return `
      <div class="product-layout">
        <div class="product-gallery">
          <div class="product-gallery__stage">
            <img class="product-gallery__main" data-gallery-main src="${escapeHtml(product.images[0].src)}" alt="${escapeHtml(product.images[0].alt)}" />
          </div>
          <div class="product-gallery__thumbs">
            ${thumbs}
          </div>
        </div>
        <div class="product-summary">
          <div class="product-summary__head">
            <span class="${getModeTone(product.mode)}">${getModeLabel(product.mode)}</span>
            <span class="chip chip--line">${escapeHtml(product.sku)}</span>
          </div>
          <h1 class="product-summary__title">${escapeHtml(product.name)}</h1>
          <p class="product-summary__text">${escapeHtml(product.description)}</p>
          <div class="product-summary__price">${escapeHtml(product.priceLabel)}</div>
          <div class="product-summary__note">
            ${product.mode === "exclusive" ? "يبدأ التنفيذ بعد سداد كامل المبلغ." : "طلب مباشر مع تأكيد التوفر عبر WhatsApp."}
          </div>

          <div class="info-list">
            <div class="info-card">
              <strong>مدة التسليم</strong>
              <span>${escapeHtml(product.deliveryWindow)}</span>
            </div>
            <div class="info-card">
              <strong>الحصرية</strong>
              <span>${escapeHtml(product.regionNote)}</span>
            </div>
            <div class="info-card">
              <strong>الدفع</strong>
              <span>${product.fullPaymentRequired ? "دفع كامل قبل التنفيذ" : "يتحدد أثناء التأكيد عبر المحادثة"}</span>
            </div>
          </div>

          <div class="selection-grid">
            <label class="field">
              <span>المقاس</span>
              <select data-product-size>
                ${product.sizes
                  .map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`)
                  .join("")}
              </select>
            </label>
            <label class="field">
              <span>المدينة</span>
              <input type="text" data-product-city placeholder="مثال: طرابلس" />
            </label>
          </div>

          <div class="button-row">
            <a class="button ${product.mode === "exclusive" ? "button--gold" : "button--dark"}" href="${buildWhatsAppUrl(createMessage(product))}" data-product-whatsapp target="_blank" rel="noreferrer">
              ${product.mode === "exclusive" ? "ابدئي طلب الحجز" : "اطلبي عبر واتساب"}
            </a>
            <a class="button button--ghost" href="booking.html?product=${encodeURIComponent(product.slug)}">نموذج الحجز</a>
          </div>

          <ul class="bullet-list">
            ${product.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  }

  function bindProductInteractions(product) {
    const thumbs = document.querySelectorAll("[data-gallery-thumb]");
    const main = document.querySelector("[data-gallery-main]");
    const sizeInput = document.querySelector("[data-product-size]");
    const cityInput = document.querySelector("[data-product-city]");
    const button = document.querySelector("[data-product-whatsapp]");

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbs.forEach((item) => item.classList.remove("is-active"));
        thumb.classList.add("is-active");
        main.src = thumb.dataset.src;
        main.alt = thumb.dataset.alt;
      });
    });

    const updateLink = () => {
      const message = createMessage(product, {
        size: sizeInput ? sizeInput.value : "",
        city: cityInput ? cityInput.value.trim() : ""
      });
      button.href = buildWhatsAppUrl(message);
    };

    if (sizeInput) {
      sizeInput.addEventListener("change", updateLink);
    }

    if (cityInput) {
      cityInput.addEventListener("input", updateLink);
    }

    updateLink();
  }

  function renderProductPage() {
    const target = document.querySelector("[data-product-root]");

    if (!target) {
      return;
    }

    const slug = getParam("slug") || "ss257-champagne";
    const product = productMap.get(slug);

    if (!product) {
      target.innerHTML = `
        <div class="empty-state">
          <h1>المنتج غير متاح</h1>
          <p>تعذّر العثور على هذه القطعة. يمكنك العودة إلى المتجر واستكشاف التصاميم المتاحة حالياً.</p>
          <a class="button button--gold" href="shop.html">العودة إلى المتجر</a>
        </div>
      `;
      return;
    }

    document.title = `${config.brandName || "Eleganza"} | ${product.name}`;
    target.innerHTML = galleryMarkup(product);
    bindProductInteractions(product);
    renderProducts("[data-related-products]", products.filter((item) => item.slug !== product.slug).slice(0, 3));
  }

  function renderExclusivePage() {
    renderProducts("[data-exclusive-grid]", products.filter((item) => item.mode === "exclusive"));
  }

  function renderBookingPage() {
    const form = document.querySelector("[data-booking-form]");
    const productSelect = document.querySelector("[data-booking-product]");
    const sizeSelect = form ? form.querySelector("[name='size']") : null;

    if (!form || !productSelect) {
      return;
    }

    productSelect.innerHTML = products
      .map(
        (product) =>
          `<option value="${escapeHtml(product.slug)}">${escapeHtml(product.name)} — ${getModeLabel(product.mode)}</option>`
      )
      .join("");

    const initialProduct = getParam("product");

    if (initialProduct && productMap.has(initialProduct)) {
      productSelect.value = initialProduct;
    }

    const syncSizes = () => {
      const selected = productMap.get(productSelect.value) || products[0];
      sizeSelect.innerHTML = selected.sizes
        .map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`)
        .join("");
    };

    productSelect.addEventListener("change", syncSizes);
    syncSizes();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const selected = productMap.get(productSelect.value) || products[0];
      const message = createMessage(selected, {
        intent:
          selected.mode === "exclusive"
            ? "أرغب في بدء طلب حجز لقطعة حصرية."
            : "أرغب في طلب قطعة من المنتجات المنتظمة.",
        size: form.querySelector("[name='size']").value,
        city: form.querySelector("[name='city']").value.trim(),
        name: form.querySelector("[name='customerName']").value.trim(),
        phone: form.querySelector("[name='phone']").value.trim(),
        notes: form.querySelector("[name='notes']").value.trim()
      });

      window.open(buildWhatsAppUrl(message), "_blank", "noopener");
    });
  }

  function renderContactPage() {
    const genericButtons = document.querySelectorAll("[data-whatsapp-link]");
    genericButtons.forEach((button) => {
      button.href = buildWhatsAppUrl(config.whatsappDefaultNote || "");
    });
  }

  function initPage() {
    renderHeader();
    renderFooter();

    const page = document.body.dataset.page;

    if (page === "home") {
      renderHomePage();
    }

    if (page === "shop") {
      renderShopPage();
    }

    if (page === "product") {
      renderProductPage();
    }

    if (page === "exclusive") {
      renderExclusivePage();
    }

    if (page === "booking") {
      renderBookingPage();
    }

    if (page === "contact") {
      renderContactPage();
    }
  }

  document.addEventListener("DOMContentLoaded", initPage);
})();
