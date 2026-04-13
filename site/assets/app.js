(function () {
  const config = window.__ELEGANZA_CONFIG__ || {};
  const pageDataNode = document.querySelector("#page-data");
  const pageData = pageDataNode ? JSON.parse(pageDataNode.textContent) : null;
  let catalogPromise;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function isLabelObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function labelText(value, locale = "ar") {
    if (!isLabelObject(value)) {
      return String(value || "");
    }

    return value[locale] || value.ar || value.en || "";
  }

  function renderLabel(value, className = "ui-copy", variant = "stacked") {
    const ar = labelText(value, "ar");
    const en = labelText(value, "en");

    if (ar && en && ar !== en) {
      if (variant === "inline") {
        return `
          <span class="${className} ${className}--inline">
            <span class="${className}__ar">${escapeHtml(ar)}</span>
            <span class="${className}__en">${escapeHtml(en)}</span>
          </span>
        `;
      }

      return `
        <span class="${className} ${className}--stacked">
          <span class="${className}__ar">${escapeHtml(ar)}</span>
          <span class="${className}__en">${escapeHtml(en)}</span>
        </span>
      `;
    }

    return `<span class="${className} ${className}--single">${escapeHtml(ar || en)}</span>`;
  }

  function colorToCss(name) {
    const value = String(name || "").trim().toLowerCase();
    const map = {
      black: "#111111",
      white: "#f8f8f3",
      ivory: "#f2efe4",
      red: "#9e2231",
      burgundy: "#5f1024",
      pink: "#d69aac",
      "light pink": "#edc8d3",
      blue: "#4a678f",
      green: "#5f7758",
      sage: "#93a18f",
      gold: "#b79858",
      champagne: "#cfb08a",
      silver: "#aeb3bb",
      purple: "#6f5a8c",
      lavender: "#afa3c5",
      brown: "#815f43",
      caramel: "#a66f46",
      bronze: "#946a3c",
      yellow: "#d4ae4f",
      orange: "#d7794b",
      grey: "#8e8e91"
    };

    return map[value] || "#d7d3cd";
  }

  function buildWhatsAppUrl(product, extras = {}) {
    const number = (config.whatsappNumber || "").replace(/\D/g, "");
    const lines = [
      `مرحباً فريق ${config.brandArabic || "إيليجانزا"}`,
      labelText(extras.intent || (product.isExclusive ? config.secondaryCTA : config.primaryCTA), "ar"),
      `القطعة: ${product.title}`,
      `Handle: ${product.handle}`
    ];

    if (extras.color) {
      lines.push(`اللون: ${extras.color}`);
    }

    if (extras.size) {
      lines.push(`المقاس: ${extras.size}`);
    }

    if (extras.name) {
      lines.push(`الاسم: ${extras.name}`);
    }

    if (extras.phone) {
      lines.push(`الهاتف: ${extras.phone}`);
    }

    if (extras.city) {
      lines.push(`المدينة: ${extras.city}`);
    }

    if (extras.notes) {
      lines.push(`ملاحظات: ${extras.notes}`);
    }

    const encoded = encodeURIComponent(lines.join("\n"));
    return number ? `https://wa.me/${number}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  }

  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function getCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch(config.catalogPath)
        .then((response) => response.json())
        .catch(() => []);
    }

    return catalogPromise;
  }

  function resolveRoute(route) {
    return `${config.siteRoot || ""}${route}`;
  }

  function cardTemplate(product) {
    const productHref = resolveRoute(`ar/products/${encodeURIComponent(product.handle)}/`);
    const reservationHref = resolveRoute(`ar/reservation/?product=${encodeURIComponent(product.handle)}`);
    const primaryImage = product.primaryMedia?.src || "";
    const hoverImage = product.hoverMedia?.src || primaryImage;

    return `
      <article class="product-index" data-product-card data-product-handle="${escapeHtml(product.handle)}">
        <div class="prod-container">
          <div class="prod-image image_portrait">
            <a href="${escapeHtml(productHref)}" title="${escapeHtml(product.title)}">
              <div class="reveal reveal--image">
                <div class="box-ratio box-ratio--square">
                  <img class="primary-image" src="${escapeHtml(primaryImage)}" alt="${escapeHtml(product.title)}" loading="lazy" />
                  <img class="secondary-image" src="${escapeHtml(hoverImage)}" alt="" loading="lazy" />
                </div>
              </div>
          </a>
          </div>
          <button class="product-listing__quickview-trigger js-quickview-open" type="button" data-product-handle="${escapeHtml(product.handle)}">
            ${renderLabel(config.quickViewLabel || { ar: "عرض سريع", en: "Quick View" }, "micro-copy", "inline")}
          </button>
        </div>
        <div class="product-info">
          <div class="product-info__meta">${renderLabel(
            product.isExclusive ? product.availabilityLabel : { ar: "قطعة منسقة", en: "Curated Piece" },
            "micro-copy",
            "inline"
          )}</div>
          <a href="${escapeHtml(productHref)}"><h2>${escapeHtml(product.title)}</h2></a>
          <div class="availability-copy ${product.isExclusive ? "availability-copy--exclusive" : ""}">${renderLabel(
            product.availabilityLabel,
            "micro-copy",
            "inline"
          )}</div>
          ${
            product.colors?.length
              ? `
                <div class="product--grid__swatches">
                  <div class="prod-colors">
                    <div class="color-swatch">
                      <ul class="color options">
                        ${product.colors
                          .map(
                            (color) => `
                              <li data-option-title="${escapeHtml(color)}">
                                <span class="swatch-circle" style="background-color:${escapeHtml(colorToCss(color))};" title="${escapeHtml(color)}"></span>
                              </li>
                            `
                          )
                          .join("")}
                      </ul>
                    </div>
                  </div>
                </div>
              `
              : ""
          }
          <div class="product-card__actions">
            <a class="button button--dark" href="${escapeHtml(reservationHref)}">${renderLabel(
              product.reservationLabel || config.primaryCTA,
              "button-copy"
            )}</a>
            <a class="button button--text" href="${escapeHtml(productHref)}">${renderLabel(
              config.viewLabel || { ar: "استكشفي القطعة", en: "View Piece" },
              "micro-copy",
              "inline"
            )}</a>
          </div>
        </div>
      </article>
    `;
  }

  function quickViewTemplate(product) {
    const productHref = resolveRoute(`ar/products/${encodeURIComponent(product.handle)}/`);
    const reservationHref = resolveRoute(`ar/reservation/?product=${encodeURIComponent(product.handle)}`);

    return `
      <article class="quickview-card">
        <div class="quickview-card__media">
          <img src="${escapeHtml(product.primaryMedia?.src || "")}" alt="${escapeHtml(product.title)}" loading="lazy" />
        </div>
        <div class="quickview-card__body">
          <span class="availability-copy ${product.isExclusive ? "availability-copy--exclusive" : ""}">${renderLabel(
            product.availabilityLabel,
            "micro-copy",
            "inline"
          )}</span>
          <h2>${escapeHtml(product.title)}</h2>
          <p>${escapeHtml(product.bodyText || "تجربة حجز خاصة داخل الدار.")}</p>
          ${
            product.colors?.length
              ? `<div class="quickview-card__swatches">${product.colors
                  .map(
                    (color) =>
                      `<span class="swatch-circle" style="background-color:${escapeHtml(colorToCss(color))};" title="${escapeHtml(color)}"></span>`
                  )
                  .join("")}</div>`
              : ""
          }
          <div class="quickview-card__actions">
            <a class="button button--dark" href="${escapeHtml(reservationHref)}">${renderLabel(
              product.reservationLabel || config.primaryCTA,
              "button-copy"
            )}</a>
            <a class="button button--text" href="${escapeHtml(productHref)}">${renderLabel(
              config.viewLabel || { ar: "استكشفي القطعة", en: "View Piece" },
              "micro-copy",
              "inline"
            )}</a>
          </div>
        </div>
      </article>
    `;
  }

  function initMobileMenu() {
    const drawer = qs("#mobile-drawer");

    if (!drawer) {
      return;
    }

    function openDrawer() {
      drawer.hidden = false;
      document.documentElement.classList.add("has-drawer");
    }

    function closeDrawer() {
      drawer.hidden = true;
      document.documentElement.classList.remove("has-drawer");
    }

    qsa(".js-mobile-menu-open").forEach((button) => button.addEventListener("click", openDrawer));
    qsa(".js-mobile-menu-close").forEach((button) => button.addEventListener("click", closeDrawer));

    qsa("[data-mobile-group]").forEach((group) => {
      const toggle = qs(".mobile-nav__toggle", group);
      if (!toggle) {
        return;
      }

      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        group.classList.toggle("is-open", !expanded);
      });
    });
  }

  function initDesktopNavigation() {
    const nav = qs(".navigation.full-nav");
    const header = qs(".site-header");
    const scrim = qs("[data-nav-scrim]");

    if (!nav || !header) {
      return;
    }

    const items = qsa("[data-desktop-nav-item]", nav);

    if (!items.length) {
      return;
    }

    let closeTimer = 0;

    function setExpanded(item, expanded) {
      const trigger = qs("[data-desktop-nav-trigger]", item);
      if (trigger) {
        trigger.setAttribute("aria-expanded", String(expanded));
      }
    }

    function syncScrim() {
      if (!scrim) {
        return;
      }

      const hasOpen = items.some((item) => item.classList.contains("is-open"));

      if (!hasOpen) {
        scrim.classList.remove("is-active");
        scrim.hidden = true;
        scrim.style.top = "";
        document.documentElement.classList.remove("has-desktop-nav-open");
        return;
      }

      scrim.style.top = `${header.getBoundingClientRect().bottom}px`;
      scrim.hidden = false;
      scrim.classList.add("is-active");
      document.documentElement.classList.add("has-desktop-nav-open");
    }

    function closeMenus() {
      items.forEach((item) => {
        item.classList.remove("is-open");
        setExpanded(item, false);
      });
      syncScrim();
    }

    function cancelClose() {
      window.clearTimeout(closeTimer);
    }

    function scheduleClose() {
      cancelClose();
      closeTimer = window.setTimeout(closeMenus, 220);
    }

    function openMenu(item) {
      cancelClose();
      items.forEach((candidate) => {
        const isActive = candidate === item;
        candidate.classList.toggle("is-open", isActive);
        setExpanded(candidate, isActive);
      });
      syncScrim();
    }

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => openMenu(item));
      item.addEventListener("focusin", () => openMenu(item));
      item.addEventListener("mouseleave", scheduleClose);
    });

    nav.addEventListener("mouseenter", cancelClose);
    nav.addEventListener("mouseleave", scheduleClose);

    if (scrim) {
      scrim.addEventListener("click", closeMenus);
    }

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) {
        closeMenus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    });

    window.addEventListener("resize", syncScrim);
  }

  function initNewsletterForm() {
    qsa("[data-newsletter-form]").forEach((form) =>
      form.addEventListener("submit", (event) => {
        event.preventDefault();
      })
    );
  }

  function initHeroSlideshow() {
    const slideshow = qs("[data-slides]");
    if (!slideshow) {
      return;
    }

    const slides = qsa("[data-slide]", slideshow);
    const dots = qsa("[data-slide-dot]");
    let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (activeIndex < 0) {
      activeIndex = 0;
    }

    function activate(index) {
      slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === index));
      dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
      activeIndex = index;
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => activate(index));
    });

    if (slides.length > 1) {
      window.setInterval(() => {
        activate((activeIndex + 1) % slides.length);
      }, 7000);
    }
  }

  function initQuickView() {
    const modal = qs("#quickview-modal");
    const content = qs("[data-quickview-content]");

    if (!modal || !content) {
      return;
    }

    function closeModal() {
      modal.hidden = true;
      content.innerHTML = "";
      document.documentElement.classList.remove("has-modal");
    }

    async function openQuickView(handle) {
      let product = null;

      if (pageData?.type === "collection") {
        product = pageData.products.find((entry) => entry.handle === handle) || null;
      }

      if (!product) {
        const catalog = await getCatalog();
        product = catalog.find((entry) => entry.handle === handle) || null;
      }

      if (!product) {
        return;
      }

      content.innerHTML = quickViewTemplate(product);
      modal.hidden = false;
      document.documentElement.classList.add("has-modal");
    }

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest(".js-quickview-open");
      if (trigger) {
        openQuickView(trigger.dataset.productHandle);
      }

      if (event.target.closest(".js-quickview-close")) {
        closeModal();
      }
    });
  }

  function initCollectionPage() {
    if (pageData?.type !== "collection") {
      return;
    }

    const grid = qs("[data-collection-grid]");
    const pagination = qs("[data-collection-pagination]");
    const sidebar = qs("[data-collection-sidebar]");
    const sortSelect = qs("[data-collection-sort]");
    const filterOpen = qs(".js-filter-open");
    const query = new URLSearchParams(window.location.search).get("q")?.toLowerCase() || "";
    const state = {
      page: 1,
      pageSize: pageData.collection.pageSize || 24,
      sort: "featured"
    };

    pageData.products.forEach((product, index) => {
      product.__index = index;
    });

    function getActiveFilters() {
      const filters = {};
      qsa("[data-filter-input]:checked").forEach((input) => {
        const group = input.dataset.filterGroup;
        if (!filters[group]) {
          filters[group] = [];
        }

        filters[group].push(input.value);
      });
      return filters;
    }

    function matchesFilters(product, filters) {
      if (query && !product.title.toLowerCase().includes(query)) {
        return false;
      }

      return Object.entries(filters).every(([group, values]) => {
        const haystack = product.filters[group] || [];
        return values.some((value) => haystack.includes(value));
      });
    }

    function sortProducts(items) {
      const sorted = [...items];
      switch (state.sort) {
        case "title-ascending":
          sorted.sort((left, right) => left.title.localeCompare(right.title));
          break;
        case "title-descending":
          sorted.sort((left, right) => right.title.localeCompare(left.title));
          break;
        case "created-descending":
          sorted.sort((left, right) => right.__index - left.__index);
          break;
        case "created-ascending":
          sorted.sort((left, right) => left.__index - right.__index);
          break;
        default:
          sorted.sort((left, right) => left.__index - right.__index);
          break;
      }
      return sorted;
    }

    function renderPagination(totalPages) {
      if (!pagination) {
        return;
      }

      if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
      }

      pagination.innerHTML = Array.from({ length: totalPages }, (_, index) => index + 1)
        .map(
          (page) => `
            <button class="pagination__button ${page === state.page ? "is-active" : ""}" type="button" data-page-button="${page}">
              ${page}
            </button>
          `
        )
        .join("");
    }

    function renderGrid() {
      const filters = getActiveFilters();
      const filtered = sortProducts(pageData.products.filter((product) => matchesFilters(product, filters)));
      const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
      if (state.page > totalPages) {
        state.page = 1;
      }

      const start = (state.page - 1) * state.pageSize;
      const items = filtered.slice(start, start + state.pageSize);

      grid.innerHTML = items.map(cardTemplate).join("");
      renderPagination(totalPages);
    }

    sortSelect?.addEventListener("change", () => {
      state.sort = sortSelect.value;
      state.page = 1;
      renderGrid();
    });

    qsa("[data-filter-input]").forEach((input) =>
      input.addEventListener("change", () => {
        state.page = 1;
        renderGrid();
      })
    );

    pagination?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page-button]");
      if (!button) {
        return;
      }

      state.page = Number(button.dataset.pageButton);
      renderGrid();
    });

    filterOpen?.addEventListener("click", () => {
      sidebar?.classList.toggle("is-open");
    });

    qsa("[data-filter-toggle]").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        toggle.parentElement?.classList.toggle("is-open");
      });
    });

    renderGrid();
  }

  function initProductPage() {
    if (pageData?.type !== "product") {
      return;
    }

    qsa("[data-product-thumb]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.dataset.productThumb;
        qsa("[data-product-thumb]").forEach((thumb) => thumb.classList.toggle("is-active", thumb === button));
        qsa("[data-product-media]").forEach((frame) => frame.classList.toggle("is-active", frame.dataset.productMedia === index));
      });
    });

    qsa("[data-tab-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const target = trigger.dataset.tabTrigger;
        qsa(".product__tab-trigger").forEach((item) => item.classList.toggle("is-active", item.contains(trigger)));
        qsa("[data-tab-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.tabPanel === target));
      });
    });

    const sizeGuide = qs("[data-size-guide]");
    qsa(".js-size-chart-open").forEach((button) =>
      button.addEventListener("click", () => {
        if (sizeGuide) {
          sizeGuide.hidden = false;
          document.documentElement.classList.add("has-modal");
        }
      })
    );

    qsa(".js-size-chart-close").forEach((button) =>
      button.addEventListener("click", () => {
        if (sizeGuide) {
          sizeGuide.hidden = true;
          document.documentElement.classList.remove("has-modal");
        }
      })
    );
  }

  function initReservationForms() {
    qsa("[data-reservation-form]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const handle =
          form.dataset.productHandle ||
          pageData?.product?.handle ||
          new URLSearchParams(window.location.search).get("product") ||
          "";

        if (!handle) {
          return;
        }

        let product = null;

        if (pageData?.type === "collection") {
          product = pageData.products.find((entry) => entry.handle === handle) || null;
        }

        if (pageData?.type === "product") {
          product = { ...pageData.product };
        }

        if (!product) {
          const catalog = await getCatalog();
          product = catalog.find((entry) => entry.handle === handle) || null;
        }

        if (!product) {
          return;
        }

        const selectedColor =
          formData.get("color") ||
          qs("[data-reservation-color]:checked")?.value ||
          pageData?.product?.colors?.[0] ||
          "";
        const selectedSize =
          formData.get("size") ||
          qs("[data-reservation-size]:checked")?.value ||
          qs("[data-reservation-size-select]")?.value ||
          "";

        const whatsappUrl = buildWhatsAppUrl(product, {
          color: selectedColor,
          size: selectedSize || "Made to measure",
          name: formData.get("name"),
          phone: formData.get("phone"),
          city: formData.get("city"),
          notes: formData.get("notes")
        });

        window.open(whatsappUrl, "_blank", "noopener");
      });
    });
  }

  function initReservationPage() {
    if (pageData?.type !== "reservation") {
      return;
    }

    const handle = new URLSearchParams(window.location.search).get("product") || "";
    const summary = qs("[data-reservation-selected]");
    const form = qs("[data-reservation-form]");
    const sizeSelect = qs("[data-reservation-size-select]");

    if (!handle || !summary || !form || !sizeSelect) {
      return;
    }

    getCatalog().then((catalog) => {
      const product = catalog.find((entry) => entry.handle === handle);
      if (!product) {
        return;
      }

      form.dataset.productHandle = handle;
      summary.innerHTML = `
        <div class="reservation-selected">
          <img src="${escapeHtml(product.primaryMedia?.src || "")}" alt="${escapeHtml(product.title)}" />
          <div>
            <span class="availability-copy ${product.isExclusive ? "availability-copy--exclusive" : ""}">${renderLabel(
              product.availabilityLabel || (product.isExclusive ? config.exclusiveLabel : config.availabilityLabel),
              "micro-copy",
              "inline"
            )}</span>
            <h3>${escapeHtml(product.title)}</h3>
            <p>${escapeHtml(product.bodyText || "")}</p>
          </div>
        </div>
      `;

      sizeSelect.innerHTML = product.sizes
        .map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`)
        .join("");

      if (!sizeSelect.innerHTML) {
        sizeSelect.innerHTML = '<option value="Made to measure">Made to measure</option>';
      }
    });
  }

  initDesktopNavigation();
  initMobileMenu();
  initNewsletterForm();
  initHeroSlideshow();
  initQuickView();
  initCollectionPage();
  initProductPage();
  initReservationForms();
  initReservationPage();
})();
