import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const referenceDir = path.join(projectRoot, "data", "reference");
const overridesPath = path.join(projectRoot, "data", "overrides.json");
const siteDir = path.join(projectRoot, "site");

const FILTER_GROUPS = [
  { key: "availability", label: { ar: "التوفر", en: "Availability" } },
  { key: "silhouette", label: { ar: "القصّة", en: "Silhouette" } },
  { key: "neckline", label: { ar: "الياقة", en: "Neckline" } },
  { key: "hemlineTrain", label: { ar: "الطول والذيل", en: "Hemline / Train" } },
  { key: "sleeves", label: { ar: "الأكمام", en: "Sleeves" } },
  { key: "fabric", label: { ar: "القماش", en: "Fabric" } },
  { key: "hotFeatures", label: { ar: "السمات البارزة", en: "Key Features" } },
  { key: "colors", label: { ar: "اللون", en: "Color" } }
];

const SORT_OPTIONS = [
  { value: "featured", label: "متميز" },
  { value: "title-ascending", label: "أبجديا، من الألف إلى الياء" },
  { value: "title-descending", label: "أبجديا، ZA" },
  { value: "created-descending", label: "التاريخ، الجديد إلى القديم" },
  { value: "created-ascending", label: "التاريخ، القديم إلى الجديد" }
];

const SIZE_GUIDE_ROWS = [
  ["US 2", "32¾ in", "25½ in", "35¾ in", "57¾ in"],
  ["US 4", "33½ in", "26¾ in", "36½ in", "57¾ in"],
  ["US 6", "34¾ in", "27½ in", "37¾ in", "59 in"],
  ["US 8", "35½ in", "28¼ in", "38½ in", "59 in"],
  ["US 10", "36½ in", "29½ in", "39¾ in", "59¾ in"],
  ["US 12", "38½ in", "31 in", "41¼ in", "59¾ in"],
  ["US 14", "39¼ in", "32¾ in", "43 in", "61 in"],
  ["US 16", "41 in", "33¾ in", "44 in", "61 in"],
  ["US 18", "43 in", "36¼ in", "45¾ in", "61 in"],
  ["US 20", "45 in", "38½ in", "47¾ in", "61 in"]
];

const UI_TRANSLATIONS = {
  "NEW IN": { ar: "الجديد", en: "New In" },
  CATEGORIES: { ar: "الفئات", en: "Categories" },
  OCCASION: { ar: "المناسبة", en: "Occasion" },
  SALE: { ar: "العروض", en: "Sale" },
  "EVENING DRESSES": { ar: "فساتين السهرة", en: "Evening Dresses" },
  "WEDDING DRESSES": { ar: "فساتين الزفاف", en: "Wedding Dresses" },
  "BRIDESMAID DRESSES": { ar: "فساتين الوصيفات", en: "Bridesmaid Dresses" },
  "All Dresses": { ar: "جميع الفساتين", en: "All Dresses" },
  "Best Sellers": { ar: "الأكثر طلباً", en: "Best Sellers" },
  "New Arrivals": { ar: "وصل حديثاً", en: "New Arrivals" },
  "Ready To Ship": { ar: "جاهز للشحن", en: "Ready To Ship" },
  "Made To Order": { ar: "يصنع عند الطلب", en: "Made To Order" },
  "Trending Now": { ar: "الرائج الآن", en: "Trending Now" },
  "SHOP BY STYLE": { ar: "التسوق حسب الأسلوب", en: "Shop by Style" },
  "SHOP BY COLOR": { ar: "التسوق حسب اللون", en: "Shop by Color" },
  "SHOP BY TRENDS": { ar: "التسوق حسب الاتجاه", en: "Shop by Trends" },
  "SHOP BY FABRIC": { ar: "التسوق حسب القماش", en: "Shop by Fabric" },
  "SHOP BY NECKLINE": { ar: "التسوق حسب الياقة", en: "Shop by Neckline" },
  "SHOP BY SILHOUETTE": { ar: "التسوق حسب القصّة", en: "Shop by Silhouette" },
  "SHOP BY SLEEVE": { ar: "التسوق حسب الأكمام", en: "Shop by Sleeve" },
  "SHOP BY LENGTH": { ar: "التسوق حسب الطول", en: "Shop by Length" },
  "SHOP BY TRAIN": { ar: "التسوق حسب الذيل", en: "Shop by Train" },
  "2026 Evening Dresses": { ar: "مجموعة 2026", en: "2026 Evening Dresses" },
  "2025 Evening Dresses": { ar: "مجموعة 2025", en: "2025 Evening Dresses" },
  "Wedding Dresses": { ar: "فساتين الزفاف", en: "Wedding Dresses" },
  "Plus Size": { ar: "المقاسات الممتدة", en: "Plus Size" },
  "Cocktail Dresses": { ar: "فساتين الكوكتيل", en: "Cocktail Dresses" },
  "Arabic Evening Dresses": { ar: "فساتين السهرة العربية", en: "Arabic Evening Dresses" },
  "Middle East Collection": { ar: "تشكيلة الشرق الأوسط", en: "Middle East Collection" },
  "Turkish Evening Gowns": { ar: "فساتين السهرة التركية", en: "Turkish Evening Gowns" },
  "Modest Evening Dresses": { ar: "فساتين السهرة المحتشمة", en: "Modest Evening Dresses" },
  "Luxury Evening Dresses": { ar: "فساتين السهرة الفاخرة", en: "Luxury Evening Dresses" }
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeFile(relativePath, content) {
  const filePath = path.join(siteDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function ensureDir(relativePath) {
  fs.mkdirSync(path.join(siteDir, relativePath), { recursive: true });
}

function emptyDir(relativePath) {
  fs.rmSync(path.join(siteDir, relativePath), { recursive: true, force: true });
}

function escapeHtml(value = "") {
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

function toLabel(value) {
  if (isLabelObject(value)) {
    return value;
  }

  return UI_TRANSLATIONS[value] || { en: String(value || "") };
}

function labelText(value, locale = "ar") {
  const label = toLabel(value);
  return label[locale] || label.ar || label.en || "";
}

function renderLabel(value, className = "ui-copy", variant = "stacked") {
  const label = toLabel(value);
  const ar = label.ar || "";
  const en = label.en || "";

  if (ar && en) {
    if (variant === "inline") {
      return `
        <span class="${className} ${className}--inline">
          <span class="${className}__ar">${escapeHtml(ar)}</span>
          <span class="${className}__divider" aria-hidden="true">/</span>
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

  const single = ar || en;
  return `<span class="${className} ${className}--single">${escapeHtml(single)}</span>`;
}

function editorialHeading(primary, secondary = "") {
  return `
    <div class="editorial-heading">
      <span class="editorial-heading__eyebrow">${renderLabel(primary, "ui-copy", "inline")}</span>
      ${secondary ? `<p class="editorial-heading__text">${renderLabel(secondary, "ui-copy")}</p>` : ""}
    </div>
  `;
}

function serializeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function stripHtml(value = "") {
  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function routeForCollection(slug) {
  return `ar/collections/${slug}/`;
}

function routeForProduct(handle) {
  return `ar/products/${handle}/`;
}

function routeForReservation(handle = "") {
  return handle ? `ar/reservation/?product=${encodeURIComponent(handle)}` : "ar/reservation/";
}

function relativePrefix(relativePath) {
  const filePath = path.join(siteDir, relativePath);
  const relative = path.relative(path.dirname(filePath), siteDir).replaceAll(path.sep, "/");
  return relative ? `${relative}/` : "";
}

function toInternalHref(prefix, route) {
  return `${prefix}${route}`;
}

function reservationSizeOptions(product) {
  const sizes = product.sizes.length ? product.sizes : ["Made to measure"];
  return sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join("");
}

function colorToCss(name = "") {
  const value = name.trim().toLowerCase();
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

function buildWhatsAppUrl(config, product, extras = {}) {
  const number = (config.whatsappNumber || "").replace(/\D/g, "");
  const lines = [
    `مرحباً فريق ${config.brandArabic}`,
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

function icon(name) {
  const icons = {
    menu:
      '<svg viewBox="0 0 20 14" aria-hidden="true"><path d="M0 1h20v2H0zm0 5h20v2H0zm0 5h20v2H0z"/></svg>',
    search:
      '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M14.3 12.6h-.9l-.3-.3a7.2 7.2 0 1 0-.8.8l.3.3v.9l5.7 5.7 1.7-1.7-5.7-5.7Zm-6.9 0a5.1 5.1 0 1 1 0-10.2 5.1 5.1 0 0 1 0 10.2Z"/></svg>',
    user:
      '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 9a3.4 3.4 0 1 0 0-6.8A3.4 3.4 0 0 0 10 9Zm0 2.2c-3.6 0-6.6 2.5-6.6 5.6V20h2.2v-3.2c0-1.2 1.4-3.4 4.4-3.4s4.4 2.2 4.4 3.4V20h2.2v-3.2c0-3.1-3-5.6-6.6-5.6Z"/></svg>',
    bag:
      '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 6V5a5 5 0 1 1 10 0v1h3l-1.2 12H3.2L2 6h3Zm2 0h6V5a3 3 0 1 0-6 0v1Z"/></svg>',
    chevronDown:
      '<svg viewBox="0 0 20 13" aria-hidden="true"><path d="m2.3 0 7.7 8.3L17.7 0 20 2.5 10 13.3 0 2.5Z"/></svg>',
    chevronRight:
      '<svg viewBox="0 0 13 20" aria-hidden="true"><path d="M0 2.3 2.5 0 13.3 10 2.5 20 0 17.7 8.3 10Z"/></svg>',
    close:
      '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m3 4.4 1.4-1.4L10 8.6 15.6 3 17 4.4 11.4 10 17 15.6 15.6 17 10 11.4 4.4 17 3 15.6 8.6 10Z"/></svg>',
    play:
      '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="rgba(0,0,0,.38)"/><path d="M16 13 28 20 16 27Z" fill="#fff"/></svg>'
  };

  return icons[name] || "";
}

function decorateProducts(catalog, collections, overrides, config) {
  const collectionMap = new Map(collections.map((collection) => [collection.slug, collection]));

  return catalog.map((product) => {
    const isExclusive = (overrides.exclusiveHandles || []).includes(product.handle);
    const label =
      overrides.availabilityLabels?.[product.handle] ||
      (isExclusive ? config.exclusiveLabel : config.availabilityLabel);
    const reservationLabel =
      overrides.reservationLabels?.[product.handle] ||
      (isExclusive ? config.secondaryCTA : config.primaryCTA);

    return {
      ...product,
      isExclusive,
      availabilityLabel: label,
      reservationLabel,
      primaryMedia: product.media[0] || null,
      hoverMedia: product.media[1] || product.media[0] || null,
      collectionTitles: product.collections.map((slug) => collectionMap.get(slug)?.title || slug)
    };
  });
}

function buildCollectionIndex(collections, products) {
  const productMap = new Map(products.map((product) => [product.handle, product]));

  return collections.map((collection) => {
    const items = collection.handles
      .map((handle) => productMap.get(handle))
      .filter(Boolean);

    return {
      ...collection,
      pageSize: collection.pageSize || 24,
      products: items
    };
  });
}

function buildFilterGroups(products) {
  return FILTER_GROUPS.map((group) => {
    const counts = new Map();

    products.forEach((product) => {
      const values = Array.isArray(product.filters[group.key]) ? product.filters[group.key] : [];
      values.forEach((value) => {
        if (!value) {
          return;
        }

        counts.set(value, (counts.get(value) || 0) + 1);
      });
    });

    const options = Array.from(counts.entries())
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([value, count]) => ({ value, count }));

    return {
      ...group,
      options
    };
  }).filter((group) => group.options.length);
}

function renderAnnouncement(config) {
  const items = config.announcementMessages;
  return `
    <section class="announcement-bar" aria-label="Brand announcements">
      <div class="announcement-bar__viewport">
        <div class="announcement-bar__track">
          ${items.map((item) => `<span class="announcement-bar__item">${renderLabel(item, "micro-copy", "inline")}</span>`).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderDesktopNavigation(prefix, navigation) {
  return navigation
    .map((item) => {
      const itemHref = item.slug ? toInternalHref(prefix, routeForCollection(item.slug)) : "#";
      const hasGroups = item.groups.length > 0;
      const isMega = item.groups.length === 1 || item.label === "OCCASION" || item.label === "SALE" || item.label === "NEW IN";

      if (!hasGroups) {
        return `
          <li class="navigation__menuitem">
            <a class="navigation__menulink" href="${escapeHtml(itemHref)}">${renderLabel(item.label, "nav-copy")}</a>
          </li>
        `;
      }

      if (isMega) {
        return `
          <li class="navigation__menuitem navigation__menuitem--dropdown">
            <a class="navigation__menulink" href="${escapeHtml(itemHref)}">
              ${renderLabel(item.label, "nav-copy")}
              <span class="nav-icon">${icon("chevronDown")}</span>
            </a>
            <div class="megamenu">
              <div class="megamenu__container">
                ${item.groups
                  .map(
                    (group) => `
                      <div class="megamenu__column">
                        <h4 class="megamenu__header">
                          <a href="${escapeHtml(group.slug ? toInternalHref(prefix, routeForCollection(group.slug)) : "#")}">${renderLabel(
                            group.label,
                            "menu-copy"
                          )}</a>
                        </h4>
                        <ul class="megamenu__list">
                          ${group.items
                            .map(
                              (entry) => `
                                <li class="megamenu__listitem">
                                  <a class="megamenu__listlink" href="${escapeHtml(
                                    entry.slug ? toInternalHref(prefix, routeForCollection(entry.slug)) : "#"
                                  )}">${renderLabel(entry.label, "menu-copy", "inline")}</a>
                                </li>
                              `
                            )
                            .join("")}
                        </ul>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </li>
        `;
      }

      return `
        <li class="navigation__menuitem navigation__menuitem--dropdown">
          <a class="navigation__menulink" href="${escapeHtml(itemHref)}">
            ${renderLabel(item.label, "nav-copy")}
            <span class="nav-icon">${icon("chevronDown")}</span>
          </a>
          <div class="dropdown">
            <ul class="dropdown__list">
              ${item.groups
                .map(
                  (group) => `
                    <li class="dropdown__item dropdown__item--nested">
                      <a class="dropdown__link" href="${escapeHtml(
                        group.slug ? toInternalHref(prefix, routeForCollection(group.slug)) : "#"
                      )}">
                        ${renderLabel(group.label, "menu-copy", "inline")}
                        <span class="nav-icon">${icon("chevronRight")}</span>
                      </a>
                      <ul class="dropdown dropdown--nested">
                        ${group.items
                          .map(
                            (entry) => `
                              <li class="dropdown__item">
                                <a class="dropdown__link" href="${escapeHtml(
                                  entry.slug ? toInternalHref(prefix, routeForCollection(entry.slug)) : "#"
                                )}">${renderLabel(entry.label, "menu-copy", "inline")}</a>
                              </li>
                            `
                          )
                          .join("")}
                      </ul>
                    </li>
                  `
                )
                .join("")}
            </ul>
          </div>
        </li>
      `;
    })
    .join("");
}

function renderMobileNavigation(prefix, navigation) {
  return navigation
    .map(
      (item, index) => `
        <div class="mobile-nav__group" data-mobile-group>
          <button class="mobile-nav__toggle" type="button" aria-expanded="false">
            ${renderLabel(item.label, "nav-copy")}
            <span class="nav-icon">${icon("chevronDown")}</span>
          </button>
          <div class="mobile-nav__panel">
            <a class="mobile-nav__root-link" href="${escapeHtml(
              item.slug ? toInternalHref(prefix, routeForCollection(item.slug)) : "#"
            )}">${renderLabel({ ar: "استكشفي القسم", en: "Explore Section" }, "menu-copy")}</a>
            ${item.groups
              .map(
                (group) => `
                  <div class="mobile-nav__subgroup">
                    <a class="mobile-nav__heading" href="${escapeHtml(
                      group.slug ? toInternalHref(prefix, routeForCollection(group.slug)) : "#"
                    )}">${renderLabel(group.label, "menu-copy", "inline")}</a>
                    <ul class="mobile-nav__items">
                      ${group.items
                        .map(
                          (entry) => `
                            <li>
                              <a href="${escapeHtml(
                                entry.slug ? toInternalHref(prefix, routeForCollection(entry.slug)) : "#"
                              )}">${renderLabel(entry.label, "menu-copy", "inline")}</a>
                            </li>
                          `
                        )
                        .join("")}
                    </ul>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `
    )
    .join("");
}

function renderHeader(prefix, config, navigation) {
  const allHref = toInternalHref(prefix, routeForCollection("all"));
  const reservationHref = toInternalHref(prefix, routeForReservation());
  const aboutHref = toInternalHref(prefix, "ar/");
  return `
    ${renderAnnouncement(config)}
    <theme-header class="site-header">
      <div class="header-section">
        <header class="theme-header">
          <div class="header--container">
            <div class="mobile-menu__trigger">
              <button class="icon-button js-mobile-menu-open" type="button" aria-label="Open navigation">
                ${icon("menu")}
              </button>
            </div>
            <div class="header-utility">
              <ul class="header-actions">
                <li>
                  <a href="${escapeHtml(aboutHref)}">
                    ${renderLabel(config.utilityShowroom, "action-copy")}
                    <span class="nav-icon">${icon("user")}</span>
                  </a>
                </li>
                <li>
                  <a href="${escapeHtml(reservationHref)}">
                    ${renderLabel(config.utilityReservation, "action-copy")}
                    <span class="nav-icon">${icon("bag")}</span>
                  </a>
                </li>
              </ul>
            </div>
            <div class="theme__logo">
              <a href="${escapeHtml(toInternalHref(prefix, "ar/"))}">
                <img src="${escapeHtml(`${prefix}${config.logoPath}`)}" alt="${escapeHtml(config.logoAlt)}" />
              </a>
            </div>
            <div class="large-search">
              <form action="${escapeHtml(allHref)}" method="get" class="header-search-form">
                <span class="header-search-form__label">${renderLabel(config.searchLabel, "micro-copy", "inline")}</span>
                <div class="header-search-form__inner">
                  <label class="visually-hidden" for="header-search">Search</label>
                  <input class="header-search" id="header-search" type="text" name="q" placeholder="${escapeHtml(config.searchPlaceholder)}" />
                  <button class="icon-button" type="submit" aria-label="Search">${icon("search")}</button>
                </div>
              </form>
            </div>
          </div>
        </header>
        <nav class="navigation full-nav">
          <div class="navigation__maincontainer">
            <ul class="navigation__list">
              ${renderDesktopNavigation(prefix, navigation)}
            </ul>
          </div>
        </nav>
      </div>
      <div class="mobile-drawer" id="mobile-drawer" hidden>
        <div class="mobile-drawer__overlay js-mobile-menu-close"></div>
        <aside class="mobile-drawer__panel" aria-label="Mobile navigation">
          <div class="mobile-drawer__header">
            <strong>${renderLabel({ ar: config.brandArabic, en: config.brandName }, "brand-copy")}</strong>
            <button class="icon-button js-mobile-menu-close" type="button" aria-label="Close navigation">${icon("close")}</button>
          </div>
          <div class="mobile-nav">
            ${renderMobileNavigation(prefix, navigation)}
          </div>
        </aside>
      </div>
      <div class="quickview-modal" id="quickview-modal" hidden>
        <div class="quickview-modal__overlay js-quickview-close"></div>
        <aside class="quickview-modal__panel" aria-label="Quick view">
          <button class="icon-button quickview-modal__close js-quickview-close" type="button" aria-label="Close quick view">${icon("close")}</button>
          <div class="quickview-modal__content" data-quickview-content></div>
        </aside>
      </div>
    </theme-header>
  `;
}

function renderFooter(prefix, config, navigation) {
  return `
    <section class="newsletter__section">
      <div class="newsletter__section-container">
        <div class="newsletter__section-content">
          <span class="newsletter__eyebrow">${renderLabel({ ar: "قائمة خاصة", en: "Private List" }, "micro-copy", "inline")}</span>
          <h2>${renderLabel(config.newsletterHeading, "display-copy")}</h2>
          <p>${renderLabel(config.newsletterText, "ui-copy")}</p>
        </div>
        <form class="newsletter__form" action="#" method="post" data-newsletter-form>
          <label class="visually-hidden" for="newsletter-email">Email</label>
          <input id="newsletter-email" class="newsletter__input" type="email" placeholder="أدخل عنوان بريدك الإلكتروني" />
          <button class="newsletter__submit" type="submit">${renderLabel(config.newsletterButton, "button-copy")}</button>
        </form>
      </div>
    </section>
    <footer class="footer-section">
      <div class="footer-grid">
        <div>
          <h3>${renderLabel({ ar: config.brandArabic, en: config.brandName }, "display-copy")}</h3>
          <p>${escapeHtml(config.brandTagline)}</p>
          <p>${escapeHtml(config.brandAuthority)}</p>
        </div>
        <div>
          <h4>${renderLabel({ ar: "المجموعات", en: "Collections" }, "menu-copy", "inline")}</h4>
          <ul class="footer-links">
            ${navigation
              .slice(0, 4)
              .map(
                (item) => `
                  <li>
                    <a href="${escapeHtml(item.slug ? toInternalHref(prefix, routeForCollection(item.slug)) : "#")}">${renderLabel(
                      item.label,
                      "menu-copy",
                      "inline"
                    )}</a>
                  </li>
                `
              )
              .join("")}
          </ul>
        </div>
        <div>
          <h4>${renderLabel({ ar: "الحجز", en: "Reservation" }, "menu-copy", "inline")}</h4>
          <ul class="footer-links">
            <li><a href="${escapeHtml(toInternalHref(prefix, routeForReservation()))}">${renderLabel(config.reservationHeading, "menu-copy")}</a></li>
            <li><a href="${escapeHtml(config.facebookUrl)}" target="_blank" rel="noreferrer">Facebook</a></li>
          </ul>
        </div>
      </div>
    </footer>
  `;
}

function renderProductSwatches(product) {
  if (!product.colors.length) {
    return "";
  }

  return `
    <div class="product--grid__swatches">
      <div class="prod-colors">
        <div class="color-swatch">
          <ul class="color options">
            ${product.colors
              .map(
                (color) => `
                  <li data-option-title="${escapeHtml(color)}" class="color">
                    <span class="swatch-circle" title="${escapeHtml(color)}" style="background-color:${escapeHtml(colorToCss(color))};"></span>
                  </li>
                `
              )
              .join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function renderProductCard(product, prefix) {
  const productHref = toInternalHref(prefix, routeForProduct(product.handle));
  const reservationHref = toInternalHref(prefix, routeForReservation(product.handle));
  const image = product.primaryMedia?.src || "";
  const hoverImage = product.hoverMedia?.src || image;

  return `
    <article class="product-index" data-product-card data-product-handle="${escapeHtml(product.handle)}">
      <div class="prod-container">
        <div class="prod-image image_portrait">
          <a href="${escapeHtml(productHref)}" title="${escapeHtml(product.title)}">
            <div class="reveal reveal--image">
              <div class="box-ratio box-ratio--square">
                <img class="primary-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}" loading="lazy" />
                <img class="secondary-image" src="${escapeHtml(hoverImage)}" alt="" loading="lazy" />
              </div>
            </div>
          </a>
        </div>
        <button class="product-listing__quickview-trigger js-quickview-open" type="button" data-product-handle="${escapeHtml(product.handle)}">
          ${renderLabel({ ar: "عرض سريع", en: "Quick View" }, "micro-copy", "inline")}
        </button>
      </div>
      <div class="product-info">
        <div class="product-info__meta">${renderLabel(product.isExclusive ? product.availabilityLabel : { ar: "قطعة منسقة", en: "Curated Piece" }, "micro-copy", "inline")}</div>
        <a href="${escapeHtml(productHref)}"><h2>${escapeHtml(product.title)}</h2></a>
        <div class="availability-copy ${product.isExclusive ? "availability-copy--exclusive" : ""}">
          ${renderLabel(product.availabilityLabel, "micro-copy", "inline")}
        </div>
        ${renderProductSwatches(product)}
        <div class="product-card__actions">
          <a class="button button--dark" href="${escapeHtml(reservationHref)}">${renderLabel(product.reservationLabel, "button-copy")}</a>
          <a class="button button--text" href="${escapeHtml(productHref)}">${renderLabel({ ar: "استكشفي القطعة", en: "View Piece" }, "micro-copy", "inline")}</a>
        </div>
      </div>
    </article>
  `;
}

function renderHero(homepage, prefix, config) {
  const featuredTarget = homepage.featuredSections?.[0]?.slug ? toInternalHref(prefix, routeForCollection(homepage.featuredSections[0].slug)) : "#";
  const reservationHref = toInternalHref(prefix, routeForReservation());
  return `
    <section class="slideshow-section" data-slideshow>
      <div class="slideshow" data-slides>
        ${homepage.heroSlides
          .map(
            (slide, index) => `
              <article class="slideshow__slide ${index === 0 ? "is-active" : ""}" data-slide>
                <a class="slide__image-link" href="${escapeHtml(
                  slide.href ? toInternalHref(prefix, routeForCollection(slide.href.split("/").pop())) : "#"
                )}">
                  <div class="slideshow__slide-image">
                    <div class="box-ratio box-ratio--hero desktop-only">
                      <img src="${escapeHtml(slide.desktopImage)}" alt="" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} />
                    </div>
                    <div class="box-ratio box-ratio--hero-mobile mobile-only">
                      <img src="${escapeHtml(slide.mobileImage || slide.desktopImage)}" alt="" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} />
                    </div>
                  </div>
                </a>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="slideshow__editorial">
        <div class="hero-panel">
          <span class="hero-panel__eyebrow">${renderLabel(config.heroKicker, "micro-copy", "inline")}</span>
          <h1>${renderLabel(config.heroTitle, "display-copy")}</h1>
          <p>${renderLabel(config.heroText, "ui-copy")}</p>
          <div class="hero-panel__actions">
            <a class="button button--dark" href="${escapeHtml(featuredTarget)}">${renderLabel(config.heroPrimaryCTA, "button-copy")}</a>
            <a class="button button--ghost" href="${escapeHtml(reservationHref)}">${renderLabel(config.heroSecondaryCTA, "button-copy")}</a>
          </div>
        </div>
      </div>
      <div class="slideshow__dots">
        ${homepage.heroSlides
          .map(
            (_, index) => `
              <button class="slideshow__dot ${index === 0 ? "is-active" : ""}" type="button" data-slide-dot="${index}" aria-label="Slide ${index + 1}"></button>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderFeaturedSection(section, prefix) {
  const content =
    section.kind === "carousel"
      ? `<div class="featured__collection-carousel" data-carousel>${section.products
          .map((product) => renderProductCard(product, prefix))
          .join("")}</div>`
      : `<div class="featured__collection">${section.products.map((product) => renderProductCard(product, prefix)).join("")}</div>`;

  return `
    <section class="global__section">
      <div class="section-heading-row">
        <div>
          <span class="section-heading__eyebrow">${renderLabel(section.kicker || { ar: "اختيار منسق", en: "Curated Selection" }, "micro-copy", "inline")}</span>
          <h2 class="section-heading"><a href="${escapeHtml(
            toInternalHref(prefix, routeForCollection(section.slug))
          )}">${renderLabel(section.heading, "display-copy")}</a></h2>
          ${section.summary ? `<p class="section-heading__summary">${escapeHtml(section.summary)}</p>` : ""}
        </div>
      </div>
      ${content}
    </section>
  `;
}

function renderSecondaryBanner(homepage, prefix) {
  if (!homepage.secondaryBanner?.desktopImage) {
    return "";
  }

  const targetHref = homepage.secondaryBanner.href
    ? toInternalHref(prefix, routeForCollection(homepage.secondaryBanner.href.split("/").pop()))
    : "#";

  return `
    <section class="slideshow-section slideshow-section--secondary">
      <article class="slideshow__slide is-active">
        <a class="slide__image-link" href="${escapeHtml(targetHref)}">
          <div class="slideshow__slide-image">
            <div class="box-ratio box-ratio--hero desktop-only">
              <img src="${escapeHtml(homepage.secondaryBanner.desktopImage)}" alt="" loading="lazy" />
            </div>
            <div class="box-ratio box-ratio--hero-mobile mobile-only">
              <img src="${escapeHtml(homepage.secondaryBanner.mobileImage || homepage.secondaryBanner.desktopImage)}" alt="" loading="lazy" />
            </div>
          </div>
        </a>
        <div class="secondary-banner__copy">
          <span class="section-heading__eyebrow">${renderLabel({ ar: "قطع محدودة", en: "Limited Pieces" }, "micro-copy", "inline")}</span>
          <h2>${renderLabel({ ar: "تصاميم تستحق موعداً خاصاً", en: "Pieces worthy of a private appointment" }, "display-copy")}</h2>
        </div>
      </article>
    </section>
  `;
}

function renderVideo(homepage) {
  return `
    <section class="video__section">
      <div class="videoWrapper">
        <iframe src="${escapeHtml(homepage.video.embedUrl)}" title="Eleganza showroom video" width="850" height="480" frameborder="0" allowfullscreen></iframe>
      </div>
    </section>
  `;
}

function renderReviews(homepage) {
  return `
    <section class="reviews-carousel" data-carousel>
      <div class="reviews-carousel__header">
        <span class="section-heading__eyebrow">${renderLabel({ ar: "آراء عميلات الدار", en: "Atelier Notes" }, "micro-copy", "inline")}</span>
        <h2>${renderLabel({ ar: "تجارب هادئة تشبه زيارة المشغل", en: "Feedback shaped like a private showroom visit" }, "display-copy")}</h2>
        <p>${escapeHtml(`${homepage.reviews.rating.toFixed(2)} ★ (${homepage.reviews.count})`)}</p>
      </div>
      <div class="reviews-carousel__track">
        ${homepage.reviews.cards
          .map(
            (card) => `
              <article class="review-card">
                <h3>${escapeHtml(card.name)}</h3>
                <p class="review-card__meta">${escapeHtml(card.location)}</p>
                <p>${escapeHtml(card.quote)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderBreadcrumb(prefix, parts) {
  const base = [
    {
      label: { ar: "الرئيسية", en: "Home" },
      href: toInternalHref(prefix, "ar/")
    }
  ];

  const items = [...base, ...parts];
  return `
    <section class="breadcrumb">
      <div class="breadcrumb__inner">
        ${items
          .map((item, index) =>
            item.href && index !== items.length - 1
              ? `<a href="${escapeHtml(item.href)}">${renderLabel(item.label, "micro-copy", "inline")}</a>`
              : `<span>${renderLabel(item.label, "micro-copy", "inline")}</span>`
          )
          .join('<span class="separator"> / </span>')}
      </div>
    </section>
  `;
}

function renderFilters(filterGroups) {
  return `
    <form class="collection-sidebar" data-collection-sidebar>
      <div class="collection__page-sort">
        <label class="collection-sort__label" for="collection-sort">${renderLabel({ ar: "ترتيب العرض", en: "Sort By" }, "micro-copy", "inline")}</label>
        <select id="collection-sort" class="collection-sort__select" data-collection-sort>
          ${SORT_OPTIONS.map((option) => `<option value="${option.value}">${escapeHtml(option.label)}</option>`).join("")}
        </select>
      </div>
      ${filterGroups
        .map(
          (group) => `
            <section class="filter-group">
              <button class="filter-group__toggle" type="button" data-filter-toggle>
                ${renderLabel(group.label, "menu-copy", "inline")}
                <span class="nav-icon">${icon("chevronDown")}</span>
              </button>
              <div class="filter-group__panel">
                ${group.options
                  .map(
                    (option) => `
                      <label class="filter-option">
                        <input type="checkbox" data-filter-input data-filter-group="${escapeHtml(group.key)}" value="${escapeHtml(option.value)}" />
                        <span>${escapeHtml(option.value)}</span>
                        <span class="filter-count">(${option.count})</span>
                      </label>
                    `
                  )
                  .join("")}
              </div>
            </section>
          `
        )
        .join("")}
    </form>
  `;
}

function renderCollectionPage(collection, prefix) {
  const filterGroups = buildFilterGroups(collection.products);
  const firstPageProducts = collection.products.slice(0, collection.pageSize);
  const collectionLabel = UI_TRANSLATIONS[collection.title] || { en: collection.title };

  return `
    ${renderBreadcrumb(prefix, [{ label: collection.title }])}
    <section class="collection__page">
      <div class="collection__mobile-toolbar">
        <button class="button button--ghost js-filter-open" type="button">${renderLabel({ ar: "الفلاتر", en: "Filters" }, "button-copy")}</button>
        <span class="collection__results-count">${escapeHtml(`${collection.products.length} قطعة`)}</span>
      </div>
      <div class="collection-layout">
        ${renderFilters(filterGroups)}
        <div class="collection__page--productContent">
          <header class="collection-header">
            <span class="section-heading__eyebrow">${renderLabel({ ar: "مجموعة منسقة", en: "Curated Collection" }, "micro-copy", "inline")}</span>
            <h1>${renderLabel(collectionLabel, "display-copy")}</h1>
            <p>${escapeHtml(collection.description || `Curated selection for ${collection.title}`)}</p>
          </header>
          <div class="product-loop collection__page-products" data-collection-grid>
            ${firstPageProducts.map((product) => renderProductCard(product, prefix)).join("")}
          </div>
          <div class="pagination" data-collection-pagination></div>
        </div>
      </div>
    </section>
    <script id="page-data" type="application/json">${serializeJson({
      type: "collection",
      collection: {
        slug: collection.slug,
        title: collection.title,
        pageSize: collection.pageSize
      },
      products: collection.products.map((product) => ({
        handle: product.handle,
        title: product.title,
        availabilityLabel: product.availabilityLabel,
        reservationLabel: product.reservationLabel,
        isExclusive: product.isExclusive,
        primaryMedia: product.primaryMedia,
        hoverMedia: product.hoverMedia,
        colors: product.colors,
        sizes: product.sizes,
        filters: product.filters
      }))
    })}</script>
  `;
}

function renderProductGallery(product) {
  return `
    <div class="product__section-images">
      <div class="product__gallery--container">
        <div class="thumb-slider">
          ${product.media
            .map(
              (media, index) => `
                <button class="product-single__thumbnail ${index === 0 ? "is-active" : ""}" type="button" data-product-thumb="${index}" aria-label="Media ${index + 1}">
                  <img src="${escapeHtml(media.src)}" alt="" loading="lazy" />
                </button>
              `
            )
            .join("")}
        </div>
        <div class="product__main-media" data-product-media-stage>
          ${product.media
            .map(
              (media, index) => `
                <figure class="product__media-frame ${index === 0 ? "is-active" : ""}" data-product-media="${index}">
                  <img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || product.title)}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} />
                </figure>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderProductOptions(product) {
  return `
    <div class="product__variants-swatches">
      ${
        product.colors.length
          ? `
            <div class="swatches__container">
              <p class="swatches__option-name">${renderLabel({ ar: "اللون", en: "Color" }, "micro-copy", "inline")} <span>${escapeHtml(product.colors[0])}</span></p>
              <div class="swatches__row">
                ${product.colors
                  .map(
                    (color, index) => `
                      <label class="swatches__swatch--color">
                        <input type="radio" name="product-color" value="${escapeHtml(color)}" ${index === 0 ? "checked" : ""} data-reservation-color />
                        <span style="background-color:${escapeHtml(colorToCss(color))};"></span>
                      </label>
                    `
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }
      ${
        product.sizes.length
          ? `
            <div class="swatches__container">
              <div class="size-chart">
                <button class="button-as-link js-size-chart-open" type="button">${renderLabel(
                  { ar: "دليل المقاسات", en: "Measurement Guide" },
                  "micro-copy",
                  "inline"
                )}</button>
              </div>
              <p class="swatches__option-name">${renderLabel({ ar: "المقاس", en: "Size" }, "micro-copy", "inline")} <span>${escapeHtml(product.sizes[0])}</span></p>
              <div class="swatches__row swatches__row--sizes">
                ${product.sizes
                  .map(
                    (size, index) => `
                      <label class="swatches__swatch--regular">
                        <input type="radio" name="product-size" value="${escapeHtml(size)}" ${index === 0 ? "checked" : ""} data-reservation-size />
                        <span>${escapeHtml(size)}</span>
                      </label>
                    `
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }
    </div>
  `;
}

function renderSizeGuide() {
  return `
    <div class="size-guide" hidden data-size-guide>
      <div class="size-guide__overlay js-size-chart-close"></div>
      <div class="size-guide__panel">
        <button class="icon-button size-guide__close js-size-chart-close" type="button" aria-label="Close size guide">${icon("close")}</button>
        <h3>${renderLabel({ ar: "دليل القياسات", en: "Measurement Guide" }, "display-copy")}</h3>
        <table>
          <thead>
            <tr>
              <th>Size</th>
              <th>Bust</th>
              <th>Waist</th>
              <th>Hip</th>
              <th>Hollow to Floor</th>
            </tr>
          </thead>
          <tbody>
            ${SIZE_GUIDE_ROWS.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderReservationForm(product, prefix, config) {
  return `
    <form class="reservation-form" data-reservation-form data-product-handle="${escapeHtml(product.handle)}">
      <div class="reservation-form__intro">
        <span class="section-heading__eyebrow">${renderLabel({ ar: "طلب خاص", en: "Private Request" }, "micro-copy", "inline")}</span>
        <h3>${renderLabel(config.reservationHeading, "display-copy")}</h3>
      </div>
      <div class="reservation-form__grid">
        <label>
          <span>${renderLabel({ ar: "الاسم الكامل", en: "Full Name" }, "micro-copy")}</span>
          <input type="text" name="name" required />
        </label>
        <label>
          <span>${renderLabel({ ar: "رقم الهاتف", en: "Phone Number" }, "micro-copy")}</span>
          <input type="tel" name="phone" required />
        </label>
        <label>
          <span>${renderLabel({ ar: "المدينة", en: "City" }, "micro-copy")}</span>
          <input type="text" name="city" required />
        </label>
        <label>
          <span>${renderLabel({ ar: "المقاس", en: "Size" }, "micro-copy")}</span>
          <select name="size" required>
            ${reservationSizeOptions(product)}
          </select>
        </label>
        <label class="reservation-form__full">
          <span>${renderLabel({ ar: "ملاحظات", en: "Notes" }, "micro-copy")}</span>
          <textarea name="notes" rows="4"></textarea>
        </label>
      </div>
      <div class="reservation-form__actions">
        <p>${renderLabel(config.reservationNote, "ui-copy")}</p>
        <button class="button button--dark" type="submit">${renderLabel(config.submitLabel, "button-copy")}</button>
      </div>
    </form>
  `;
}

function renderProductTabs(config, product) {
  return `
    <div class="product__tabs-container" data-tabs>
      <ul class="product__tabs">
        <li class="product__tab-trigger is-active"><button type="button" data-tab-trigger="details">${renderLabel({ ar: "تفاصيل", en: "Details" }, "micro-copy", "inline")}</button></li>
        <li class="product__tab-trigger"><button type="button" data-tab-trigger="shipping">${renderLabel({ ar: "التجهيز والشحن", en: "Fulfilment" }, "micro-copy", "inline")}</button></li>
        <li class="product__tab-trigger"><button type="button" data-tab-trigger="reservation">${renderLabel({ ar: "سياسة الحجز", en: "Reservation Policy" }, "micro-copy", "inline")}</button></li>
      </ul>
      <div class="tabbed__product-content is-active" data-tab-panel="details">${product.bodyHtml}</div>
      <div class="tabbed__product-content" data-tab-panel="shipping">${config.shippingTabHtml}</div>
      <div class="tabbed__product-content" data-tab-panel="reservation">${config.reservationTabHtml}</div>
    </div>
  `;
}

function renderRelatedProducts(related, prefix) {
  if (!related.length) {
    return "";
  }

  return `
    <section class="global__section related-products">
      <div class="section-heading-row">
        <div>
          <span class="section-heading__eyebrow">${renderLabel({ ar: "اقتراحات الدار", en: "Atelier Suggestions" }, "micro-copy", "inline")}</span>
          <h2 class="section-heading">${renderLabel({ ar: "قد يعجبك أيضاً", en: "You May Also Like" }, "display-copy")}</h2>
        </div>
      </div>
      <div class="featured__collection-carousel" data-carousel>
        ${related.map((product) => renderProductCard(product, prefix)).join("")}
      </div>
    </section>
  `;
}

function renderProductPage(product, related, prefix, config) {
  const collectionLabel = product.collectionTitles[0] ? UI_TRANSLATIONS[product.collectionTitles[0]] || { en: product.collectionTitles[0] } : null;
  return `
    ${renderBreadcrumb(prefix, [
      {
        label: product.collectionTitles[0] || "Collection",
        href: product.collections[0] ? toInternalHref(prefix, routeForCollection(product.collections[0])) : undefined
      },
      { label: product.title }
    ])}
    <section class="product__section">
      ${renderProductGallery(product)}
      <div class="product__section-information">
        ${collectionLabel ? `<span class="section-heading__eyebrow">${renderLabel(collectionLabel, "micro-copy", "inline")}</span>` : ""}
        <h1>${escapeHtml(product.title)}</h1>
        <div class="availability-copy availability-copy--product ${product.isExclusive ? "availability-copy--exclusive" : ""}">
          ${renderLabel(product.availabilityLabel, "micro-copy", "inline")}
        </div>
        <p class="product__lede">${escapeHtml(product.bodyText)}</p>
        <div class="product__section--custom_liquid">
          <div class="custom-productiontime">
            <div class="time-desc">
              <div class="top-desc">${renderLabel({ ar: "مدة التنفيذ", en: "Lead Time" }, "micro-copy", "inline")}</div>
              <hr />
              <div class="bot-desc">15-20 يوماً</div>
            </div>
            <div class="time-desc">
              <div class="top-desc">${renderLabel({ ar: "التجهيز والشحن", en: "Dispatch Window" }, "micro-copy", "inline")}</div>
              <hr />
              <div class="bot-desc">(3-5 أيام عمل)</div>
            </div>
            <div class="time-desc">
              <div class="top-desc">${renderLabel({ ar: "صُنع خصيصاً لك", en: "Made for you" }, "micro-copy", "inline")}</div>
              <hr />
              <div class="bot-desc">تجربة حجز خاصة</div>
            </div>
          </div>
        </div>
        ${renderProductOptions(product)}
        <div class="product-cta-row">
          <a class="button button--dark" href="${escapeHtml(toInternalHref(prefix, routeForReservation(product.handle)))}">${renderLabel(
            product.reservationLabel,
            "button-copy"
          )}</a>
          <a class="button button--ghost" href="${escapeHtml(buildWhatsAppUrl(config, product))}" target="_blank" rel="noreferrer">${renderLabel(
            { ar: "متابعة عبر واتساب", en: "Continue on WhatsApp" },
            "button-copy"
          )}</a>
        </div>
        ${renderReservationForm(product, prefix, config)}
        ${renderProductTabs(config, product)}
        <div class="share-icons">
          <span>${renderLabel({ ar: "مشاركة", en: "Share" }, "micro-copy", "inline")}</span>
          <a href="https://www.facebook.com/sharer.php?u=${encodeURIComponent(product.handle)}" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(product.title)}" target="_blank" rel="noreferrer">X</a>
        </div>
      </div>
    </section>
    ${renderRelatedProducts(related, prefix)}
    ${renderSizeGuide()}
    <script id="page-data" type="application/json">${serializeJson({
      type: "product",
      product: {
        handle: product.handle,
        title: product.title,
        bodyText: product.bodyText,
        colors: product.colors,
        sizes: product.sizes,
        isExclusive: product.isExclusive,
        availabilityLabel: product.availabilityLabel,
        reservationLabel: product.reservationLabel,
        primaryMedia: product.primaryMedia
      }
    })}</script>
  `;
}

function renderReservationPage(prefix, config) {
  return `
    ${renderBreadcrumb(prefix, [{ label: config.reservationHeading }])}
    <section class="reservation-page">
      <div class="reservation-page__intro">
        <span class="section-heading__eyebrow">${renderLabel({ ar: "موعد خاص", en: "Private Appointment" }, "micro-copy", "inline")}</span>
        <h1>${renderLabel(config.reservationHeading, "display-copy")}</h1>
        <p>${renderLabel(config.reservationNote, "ui-copy")}</p>
      </div>
      <div class="reservation-page__card" data-reservation-summary>
        <h2>${renderLabel({ ar: "القطعة المختارة", en: "Selected Piece" }, "display-copy")}</h2>
        <div class="reservation-summary__content" data-reservation-selected>
          <p>اختاري القطعة أولاً للمتابعة إلى تجربة الحجز الخاصة.</p>
        </div>
      </div>
      <form class="reservation-form reservation-form--standalone" data-reservation-form data-product-handle="">
        <div class="reservation-form__grid">
          <label>
            <span>${renderLabel({ ar: "الاسم الكامل", en: "Full Name" }, "micro-copy")}</span>
            <input type="text" name="name" required />
          </label>
          <label>
            <span>${renderLabel({ ar: "رقم الهاتف", en: "Phone Number" }, "micro-copy")}</span>
            <input type="tel" name="phone" required />
          </label>
          <label>
            <span>${renderLabel({ ar: "المدينة", en: "City" }, "micro-copy")}</span>
            <input type="text" name="city" required />
          </label>
          <label>
            <span>${renderLabel({ ar: "المقاس", en: "Size" }, "micro-copy")}</span>
            <select name="size" required data-reservation-size-select>
              <option value="">اختاري القطعة أولاً</option>
            </select>
          </label>
          <label class="reservation-form__full">
            <span>${renderLabel({ ar: "ملاحظات", en: "Notes" }, "micro-copy")}</span>
            <textarea name="notes" rows="4"></textarea>
          </label>
        </div>
        <div class="reservation-form__actions">
          <p>${renderLabel(config.reservationNote, "ui-copy")}</p>
          <button class="button button--dark" type="submit">${renderLabel(config.submitLabel, "button-copy")}</button>
        </div>
      </form>
    </section>
    <script id="page-data" type="application/json">${serializeJson({
      type: "reservation",
      catalogPath: `${prefix}assets/data/catalog.json`
    })}</script>
  `;
}

function renderDocument({ relativePath, title, description, mainClass = "", content, config, navigation }) {
  const prefix = relativePrefix(relativePath);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="icon" href="${escapeHtml(`${prefix}assets/favicon.svg`)}" type="image/svg+xml" />
    <link rel="preconnect" href="https://cdn.shopify.com" crossorigin />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${escapeHtml(`${prefix}assets/styles.css`)}" />
  </head>
  <body class="theme-minimal ${escapeHtml(mainClass)}" data-page-type="${escapeHtml(mainClass)}">
    <div class="page-wrap">
      ${renderHeader(prefix, config, navigation)}
      <main id="MainContent" class="content-wrapper">
        ${content}
      </main>
      ${renderFooter(prefix, config, navigation)}
    </div>
    <script>
      window.__ELEGANZA_CONFIG__ = ${serializeJson({
        brandArabic: config.brandArabic,
        brandName: config.brandName,
        whatsappNumber: config.whatsappNumber,
        catalogPath: `${prefix}assets/data/catalog.json`,
        siteRoot: prefix,
        availabilityLabel: config.availabilityLabel,
        exclusiveLabel: config.exclusiveLabel,
        primaryCTA: config.primaryCTA,
        secondaryCTA: config.secondaryCTA,
        viewLabel: config.viewLabel,
        quickViewLabel: config.quickViewLabel,
        submitLabel: config.submitLabel,
        reservationHeading: config.reservationHeading,
        reservationNote: config.reservationNote
      })};
    </script>
    <script src="${escapeHtml(`${prefix}assets/app.js`)}" defer></script>
  </body>
</html>
`;
}

function renderRedirectPage(target) {
  return `<!DOCTYPE html>
<html lang="ar">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Redirecting</title>
    <script>location.replace(${JSON.stringify(target)});</script>
  </head>
  <body></body>
</html>
`;
}

function buildHomeDocument(homepage, featuredSections, config, navigation) {
  const relativePath = path.join("ar", "index.html");
  const prefix = relativePrefix(relativePath);
  const content = `
    ${renderHero(homepage, prefix, config)}
    ${renderFeaturedSection(featuredSections[0], prefix)}
    ${renderSecondaryBanner(homepage, prefix)}
    ${renderFeaturedSection(featuredSections[1], prefix)}
    ${renderVideo(homepage)}
    ${renderReviews(homepage)}
  `;

  return renderDocument({
    relativePath,
    title: config.homepageTitle,
    description: config.homepageDescription,
    mainClass: "page-home",
    content,
    config,
    navigation
  });
}

function buildCollectionDocument(collection, config, navigation) {
  const relativePath = path.join("ar", "collections", collection.slug, "index.html");
  const content = renderCollectionPage(collection, relativePrefix(relativePath), config);

  return renderDocument({
    relativePath,
    title: `${collection.title} | ${config.brandName}`,
    description: collection.description || config.homepageDescription,
    mainClass: "page-collection",
    content,
    config,
    navigation
  });
}

function buildProductDocument(product, related, config, navigation) {
  const relativePath = path.join("ar", "products", product.handle, "index.html");
  const content = renderProductPage(product, related, relativePrefix(relativePath), config);

  return renderDocument({
    relativePath,
    title: `${product.title} | ${config.brandName}`,
    description: product.bodyText || config.homepageDescription,
    mainClass: "page-product",
    content,
    config,
    navigation
  });
}

function buildReservationDocument(config, navigation) {
  const relativePath = path.join("ar", "reservation", "index.html");
  const content = renderReservationPage(relativePrefix(relativePath), config);

  return renderDocument({
    relativePath,
    title: `${labelText(config.reservationHeading, "en") || labelText(config.reservationHeading, "ar")} | ${config.brandName}`,
    description: labelText(config.reservationNote, "ar"),
    mainClass: "page-reservation",
    content,
    config,
    navigation
  });
}

function relatedProducts(product, products) {
  const sameCollection = products.filter(
    (candidate) => candidate.handle !== product.handle && candidate.collections.some((slug) => product.collections.includes(slug))
  );
  return sameCollection.slice(0, 8);
}

function main() {
  const config = readJson(path.join(referenceDir, "site-config.json"));
  const navigation = readJson(path.join(referenceDir, "navigation.json"));
  const homepage = readJson(path.join(referenceDir, "homepage.json"));
  const collectionsRaw = readJson(path.join(referenceDir, "collections.json"));
  const catalogRaw = readJson(path.join(referenceDir, "catalog.json"));
  const overrides = readJson(overridesPath);

  const products = decorateProducts(catalogRaw, collectionsRaw, overrides, config);
  const productMap = new Map(products.map((product) => [product.handle, product]));
  const collections = buildCollectionIndex(
    collectionsRaw.map((collection) => ({
      ...collection,
      handles:
        collection.slug === "all"
          ? products.map((product) => product.handle)
          : collection.handles
    })),
    products
  );

  const featuredSections = homepage.featuredSections.map((section, index) => {
    const collection = collections.find((entry) => entry.slug === section.slug);
    return {
      ...section,
      kicker:
        index === 0
          ? { ar: "قطع خاصة 2026", en: "Exclusive Pieces 2026" }
          : { ar: "اختيار هادئ للسهرة", en: "Evening Edit" },
      summary: collection?.description || "",
      products: (collection?.products || []).slice(0, index === 0 ? 4 : 6)
    };
  });

  emptyDir("ar");
  emptyDir(path.join("assets", "data"));
  ensureDir(path.join("assets", "data"));

  writeFile("index.html", renderRedirectPage("./ar/"));
  writeFile("404.html", renderRedirectPage("./ar/"));
  writeFile("shop.html", renderRedirectPage("./ar/"));
  writeFile("product.html", renderRedirectPage("./ar/"));
  writeFile("about.html", renderRedirectPage("./ar/"));
  writeFile("booking.html", renderRedirectPage("./ar/"));
  writeFile("checkout.html", renderRedirectPage("./ar/"));
  writeFile("contact.html", renderRedirectPage("./ar/"));
  writeFile("exclusive-2026.html", renderRedirectPage("./ar/"));
  writeFile(
    "_headers",
    `/*
  X-Content-Type-Options: nosniff

/assets/*
  Cache-Control: public, max-age=604800, immutable
`
  );
  writeFile("robots.txt", "User-agent: *\nAllow: /\n");

  writeFile(path.join("assets", "data", "catalog.json"), `${JSON.stringify(products, null, 2)}\n`);
  writeFile(
    path.join("assets", "data", "collections.json"),
    `${JSON.stringify(
      collections.map((collection) => ({
        slug: collection.slug,
        title: collection.title,
        description: collection.description,
        pageSize: collection.pageSize
      })),
      null,
      2
    )}\n`
  );

  writeFile(path.join("ar", "index.html"), buildHomeDocument(homepage, featuredSections, config, navigation));
  writeFile(path.join("ar", "reservation", "index.html"), buildReservationDocument(config, navigation));

  collections.forEach((collection) => {
    writeFile(path.join("ar", "collections", collection.slug, "index.html"), buildCollectionDocument(collection, config, navigation));
  });

  products.forEach((product) => {
    writeFile(
      path.join("ar", "products", product.handle, "index.html"),
      buildProductDocument(product, relatedProducts(product, products), config, navigation)
    );
  });

  process.stdout.write(
    `Built ${products.length} product pages and ${collections.length} collection pages into site/.\n`
  );
}

main();
