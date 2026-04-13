import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const referenceDir = path.join(projectRoot, "data", "reference");
const overridesPath = path.join(projectRoot, "data", "overrides.json");
const BASE_URL = "https://www.sharonsaid.net";
const AR_BASE = `${BASE_URL}/ar`;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function fetchText(url) {
  return execFileSync("curl", ["-A", "Mozilla/5.0", "-sL", url], {
    encoding: "utf8",
    maxBuffer: 80 * 1024 * 1024
  });
}

function fetchJson(url) {
  return JSON.parse(fetchText(url));
}

function cleanText(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function toAbsoluteUrl(url = "") {
  if (!url) {
    return "";
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BASE_URL}${url}`;
  }

  return new URL(url, BASE_URL).toString();
}

function collectionSlugFromHref(href = "") {
  const match = href.match(/\/ar\/collections\/([^/?#]+)/);
  return match ? match[1] : "";
}

function handleFromHref(href = "") {
  const match = href.match(/\/products\/([^/?#]+)/);
  return match ? match[1] : "";
}

function uniqueBy(items, selector) {
  const seen = new Set();
  return items.filter((item) => {
    const key = selector(item);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function splitValue(value = "") {
  return value
    .split(/[,/]/)
    .map((entry) => cleanText(entry))
    .filter(Boolean)
    .filter((entry) => entry !== "/" && entry !== "-");
}

function slugToLabel(slug = "") {
  return slug
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseBodyAttributes(bodyHtml = "") {
  const $ = cheerio.load(bodyHtml);
  const listItems = $("li")
    .toArray()
    .map((item) => cleanText($(item).text()))
    .filter(Boolean);

  const fields = {};

  listItems.forEach((item) => {
    const separatorIndex = item.indexOf(":");
    if (separatorIndex === -1) {
      return;
    }

    const key = cleanText(item.slice(0, separatorIndex)).toLowerCase();
    const value = cleanText(item.slice(separatorIndex + 1));

    if (key && value) {
      fields[key] = value;
    }
  });

  const description = cleanText($.text());

  return {
    description,
    attributes: {
      silhouette: splitValue(fields["silhouette style"]),
      neckline: splitValue(fields["neckline"]),
      hemlineTrain: splitValue(fields["length"]),
      sleeves: splitValue(fields["sleeve length"]),
      fabric: splitValue(fields["fabrics"]),
      hotFeatures: splitValue(fields["embellishment"]),
      backDetails: splitValue(fields["back details"]),
      waistStyle: splitValue(fields["waist style"])
    }
  };
}

function normalizeProduct(product) {
  const optionNames = product.options.map((option) => option.name.toLowerCase());
  const colorIndex = optionNames.findIndex((name) => name.includes("color"));
  const sizeIndex = optionNames.findIndex((name) => name.includes("size"));
  const parsed = parseBodyAttributes(product.body_html || "");

  const variants = product.variants.map((variant) => {
    const options = [variant.option1, variant.option2, variant.option3].filter(Boolean);
    return {
      id: variant.id,
      title: variant.title,
      sku: variant.sku || "",
      available: Boolean(variant.available),
      price: variant.price,
      color: colorIndex >= 0 ? options[colorIndex] || "" : variant.option1 || "",
      size: sizeIndex >= 0 ? options[sizeIndex] || "" : variant.option2 || "",
      options
    };
  });

  const colors = uniqueBy(
    variants
      .map((variant) => variant.color)
      .filter(Boolean)
      .map((value) => ({ value })),
    (entry) => entry.value
  ).map((entry) => entry.value);

  const sizes = uniqueBy(
    variants
      .map((variant) => variant.size)
      .filter(Boolean)
      .map((value) => ({ value })),
    (entry) => entry.value
  ).map((entry) => entry.value);

  const media = product.images.map((image, index) => ({
    id: image.id,
    type: "image",
    src: toAbsoluteUrl(image.src),
    alt: image.alt || product.title,
    width: image.width || null,
    height: image.height || null,
    position: image.position || index + 1
  }));

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    productType: product.product_type,
    bodyHtml: product.body_html || "",
    bodyText: parsed.description,
    tags: product.tags || [],
    media,
    options: product.options.map((option) => ({
      name: option.name,
      values: option.values
    })),
    variants,
    colors,
    sizes,
    badges: [],
    available: variants.some((variant) => variant.available),
    availabilityKey: variants.some((variant) => variant.available) ? "available" : "made-to-order",
    sku: variants.find((variant) => variant.sku)?.sku || "",
    priceRange: {
      min: product.variants.length ? Math.min(...product.variants.map((variant) => Number(variant.price))) : 0,
      max: product.variants.length ? Math.max(...product.variants.map((variant) => Number(variant.price))) : 0
    },
    filters: {
      availability: [variants.some((variant) => variant.available) ? "available" : "made-to-order"],
      silhouette: parsed.attributes.silhouette,
      neckline: parsed.attributes.neckline,
      hemlineTrain: parsed.attributes.hemlineTrain,
      sleeves: parsed.attributes.sleeves,
      fabric: parsed.attributes.fabric,
      hotFeatures: parsed.attributes.hotFeatures,
      colors
    },
    collections: []
  };
}

function parseMobileNavigation(homeHtml) {
  const $ = cheerio.load(homeHtml);
  const $root = $("ul.mobile-menu__accordion").first();

  function emptySelection() {
    return cheerio.load("<div></div>")("div");
  }

  function panelForHeader($header) {
    const controlId = $header.children("button.dropdown-arrow").attr("aria-controls") || "";
    return controlId ? $header.nextAll(`li#${controlId}`).first() : emptySelection();
  }

  function parseLinks($panel) {
    return uniqueBy(
      $panel
        .find("ul > li > a.js-accordion-link")
        .toArray()
        .map((link) => {
          const $link = $(link);
          return {
            label: cleanText($link.text()),
            href: $link.attr("href") || "",
            slug: collectionSlugFromHref($link.attr("href") || "")
          };
        }),
      (entry) => `${entry.label}|${entry.href}`
    );
  }

  function parseGroups($list) {
    return $list
      .children("li.js-accordion-header")
      .toArray()
      .map((header) => {
        const $header = $(header);
        const $link = $header.children("a.js-accordion-link").first();
        const $panel = panelForHeader($header);

        return {
          label: cleanText($link.text()),
          href: $link.attr("href") || "",
          slug: collectionSlugFromHref($link.attr("href") || ""),
          items: parseLinks($panel)
        };
      })
      .filter((group) => group.label);
  }

  return $root
    .children("li.js-accordion-header")
    .toArray()
    .map((header) => {
      const $header = $(header);
      const $link = $header.children("a.js-accordion-link").first();
      const $panel = panelForHeader($header);
      const $nestedList = $panel.children("ul.js-accordion").first();

      return {
        label: cleanText($link.text()),
        href: $link.attr("href") || "",
        slug: collectionSlugFromHref($link.attr("href") || ""),
        groups: $nestedList.length ? parseGroups($nestedList) : []
      };
    })
    .filter((item) => item.label);
}

function parseHomepage(homeHtml, overrides) {
  const $ = cheerio.load(homeHtml);
  const slideshows = $("[data-section-type='slideshow-section']");
  const featuredCollections = $("[data-section-type='featured-collection']");
  const reviewText = cleanText($(".jdgm-rating-text").first().text());
  const ratingMatch = reviewText.match(/([\d.]+)\s*★\s*\(([\d,]+)\)/);

  const heroSlides = slideshows
    .first()
    .find(".slideshow__slide")
    .toArray()
    .map((slide) => {
      const $slide = $(slide);
      return {
        href: $slide.find("a.slide__image-link").attr("href") || "",
        desktopImage: toAbsoluteUrl($slide.find(".sm-hide img").attr("src") || ""),
        mobileImage: toAbsoluteUrl($slide.find(".md-hide img").attr("src") || "")
      };
    })
    .filter((slide) => slide.href && slide.desktopImage);

  const secondaryBanner = slideshows.eq(1).find(".slideshow__slide").first();

  return {
    heroSlides,
    featuredSections: [
      {
        kind: "grid",
        heading: cleanText(featuredCollections.eq(0).find(".section-heading a").text()) || "مجموعة مميزة",
        href: featuredCollections.eq(0).find(".section-heading a").attr("href") || "/ar/collections/sf-evening-dress",
        slug: collectionSlugFromHref(featuredCollections.eq(0).find(".section-heading a").attr("href") || "")
      },
      {
        kind: "carousel",
        heading: cleanText(featuredCollections.eq(1).find(".section-heading a").text()) || "مجموعة مميزة",
        href: featuredCollections.eq(1).find(".section-heading a").attr("href") || "/ar/collections/ready-to-ship",
        slug: collectionSlugFromHref(featuredCollections.eq(1).find(".section-heading a").attr("href") || "")
      }
    ],
    secondaryBanner: {
      href: secondaryBanner.find("a.slide__image-link").attr("href") || "",
      desktopImage: toAbsoluteUrl(secondaryBanner.find(".sm-hide img").attr("src") || ""),
      mobileImage: toAbsoluteUrl(secondaryBanner.find(".md-hide img").attr("src") || "")
    },
    video: {
      embedUrl: toAbsoluteUrl($(".videoWrapper iframe").first().attr("src") || "")
    },
    reviews: {
      heading: cleanText($(".jdgm-title").first().text()) || "CUSTOMERS ARE SAYING",
      rating: ratingMatch ? Number(ratingMatch[1]) : 4.97,
      count: ratingMatch ? Number(ratingMatch[2].replaceAll(",", "")) : 3659,
      cards: overrides.reviewCards || []
    }
  };
}

function collectCollectionSeeds(navigation, homepage) {
  const collectionMap = new Map();

  function pushCollection(label, href) {
    const slug = collectionSlugFromHref(href);
    if (!slug) {
      return;
    }

    if (!collectionMap.has(slug)) {
      collectionMap.set(slug, {
        slug,
        href,
        label: label || slugToLabel(slug)
      });
    }
  }

  navigation.forEach((item) => {
    pushCollection(item.label, item.href);
    item.groups.forEach((group) => {
      pushCollection(group.label, group.href);
      group.items.forEach((entry) => pushCollection(entry.label, entry.href));
    });
  });

  homepage.heroSlides.forEach((slide) => pushCollection("", slide.href));
  homepage.featuredSections.forEach((section) => pushCollection(section.heading, section.href));
  pushCollection("", homepage.secondaryBanner.href);
  pushCollection("All Dresses", "/ar/collections/all");

  return Array.from(collectionMap.values());
}

function parseCollectionPage(html) {
  const $ = cheerio.load(html);
  const handles = uniqueBy(
    $("#main-collection-product-grid a[href*='/products/']")
      .toArray()
      .map((link) => {
        const href = $(link).attr("href") || "";
        return {
          handle: handleFromHref(href),
          href
        };
      })
      .filter((entry) => entry.handle),
    (entry) => entry.handle
  ).map((entry) => entry.handle);

  const title = cleanText($("title").first().text()).split(" – ")[0];
  const description = $("meta[name='description']").attr("content") || "";
  const nextHref = $("link[rel='next']").attr("href") || "";

  return {
    title,
    description: cleanText(description),
    handles,
    nextHref: nextHref ? toAbsoluteUrl(nextHref) : "",
    pageSize: handles.length || 24
  };
}

function fetchCollections(collectionSeeds) {
  return collectionSeeds.map((seed) => {
    const html = fetchText(`${AR_BASE}/collections/${seed.slug}`);
    const parsed = parseCollectionPage(html);
    const handles = [];
    let page = 1;

    while (true) {
      const payload = fetchJson(`${AR_BASE}/collections/${seed.slug}/products.json?limit=250&page=${page}`);
      const items = payload.products || [];

      if (!items.length) {
        break;
      }

      handles.push(...items.map((product) => product.handle).filter(Boolean));

      if (items.length < 250) {
        break;
      }

      page += 1;

      if (page > 20) {
        break;
      }
    }

    return {
      slug: seed.slug,
      href: seed.href,
      label: seed.label,
      title: parsed.title || seed.label || slugToLabel(seed.slug),
      description: parsed.description,
      pageSize: parsed.pageSize,
      handles: Array.from(new Set(handles))
    };
  });
}

function applyCollectionMembership(products, collections) {
  const productMap = new Map(products.map((product) => [product.handle, product]));

  collections.forEach((collection) => {
    collection.handles.forEach((handle) => {
      const product = productMap.get(handle);
      if (product && !product.collections.includes(collection.slug)) {
        product.collections.push(collection.slug);
      }
    });
  });

  return products;
}

function buildSiteConfig(overrides) {
  return {
    brandName: overrides.brandName,
    brandArabic: overrides.brandArabic,
    brandTagline: overrides.brandTagline,
    brandAuthority: overrides.brandAuthority,
    facebookUrl: overrides.facebookUrl,
    whatsappNumber: overrides.whatsappNumber,
    logoPath: overrides.logoPath,
    logoAlt: overrides.logoAlt,
    homepageTitle: overrides.homepageTitle,
    homepageDescription: overrides.homepageDescription,
    announcementMessages: overrides.announcementMessages,
    newsletterHeading: overrides.newsletterHeading,
    newsletterText: overrides.newsletterText,
    reservationHeading: overrides.reservationHeading,
    availabilityLabel: overrides.availabilityLabel,
    exclusiveLabel: overrides.exclusiveLabel,
    primaryCTA: overrides.primaryCTA,
    secondaryCTA: overrides.secondaryCTA,
    submitLabel: overrides.submitLabel,
    reservationNote: overrides.reservationNote,
    shippingTabHtml: overrides.shippingTabHtml,
    reservationTabHtml: overrides.reservationTabHtml
  };
}

function extractAllProducts() {
  const allProducts = [];
  let page = 1;

  while (true) {
    const payload = fetchJson(`${BASE_URL}/products.json?limit=250&page=${page}`);
    const items = payload.products || [];

    if (!items.length) {
      break;
    }

    allProducts.push(...items);

    if (items.length < 250) {
      break;
    }

    page += 1;
  }

  return allProducts;
}

function main() {
  ensureDir(referenceDir);

  const overrides = readJson(overridesPath);
  const homeHtml = fetchText(AR_BASE);
  const navigation = parseMobileNavigation(homeHtml);
  const homepage = parseHomepage(homeHtml, overrides);
  const products = extractAllProducts().map(normalizeProduct);
  const collections = fetchCollections(collectCollectionSeeds(navigation, homepage));
  const normalizedProducts = applyCollectionMembership(products, collections);
  const siteConfig = buildSiteConfig(overrides);

  writeJson(path.join(referenceDir, "site-config.json"), siteConfig);
  writeJson(path.join(referenceDir, "navigation.json"), navigation);
  writeJson(path.join(referenceDir, "homepage.json"), homepage);
  writeJson(path.join(referenceDir, "collections.json"), collections);
  writeJson(path.join(referenceDir, "catalog.json"), normalizedProducts);

  process.stdout.write(
    `Extracted ${normalizedProducts.length} products and ${collections.length} collections into data/reference.\n`
  );
}

main();
