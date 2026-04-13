(function () {
  const config = window.ELEGANZA_CONFIG || {};
  const products = window.ELEGANZA_PRODUCTS || [];
  const productMap = new Map(products.map((product) => [product.slug, product]));
  let revealObserver;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function buildWhatsAppUrl(message) {
    const number = (config.whatsappNumber || "").replace(/\D/g, "");
    const encoded = encodeURIComponent(message);
    return number
      ? `https://wa.me/${number}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
  }

  function getModeLabel(mode) {
    return mode === "exclusive" ? "حصرية 2026" : "طلب خاص";
  }

  function getModeExperience(mode) {
    return mode === "exclusive" ? "جلسة حجز خاصة" : "طلب خاص مباشر";
  }

  function getModeTone(mode) {
    return mode === "exclusive" ? "chip chip--exclusive" : "chip chip--regular";
  }

  function getLeadTimeLabel(product) {
    return product.mode === "exclusive"
      ? `صنع خصيصاً لك خلال ${product.deliveryWindow}`
      : product.deliveryWindow;
  }

  function getPaymentLabel(product) {
    return product.fullPaymentRequired
      ? "اعتماد القطعة بعد سداد كامل القيمة"
      : "تأكيد الطلب أثناء المحادثة الخاصة";
  }

  function getPrimaryActionLabel(product) {
    return product.mode === "exclusive" ? "ابدئي طلب الحجز الخاص" : "ابدئي الطلب الخاص";
  }

  function getCheckoutLabel(product) {
    return product.mode === "exclusive" ? "جلسة الطلب الخاصة" : "إتمام الطلب الخاص";
  }

  function getAvailabilityCopy(product) {
    return product.mode === "exclusive"
      ? product.regionNote
      : "التوفر يُعتمد بحسب المقاس، لأن العرض هنا curated لا يعتمد على كثافة المخزون.";
  }

  function createMessage(product, extras = {}) {
    const lines = [
      `مرحباً فريق ${config.brandArabic || config.brandName || "Eleganza"}`,
      extras.intent || product.whatsAppMessage || config.whatsappDefaultNote,
      `المنتج: ${product.name}`,
      `الكود: ${product.sku}`,
      `فئة القطعة: ${getModeLabel(product.mode)}`,
      `نوع الخدمة: ${getModeExperience(product.mode)}`
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

    if (extras.eventDate) {
      lines.push(`تاريخ المناسبة: ${extras.eventDate}`);
    }

    if (extras.notes) {
      lines.push(`ملاحظات إضافية: ${extras.notes}`);
    }

    return lines.join("\n");
  }

  function navLink(pageId, href, label) {
    const active = document.body.dataset.page === pageId ? "is-active" : "";
    return `<a class="site-nav__link ${active}" href="${href}">${label}</a>`;
  }

  function initReveal() {
    const nodes = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18 }
      );
    }

    nodes.forEach((node) => {
      node.classList.add("reveal");
      if (!node.classList.contains("is-visible")) {
        revealObserver.observe(node);
      }
    });
  }

  function renderHeader() {
    const target = document.querySelector("[data-site-header]");

    if (!target) {
      return;
    }

    const defaultCheckout = products[0] ? `checkout.html?slug=${encodeURIComponent(products[0].slug)}` : "checkout.html";

    target.innerHTML = `
      <div class="topbar">
        <div class="shell topbar__inner">
          <a class="brand" href="index.html" aria-label="العودة إلى الرئيسية">
            <span class="brand__mark">
              <img src="${escapeHtml(config.logoSrc || "assets/images/brand-mark-320.png")}" alt="${escapeHtml(config.logoAlt || "شعار إيليجانزا")}" />
            </span>
            <span class="brand__copy">
              <span class="brand__latin">${escapeHtml(config.brandName || "ELEGANZA")}</span>
              <span class="brand__arabic">${escapeHtml(config.brandArabic || "إيليجانزا")}</span>
              <span class="brand__tagline">${escapeHtml(config.brandTagline || "دار فساتين سهرة فاخرة")}</span>
            </span>
          </a>
          <nav class="site-nav" aria-label="التنقل الرئيسي">
            ${navLink("home", "index.html", "الرئيسية")}
            ${navLink("shop", "shop.html", "المقتنيات")}
            ${navLink("exclusive", "exclusive-2026.html", "الحصرية 2026")}
            ${navLink("about", "about.html", "عن الدار")}
            ${navLink("booking", "booking.html", "الحجز المسبق")}
            ${navLink("contact", "contact.html", "التواصل")}
          </nav>
          <div class="topbar__actions">
            <a class="button button--ghost" href="${escapeHtml(config.facebookUrl)}" target="_blank" rel="noreferrer">الصفحة الرسمية</a>
            <a class="button button--dark" href="${escapeHtml(defaultCheckout)}">جلسة الطلب</a>
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

    const defaultCheckout = products[0] ? `checkout.html?slug=${encodeURIComponent(products[0].slug)}` : "checkout.html";

    target.innerHTML = `
      <footer class="site-footer">
        <div class="shell site-footer__grid">
          <div class="site-footer__brand">
            <span class="site-footer__mark">
              <img src="${escapeHtml(config.logoSrc || "assets/images/brand-mark-320.png")}" alt="${escapeHtml(config.logoAlt || "شعار إيليجانزا")}" />
            </span>
            <div>
              <span class="eyebrow">صالة عرض رقمية خاصة</span>
              <h2 class="site-footer__title">${escapeHtml(config.brandName || "ELEGANZA")}</h2>
              <p class="site-footer__text">
                ${escapeHtml(config.brandTagline || "دار فساتين سهرة فاخرة")} بتجربة هادئة، محسوبة، ومبنية على الندرة
                والاختيار المدروس لا على كثافة العرض.
              </p>
              <p class="site-footer__text">
                ${escapeHtml(config.brandAuthority || "موزع معتمد في ليبيا")}، مع مسار حجز خاص للقطع الحصرية
                وطلب مباشر راقٍ للمقتنيات المنتظمة.
              </p>
            </div>
          </div>
          <div>
            <strong class="site-footer__heading">المسارات</strong>
            <div class="site-footer__links">
              <a href="shop.html">المقتنيات</a>
              <a href="exclusive-2026.html">القطع الحصرية 2026</a>
              <a href="booking.html">الحجز المسبق</a>
              <a href="${escapeHtml(defaultCheckout)}">جلسة الطلب الخاصة</a>
            </div>
          </div>
          <div>
            <strong class="site-footer__heading">التواصل</strong>
            <div class="site-footer__links">
              <a href="${buildWhatsAppUrl(config.whatsappDefaultNote || "")}" target="_blank" rel="noreferrer">واتساب</a>
              <a href="${escapeHtml(config.facebookUrl)}" target="_blank" rel="noreferrer">فيسبوك</a>
              <a href="contact.html">قنوات التواصل</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function productCard(product) {
    const message = createMessage(product);

    return `
      <article class="product-card" data-reveal>
        <a class="product-card__media" href="product.html?slug=${encodeURIComponent(product.slug)}">
          <img src="${escapeHtml(product.images[0].src)}" alt="${escapeHtml(product.images[0].alt)}" loading="lazy" />
        </a>
        <div class="product-card__body">
          <div class="chip-row">
            <span class="${getModeTone(product.mode)}">${getModeLabel(product.mode)}</span>
            <span class="chip chip--line">${escapeHtml(product.sku)}</span>
          </div>
          <h3 class="product-card__title">${escapeHtml(product.name)}</h3>
          <p class="product-card__text">${escapeHtml(product.shortDescription)}</p>
          <p class="product-card__micro">${escapeHtml(getAvailabilityCopy(product))}</p>
          <div class="product-card__meta">
            <div>
              <strong class="product-card__price">${escapeHtml(product.priceLabel)}</strong>
              <span class="product-card__hint">${escapeHtml(getLeadTimeLabel(product))}</span>
            </div>
            <div class="product-card__actions">
              <a class="button button--ghost" href="product.html?slug=${encodeURIComponent(product.slug)}">تفاصيل القطعة</a>
              <a class="button ${product.mode === "exclusive" ? "button--dark" : "button--sand"}" href="${buildWhatsAppUrl(message)}" target="_blank" rel="noreferrer">
                ${getPrimaryActionLabel(product)}
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function editorialCard(product, featured = false) {
    const message = createMessage(product);
    const highlights = (product.highlights || [])
      .slice(0, 3)
      .map((item) => `<span class="chip chip--ghost">${escapeHtml(item)}</span>`)
      .join("");

    return `
      <article class="editorial-card ${featured ? "editorial-card--featured" : ""}" data-reveal>
        <a class="editorial-card__media" href="product.html?slug=${encodeURIComponent(product.slug)}">
          <img src="${escapeHtml(product.images[0].src)}" alt="${escapeHtml(product.images[0].alt)}" loading="lazy" />
        </a>
        <div class="editorial-card__content">
          <div class="chip-row">
            <span class="${getModeTone(product.mode)}">${getModeLabel(product.mode)}</span>
            <span class="chip chip--line">${escapeHtml(product.sku)}</span>
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.description)}</p>
          <div class="chip-row">${highlights}</div>
          <div class="editorial-card__footer">
            <div>
              <strong>${escapeHtml(product.priceLabel)}</strong>
              <span>${escapeHtml(getLeadTimeLabel(product))}</span>
            </div>
            <div class="button-row">
              <a class="button button--ghost" href="product.html?slug=${encodeURIComponent(product.slug)}">القصة كاملة</a>
              <a class="button button--sand" href="${buildWhatsAppUrl(message)}" target="_blank" rel="noreferrer">تواصلي الآن</a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function collectionSpotlight(productsList) {
    if (!productsList.length) {
      return `<div class="empty-state" data-reveal><h2>لا توجد قطع حالياً</h2><p>يمكنك العودة لاحقاً أو التواصل مباشرة لطلب التحديثات الخاصة بالمجموعة.</p></div>`;
    }

    const primary = productsList[0];
    const side = productsList.slice(1, 3);

    return `
      <div class="collection-spotlight" data-reveal>
        <article class="spotlight-main">
          <a class="spotlight-main__media" href="product.html?slug=${encodeURIComponent(primary.slug)}">
            <img src="${escapeHtml(primary.images[0].src)}" alt="${escapeHtml(primary.images[0].alt)}" loading="lazy" />
          </a>
          <div class="spotlight-main__copy">
            <span class="eyebrow">اختيار التحرير الأول</span>
            <div class="chip-row">
              <span class="${getModeTone(primary.mode)}">${getModeLabel(primary.mode)}</span>
              <span class="chip chip--line">${escapeHtml(primary.sku)}</span>
            </div>
            <h2>${escapeHtml(primary.name)}</h2>
            <p>${escapeHtml(primary.description)}</p>
            <ul class="bullet-list">
              <li>${escapeHtml(getLeadTimeLabel(primary))}</li>
              <li>${escapeHtml(getPaymentLabel(primary))}</li>
              <li>${escapeHtml(primary.regionNote)}</li>
            </ul>
            <div class="button-row">
              <a class="button button--dark" href="product.html?slug=${encodeURIComponent(primary.slug)}">استكشفي القطعة</a>
              <a class="button button--ghost" href="checkout.html?slug=${encodeURIComponent(primary.slug)}">${getCheckoutLabel(primary)}</a>
            </div>
          </div>
        </article>
        <div class="spotlight-stack">
          ${side
            .map(
              (product) => `
                <article class="spotlight-card">
                  <a class="spotlight-card__media" href="product.html?slug=${encodeURIComponent(product.slug)}">
                    <img src="${escapeHtml(product.images[0].src)}" alt="${escapeHtml(product.images[0].alt)}" loading="lazy" />
                  </a>
                  <div class="spotlight-card__copy">
                    <span class="${getModeTone(product.mode)}">${getModeLabel(product.mode)}</span>
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${escapeHtml(product.shortDescription)}</p>
                    <a class="text-link" href="product.html?slug=${encodeURIComponent(product.slug)}">اقرئي القصة</a>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderCards(targetSelector, list, builder) {
    const target = document.querySelector(targetSelector);

    if (!target) {
      return;
    }

    target.innerHTML = list.map((item, index) => builder(item, index === 0)).join("");
  }

  function renderGrid(targetSelector, list) {
    const target = document.querySelector(targetSelector);

    if (!target) {
      return;
    }

    target.innerHTML = list.map(productCard).join("");
  }

  function renderHomePage() {
    const exclusive = products.filter((item) => item.mode === "exclusive").slice(0, 3);
    renderCards("[data-featured-exclusive]", exclusive, editorialCard);
    renderGrid("[data-home-preview]", products.slice(0, 4));
    initReveal();
  }

  function renderShopPage() {
    const filters = document.querySelector("[data-shop-filters]");
    const spotlight = document.querySelector("[data-collection-spotlight]");
    const grid = document.querySelector("[data-shop-grid]");
    const count = document.querySelector("[data-shop-count]");

    if (!filters || !spotlight || !grid) {
      return;
    }

    const render = (mode) => {
      const filtered = mode === "all" ? products : products.filter((item) => item.mode === mode);
      spotlight.innerHTML = collectionSpotlight(filtered.slice(0, 3));
      grid.innerHTML = filtered.slice(3).map(productCard).join("");

      if (!filtered.slice(3).length && filtered.length <= 3) {
        grid.innerHTML = "";
      }

      if (count) {
        count.textContent =
          mode === "all"
            ? `تم اختيار ${filtered.length} قطعة داخل الصالة الرقمية الحالية.`
            : `يعرض هذا المسار ${filtered.length} ${mode === "exclusive" ? "قطعة حصرية" : "قطعة للطلب الخاص"}.`;
      }

      initReveal();
    };

    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");

      if (!button) {
        return;
      }

      filters.querySelectorAll("[data-filter]").forEach((node) => node.classList.remove("is-selected"));
      button.classList.add("is-selected");
      render(button.dataset.filter);
    });

    render("all");
  }

  function productStoryMarkup(product) {
    const detailItems = (product.details || [])
      .map((detail) => `<li>${escapeHtml(detail)}</li>`)
      .join("");
    const highlights = (product.highlights || [])
      .map((item) => `<span class="chip chip--ghost">${escapeHtml(item)}</span>`)
      .join("");

    return `
      <div class="story-grid-two">
        <article class="story-block" data-reveal>
          <span class="eyebrow">قصة التصميم</span>
          <h2>تفاصيل تُقرأ قبل أن تُرتدى</h2>
          <p>
            ${escapeHtml(product.description)}
          </p>
          <ul class="bullet-list">${detailItems}</ul>
        </article>
        <article class="story-block story-block--dark" data-reveal>
          <span class="eyebrow">منطق الاختيار</span>
          <h2>${product.mode === "exclusive" ? "ندرة محسوبة لا عرضاً سريعاً" : "شراء خاص بإيقاع هادئ"}</h2>
          <p>
            ${escapeHtml(
              product.mode === "exclusive"
                ? "هذه القطعة لا تُعرض بصيغة شراء سريع. يتم اعتمادها لعدد محدود لكل منطقة مع تجربة تنسيق شخصية من البداية حتى الاعتماد النهائي."
                : "القطعة المنتظمة هنا لا تُقدم كمنتج مزدحم في واجهة بيع تقليدية، بل كخيار منتقى بطلب خاص واضح ومباشر."
            )}
          </p>
          <div class="chip-row">${highlights}</div>
        </article>
      </div>
    `;
  }

  function productExperienceMarkup(product) {
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
      <div class="product-experience" data-reveal>
        <div class="product-gallery">
          <div class="product-gallery__stage">
            <img class="product-gallery__main" data-gallery-main src="${escapeHtml(product.images[0].src)}" alt="${escapeHtml(product.images[0].alt)}" />
          </div>
          <div class="product-gallery__thumbs">${thumbs}</div>
        </div>
        <aside class="product-summary">
          <div class="chip-row">
            <span class="${getModeTone(product.mode)}">${getModeLabel(product.mode)}</span>
            <span class="chip chip--line">${escapeHtml(product.sku)}</span>
          </div>
          <h1 class="product-summary__title">${escapeHtml(product.name)}</h1>
          <p class="product-summary__lead">${escapeHtml(product.shortDescription)}</p>
          <p class="product-summary__text">${escapeHtml(product.description)}</p>

          <div class="concierge-box">
            <strong>${product.mode === "exclusive" ? "صنع خصيصاً لك" : "طلب خاص بإيقاع راقٍ"}</strong>
            <span>${escapeHtml(
              product.mode === "exclusive"
                ? `بدلاً من لغة التأخير، نقدّم هذه القطعة كتنفيذ خاص يبدأ بعد اعتماد الحجز، خلال ${product.deliveryWindow}.`
                : "يتم تأكيد التوفر والمقاس عبر المحادثة الخاصة لتبقى التجربة هادئة وواضحة."
            )}</span>
          </div>

          <div class="fact-grid">
            <div class="fact-card">
              <span>المدة</span>
              <strong>${escapeHtml(getLeadTimeLabel(product))}</strong>
            </div>
            <div class="fact-card">
              <span>الندرة</span>
              <strong>${escapeHtml(getAvailabilityCopy(product))}</strong>
            </div>
            <div class="fact-card">
              <span>الدفع</span>
              <strong>${escapeHtml(getPaymentLabel(product))}</strong>
            </div>
          </div>

          <div class="product-summary__price">${escapeHtml(product.priceLabel)}</div>
          <div class="product-summary__note">${escapeHtml(
            product.mode === "exclusive"
              ? "يتم اعتماد القطعة حسب المدينة ثم تبدأ مرحلة التنفيذ الخاصة."
              : "تجربة الطلب المباشر هنا مصممة لتكون شخصية وبسيطة دون ازدحام خيارات."
          )}</div>

          <div class="selection-grid">
            <label class="field">
              <span>المقاس</span>
              <select data-product-size>
                ${product.sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>المدينة</span>
              <input type="text" data-product-city placeholder="مثال: طرابلس" />
            </label>
          </div>

          <div class="button-row">
            <a class="button button--dark" href="${buildWhatsAppUrl(createMessage(product))}" data-product-whatsapp target="_blank" rel="noreferrer">${getPrimaryActionLabel(product)}</a>
            <a class="button button--ghost" href="checkout.html?slug=${encodeURIComponent(product.slug)}" data-product-checkout>${getCheckoutLabel(product)}</a>
            <a class="button button--sand" href="booking.html?product=${encodeURIComponent(product.slug)}">حجز مسبق</a>
          </div>

          <p class="availability-note">${escapeHtml(
            product.mode === "exclusive"
              ? "عدد محدود من القطع يُعتمد لكل منطقة، لذلك يتم تثبيت الحجز بترتيب هادئ وواضح."
              : "المحادثة الخاصة تحل محل سلة الشراء التقليدية لتبقى التجربة أكثر أناقة وأقل ازدحاماً."
          )}</p>
        </aside>
      </div>
      ${productStoryMarkup(product)}
    `;
  }

  function bindProductInteractions(product) {
    const thumbs = document.querySelectorAll("[data-gallery-thumb]");
    const main = document.querySelector("[data-gallery-main]");
    const sizeInput = document.querySelector("[data-product-size]");
    const cityInput = document.querySelector("[data-product-city]");
    const button = document.querySelector("[data-product-whatsapp]");
    const checkoutLink = document.querySelector("[data-product-checkout]");

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbs.forEach((item) => item.classList.remove("is-active"));
        thumb.classList.add("is-active");
        main.src = thumb.dataset.src;
        main.alt = thumb.dataset.alt;
      });
    });

    const syncLinks = () => {
      const message = createMessage(product, {
        size: sizeInput ? sizeInput.value : "",
        city: cityInput ? cityInput.value.trim() : ""
      });

      if (button) {
        button.href = buildWhatsAppUrl(message);
      }

      if (checkoutLink) {
        const params = new URLSearchParams({ slug: product.slug });
        if (sizeInput && sizeInput.value) {
          params.set("size", sizeInput.value);
        }
        if (cityInput && cityInput.value.trim()) {
          params.set("city", cityInput.value.trim());
        }
        checkoutLink.href = `checkout.html?${params.toString()}`;
      }
    };

    if (sizeInput) {
      sizeInput.addEventListener("change", syncLinks);
    }

    if (cityInput) {
      cityInput.addEventListener("input", syncLinks);
    }

    syncLinks();
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
        <div class="empty-state" data-reveal>
          <h1>القطعة غير متاحة</h1>
          <p>تعذّر العثور على هذه القطعة. يمكنك العودة إلى المقتنيات الحالية أو بدء جلسة طلب خاصة من جديد.</p>
          <a class="button button--dark" href="shop.html">العودة إلى المقتنيات</a>
        </div>
      `;
      initReveal();
      return;
    }

    document.title = `${config.brandName || "Eleganza"} | ${product.name}`;
    target.innerHTML = productExperienceMarkup(product);
    bindProductInteractions(product);
    renderGrid("[data-related-products]", products.filter((item) => item.slug !== product.slug).slice(0, 3));
    initReveal();
  }

  function renderExclusivePage() {
    const editorialTarget = document.querySelector("[data-exclusive-editorial]");
    const gridTarget = document.querySelector("[data-exclusive-grid]");
    const list = products.filter((item) => item.mode === "exclusive");

    if (editorialTarget) {
      editorialTarget.innerHTML = collectionSpotlight(list.slice(0, 3));
    }

    if (gridTarget) {
      gridTarget.innerHTML = list.slice(3).map(productCard).join("");
    }

    initReveal();
  }

  function bookingPreviewMarkup(product) {
    return `
      <div class="reservation-preview__media">
        <img src="${escapeHtml(product.images[0].src)}" alt="${escapeHtml(product.images[0].alt)}" loading="lazy" />
      </div>
      <div class="reservation-preview__copy">
        <div class="chip-row">
          <span class="${getModeTone(product.mode)}">${getModeLabel(product.mode)}</span>
          <span class="chip chip--line">${escapeHtml(product.sku)}</span>
        </div>
        <h2>${escapeHtml(product.name)}</h2>
        <p>${escapeHtml(product.shortDescription)}</p>
        <ul class="bullet-list">
          <li>${escapeHtml(getLeadTimeLabel(product))}</li>
          <li>${escapeHtml(getPaymentLabel(product))}</li>
          <li>${escapeHtml(getAvailabilityCopy(product))}</li>
        </ul>
      </div>
    `;
  }

  function renderBookingPage() {
    const form = document.querySelector("[data-booking-form]");
    const productSelect = document.querySelector("[data-booking-product]");
    const sizeSelect = form ? form.querySelector("[name='size']") : null;
    const preview = document.querySelector("[data-booking-preview]");
    const checkoutLink = document.querySelector("[data-booking-checkout]");

    if (!form || !productSelect || !sizeSelect || !preview) {
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

    const syncPreview = () => {
      const selected = productMap.get(productSelect.value) || products[0];
      sizeSelect.innerHTML = selected.sizes
        .map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`)
        .join("");

      preview.innerHTML = bookingPreviewMarkup(selected);

      if (checkoutLink) {
        checkoutLink.href = `checkout.html?slug=${encodeURIComponent(selected.slug)}`;
      }

      initReveal();
    };

    productSelect.addEventListener("change", syncPreview);
    syncPreview();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const selected = productMap.get(productSelect.value) || products[0];
      const message = createMessage(selected, {
        intent:
          selected.mode === "exclusive"
            ? "أرغب في بدء حجز مسبق لقطعة حصرية مع تنسيق خاص."
            : "أرغب في بدء طلب خاص لقطعة من المقتنيات الحالية.",
        size: form.querySelector("[name='size']").value,
        city: form.querySelector("[name='city']").value.trim(),
        name: form.querySelector("[name='customerName']").value.trim(),
        phone: form.querySelector("[name='phone']").value.trim(),
        eventDate: form.querySelector("[name='eventDate']").value.trim(),
        notes: form.querySelector("[name='notes']").value.trim()
      });

      window.open(buildWhatsAppUrl(message), "_blank", "noopener");
    });

    initReveal();
  }

  function checkoutMarkup(product) {
    return `
      <div class="checkout-layout" data-reveal>
        <div class="checkout-summary">
          <div class="checkout-summary__media">
            <img src="${escapeHtml(product.images[0].src)}" alt="${escapeHtml(product.images[0].alt)}" loading="lazy" />
          </div>
          <div class="checkout-summary__copy">
            <div class="chip-row">
              <span class="${getModeTone(product.mode)}">${getModeLabel(product.mode)}</span>
              <span class="chip chip--line">${escapeHtml(product.sku)}</span>
            </div>
            <h2>${escapeHtml(product.name)}</h2>
            <p>${escapeHtml(product.description)}</p>
            <div class="checkout-facts">
              <div class="fact-card">
                <span>السعر</span>
                <strong>${escapeHtml(product.priceLabel)}</strong>
              </div>
              <div class="fact-card">
                <span>مدة التجهيز</span>
                <strong>${escapeHtml(getLeadTimeLabel(product))}</strong>
              </div>
              <div class="fact-card">
                <span>اعتماد الطلب</span>
                <strong>${escapeHtml(getPaymentLabel(product))}</strong>
              </div>
            </div>
            <p class="availability-note">${escapeHtml(
              product.mode === "exclusive"
                ? "هذا المسار لا يشبه checkout تقليدياً. هو جلسة اعتماد نهائية للقطعة قبل بدء التنفيذ الخاص."
                : "تم تصميم هذه الصفحة لتشبه استكمال جلسة خاصة أكثر من كونها سلة شراء تقليدية."
            )}</p>
          </div>
        </div>
        <div class="checkout-form-wrap">
          <span class="eyebrow">الاعتماد النهائي</span>
          <h2>جلسة طلب بهدوء يليق بالقطعة</h2>
          <p class="checkout-note">
            نحتاج فقط إلى التفاصيل الأساسية لاعتماد المسار المناسب ثم فتح المحادثة الخاصة عبر واتساب.
          </p>
          <form class="form-stack" data-checkout-form>
            <label class="field">
              <span>الاسم الكامل</span>
              <input type="text" name="customerName" required placeholder="الاسم كما تفضلين" />
            </label>
            <label class="field">
              <span>رقم التواصل</span>
              <input type="text" name="phone" required placeholder="رقم الهاتف أو واتساب" />
            </label>
            <div class="selection-grid">
              <label class="field">
                <span>المدينة</span>
                <input type="text" name="city" value="${escapeHtml(getParam("city") || "")}" required placeholder="مثال: طرابلس" />
              </label>
              <label class="field">
                <span>المقاس</span>
                <select name="size" data-checkout-size>
                  ${product.sizes
                    .map((size) => {
                      const selected = getParam("size") === size ? " selected" : "";
                      return `<option value="${escapeHtml(size)}"${selected}>${escapeHtml(size)}</option>`;
                    })
                    .join("")}
                </select>
              </label>
            </div>
            <label class="field">
              <span>تاريخ المناسبة</span>
              <input type="text" name="eventDate" placeholder="اختياري: تاريخ الحفل أو المناسبة" />
            </label>
            <label class="field">
              <span>ملاحظات خاصة</span>
              <textarea name="notes" placeholder="أي ملاحظة تساعد الفريق على ترتيب التجربة لك بشكل أدق"></textarea>
            </label>
            <div class="button-row">
              <button class="button button--dark" type="submit">إرسال الطلب الخاص عبر واتساب</button>
              <a class="button button--ghost" href="product.html?slug=${encodeURIComponent(product.slug)}">العودة إلى القطعة</a>
            </div>
          </form>
          <div class="checkout-guarantee">
            <strong>${product.mode === "exclusive" ? "القطعة تُنفذ عند الاعتماد" : "التنسيق يتم مباشرة بعد الاستلام"}</strong>
            <span>${escapeHtml(
              product.mode === "exclusive"
                ? "للقطع الحصرية، يُراجع التوفر الجغرافي أولاً، ثم يتم تثبيت القطعة ضمن نطاق محدود لكل منطقة."
                : "للمقتنيات المنتظمة، يتم تأكيد المقاس والتوفر عبر المحادثة مع الحفاظ على لغة تجربة هادئة وغير مزدحمة."
            )}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderCheckoutPage() {
    const target = document.querySelector("[data-checkout-root]");

    if (!target) {
      return;
    }

    const slug = getParam("slug") || "ss257-champagne";
    const product = productMap.get(slug) || products[0];
    const formIntent =
      product.mode === "exclusive"
        ? "أرغب في اعتماد جلسة طلب خاصة لقطعة حصرية."
        : "أرغب في استكمال الطلب الخاص لهذه القطعة.";

    target.innerHTML = checkoutMarkup(product);

    const form = target.querySelector("[data-checkout-form]");

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const message = createMessage(product, {
          intent: formIntent,
          size: form.querySelector("[name='size']").value,
          city: form.querySelector("[name='city']").value.trim(),
          name: form.querySelector("[name='customerName']").value.trim(),
          phone: form.querySelector("[name='phone']").value.trim(),
          eventDate: form.querySelector("[name='eventDate']").value.trim(),
          notes: form.querySelector("[name='notes']").value.trim()
        });

        window.open(buildWhatsAppUrl(message), "_blank", "noopener");
      });
    }

    initReveal();
  }

  function renderContactPage() {
    document.querySelectorAll("[data-whatsapp-link]").forEach((button) => {
      button.href = buildWhatsAppUrl(config.whatsappDefaultNote || "");
    });
    initReveal();
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

    if (page === "checkout") {
      renderCheckoutPage();
    }

    if (page === "contact") {
      renderContactPage();
    }

    initReveal();
  }

  document.addEventListener("DOMContentLoaded", initPage);
})();
