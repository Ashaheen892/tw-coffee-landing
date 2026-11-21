var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { nothing, html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
function bus() {
  const host = window;
  return host.__cfBrew || (host.__cfBrew = { origin: "", price: 0, roast: "", listeners: /* @__PURE__ */ new Set() }), host.__cfBrew;
}
__name(bus, "bus");
function brewState() {
  const current = bus();
  return { origin: current.origin, price: current.price, roast: current.roast };
}
__name(brewState, "brewState");
function watchBrew(fn) {
  const current = bus();
  return current.listeners.add(fn), () => current.listeners.delete(fn);
}
__name(watchBrew, "watchBrew");
function roundToFive(value) {
  return Math.round(value / 5) * 5;
}
__name(roundToFive, "roundToFive");
function getConfig(raw) {
  return raw ? raw.component && typeof raw.component == "object" ? raw.component : raw : {};
}
__name(getConfig, "getConfig");
function getLocale() {
  var _a, _b, _c;
  const lang = ((_c = (_b = (_a = window.Salla) == null ? void 0 : _a.lang) == null ? void 0 : _b.getLocale) == null ? void 0 : _c.call(_b)) || document.documentElement.lang || "ar";
  return String(lang).toLowerCase().startsWith("en") ? "en" : "ar";
}
__name(getLocale, "getLocale");
function localizedString(value) {
  if (value == null || value === "") return "";
  if (typeof value == "string") return value;
  if (typeof value == "object") {
    const obj = value, text = obj[getLocale()] || obj.ar || obj.en;
    return typeof text == "string" ? text : "";
  }
  return String(value);
}
__name(localizedString, "localizedString");
function t(strings) {
  return getLocale() === "ar" ? strings.ar : strings.en;
}
__name(t, "t");
function unwrapValue(value) {
  var _a;
  return Array.isArray(value) ? unwrapValue(((_a = value[0]) == null ? void 0 : _a.value) ?? value[0] ?? "") : value && typeof value == "object" && "value" in value ? value.value : value ?? "";
}
__name(unwrapValue, "unwrapValue");
function linkHref(value) {
  if (value == null || value === "") return "";
  if (typeof value == "string") return value.trim();
  if (Array.isArray(value)) return linkHref(value[0]);
  if (typeof value == "object") {
    const obj = value;
    if (obj.url) return linkHref(obj.url);
    if ("value" in obj) return linkHref(obj.value);
    if (obj.href) return linkHref(obj.href);
  }
  return "";
}
__name(linkHref, "linkHref");
function getCollectionItems(items, prefix) {
  return Array.isArray(items) ? items.map((item) => {
    if (!item || typeof item != "object") return {};
    const normalized = {};
    for (const [key, val] of Object.entries(item))
      normalized[key.startsWith(`${prefix}.`) ? key.slice(prefix.length + 1) : key] = val;
    return normalized;
  }) : [];
}
__name(getCollectionItems, "getCollectionItems");
function watchLocale(host) {
  const update = /* @__PURE__ */ __name(() => host.requestUpdate(), "update");
  return window.addEventListener("language-changed", update), () => window.removeEventListener("language-changed", update);
}
__name(watchLocale, "watchLocale");
function digits(value) {
  const text = String(value);
  return getLocale() !== "ar" ? text : text.replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}
__name(digits, "digits");
function amount(value) {
  const text = localizedString(value).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[^\d.]/g, ""), number = Number(text);
  return Number.isFinite(number) ? number : 0;
}
__name(amount, "amount");
function salla() {
  return window.Salla;
}
__name(salla, "salla");
function landingSettings() {
  var _a, _b;
  return ((_b = (_a = salla()) == null ? void 0 : _a.config) == null ? void 0 : _b.get("theme.settings")) || {};
}
__name(landingSettings, "landingSettings");
function isLandingPage() {
  var _a, _b;
  return ((_b = (_a = salla()) == null ? void 0 : _a.config) == null ? void 0 : _b.get("page.is_landing_page")) === !0;
}
__name(isLandingPage, "isLandingPage");
function pageMode() {
  var _a;
  const value = landingSettings().page_for_product;
  return typeof value == "boolean" || value == null ? value === !1 ? "promotion" : "product" : typeof value == "string" ? value === "promotion" ? "promotion" : "product" : Array.isArray(value) && ((_a = value[0]) == null ? void 0 : _a.value) === "promotion" ? "promotion" : "product";
}
__name(pageMode, "pageMode");
function landingProductId() {
  var _a, _b;
  if (!isLandingPage() || pageMode() !== "product") return null;
  const id = (_b = (_a = landingSettings().product) == null ? void 0 : _a.value) == null ? void 0 : _b[0];
  return id ? String(id) : null;
}
__name(landingProductId, "landingProductId");
function mainButton() {
  const settings = landingSettings();
  return { text: String(settings.main_btn_text || ""), url: String(settings.main_btn_url || "") };
}
__name(mainButton, "mainButton");
function openCheckout() {
  const checkout = document.querySelector(".s-block--fast-checkout"), layout = checkout == null ? void 0 : checkout.getAttribute("data-layout");
  if (window.innerWidth < 1024 || layout === "side-drawer" || !checkout) {
    window.dispatchEvent(new CustomEvent("open-checkout-drawer"));
    return;
  }
  checkout.scrollIntoView({ behavior: "smooth", block: "center" });
}
__name(openCheckout, "openCheckout");
function renderCta(labelValue, fallbackUrl = "", tone = "solid") {
  const label = localizedString(labelValue).trim();
  if (!label) return nothing;
  const cls = tone === "ghost" ? "cf-btn ghost" : "cf-btn", productPage = !!landingProductId(), demo = !isLandingPage();
  if (productPage || demo && !fallbackUrl)
    return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  const href = (isLandingPage() && pageMode() === "promotion" ? mainButton().url : "") || fallbackUrl;
  return href ? html`<a class=${cls} href=${href}>${label}</a>` : html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
}
__name(renderCta, "renderCta");
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  return scheme === "dark" ? "cf-dark" : scheme === "light" ? "cf-light" : "cf-auto";
}
__name(schemeOf, "schemeOf");
function injectStyles(id, css2) {
  let style = document.getElementById(id);
  style || (style = document.createElement("style"), style.id = id, document.head.appendChild(style)), style.textContent !== css2 && (style.textContent = css2);
}
__name(injectStyles, "injectStyles");
const KIT_FONT = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Noto+Kufi+Arabic:wght@400;600;800;900&display=swap";
function setKitFont(on) {
  if (document.documentElement.classList.toggle("cf-kit-font", on), document.getElementById("cf-fonts")) return;
  const link = document.createElement("link");
  link.id = "cf-fonts", link.rel = "stylesheet", link.href = KIT_FONT, document.head.appendChild(link);
}
__name(setKitFont, "setKitFont");
function injectFonts() {
  document.documentElement.classList.contains("cf-kit-font") && setKitFont(!0);
}
__name(injectFonts, "injectFonts");
function sectionStyle(cfg) {
  return cfg.bg_color ? `--cf-section-bg:${cfg.bg_color}` : "";
}
__name(sectionStyle, "sectionStyle");
const DARK = "--bg:#0d0b09; --bg-2:#15110d; --ink:#f2ece2; --mute:#9a8f82; --line:#3a322a; --line-2:#564a3e; --rust:#c2410c; --amber:#e08b3f; --crema:#d9b98c; --card:#120f0c; --on-rust:#fff;", LIGHT = "--bg:#f6f1ea; --bg-2:#efe6da; --ink:#1c140e; --mute:#6d6258; --line:#e0d4c6; --line-2:#c9b8a4; --rust:#c2410c; --amber:#a85f1f; --crema:#8a5a28; --card:#fffdf9; --on-rust:#fff;", baseCss = `
.cf-host { display: block; width: 100%; min-width: 0; container-type: inline-size; }
body:has(.cf-host) { background: #0d0b09; }
html.cf-mode-light body:has(.cf-host) { background: #f6f1ea; }
html.cf-mode-light { ${LIGHT} }
html.cf-mode-dark { ${DARK} }
html.cf-mode-dark body:has(.cf-host) { background: #0d0b09; }
.component-card:has(> .cf-host:not(:empty)) { min-height: 0; }
.cf-root {
  ${DARK}
  --max:1080px; --pad:clamp(20px, 5vw, 72px);
  --disp:inherit; --body:inherit;
  display: block; box-sizing: border-box; color: var(--ink); background: var(--cf-section-bg, var(--bg));
  font-family: inherit; font-weight: 300; line-height: 1.8; -webkit-font-smoothing: antialiased;
  border-block-end: 2px solid var(--line);
}
html.cf-kit-font .cf-root { --disp:'Noto Kufi Arabic',system-ui,sans-serif; --body:'IBM Plex Sans Arabic',system-ui,sans-serif; font-family: var(--body); }
.cf-root.cf-light, html.cf-mode-light .cf-root.cf-auto { ${LIGHT} }
.cf-root.cf-dark, html.cf-mode-dark .cf-root.cf-auto { ${DARK} }
@media (prefers-color-scheme: dark) {
  html:not(.cf-mode-light) body:has(.cf-host) { background: #0d0b09; }
  html:not(.cf-mode-light) .cf-root.cf-auto { ${DARK} }
}
.cf-root *, .cf-root *::before, .cf-root *::after { box-sizing: border-box; }
.cf-root img { max-width: 100%; display: block; }
.cf-root a { color: inherit; text-decoration: none; }
.cf-root h1, .cf-root h2, .cf-root h3, .cf-root p, .cf-root ul, .cf-root dl { margin: 0; }
.cf-root ul { list-style: none; padding: 0; }
.cf-root button, .cf-root a, .cf-root input { font: inherit; }
.cf-root :focus-visible { outline: 2px solid var(--amber); outline-offset: 3px; }
.cf-wrap { width: min(var(--max), calc(100% - (var(--pad) * 2))); margin-inline: auto; }
.cf-sec { position: relative; padding-block: clamp(56px, 9vh, 96px); }
.cf-idx { font-family: var(--disp); font-weight: 900; font-size: clamp(3rem, 8vw, 5.6rem); line-height: .8; color: transparent; -webkit-text-stroke: 1.6px var(--line-2); margin-bottom: 14px; font-variant-numeric: tabular-nums; }
.cf-kick { display: block; margin-bottom: 12px; font-size: .76rem; letter-spacing: .2em; color: var(--amber); font-weight: 600; }
.cf-h2, .cf-root h1, .cf-root h2, .cf-root h3 { font-family: var(--disp); font-weight: 800; line-height: 1.15; letter-spacing: -.02em; }
.cf-h2 { font-size: clamp(1.7rem, 4.4vw, 2.9rem); }
.cf-lead { color: var(--mute); max-width: 52ch; margin-top: 16px; font-size: clamp(.95rem, 1.6vw, 1.08rem); }
.cf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px; padding: 14px 26px; background: var(--rust); color: var(--on-rust); font-family: var(--disp); font-weight: 800; font-size: 1rem; border: 2px solid var(--rust); cursor: pointer; transition: background .2s, color .2s, transform .2s; }
.cf-btn:hover { background: var(--amber); border-color: var(--amber); color: #1c140e; transform: translateY(-2px); }
.cf-btn.ghost { background: transparent; color: var(--ink); border-color: var(--line-2); }
.cf-btn.ghost:hover { background: transparent; color: var(--ink); border-color: var(--amber); }
.cf-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.cf-empty { padding: 1.2rem; border: 2px dashed var(--line-2); color: var(--mute); text-align: center; }
.cf-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .cf-btn { transition: none; }
  .cf-btn:hover { transform: none; }
}
`;
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.cf-order { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 26px; }
.cf-fld { margin-bottom: 18px; }
.cf-fld > span { display: block; margin-bottom: 9px; font-size: .74rem; letter-spacing: .12em; color: var(--mute); font-weight: 600; }
.cf-pills { display: flex; flex-wrap: wrap; gap: 7px; }
.cf-pill { border: 2px solid var(--line-2); padding: 8px 14px; background: transparent; color: inherit; cursor: pointer; }
.cf-pill[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); font-weight: 600; }
.cf-sum { border: 2px solid var(--line); padding: 22px; }
.cf-sum .big { display: block; font-family: var(--disp); font-weight: 900; font-size: clamp(2rem, 6vw, 3.2rem); color: var(--amber); line-height: 1; }
.cf-sum .bl { display: block; margin-bottom: 8px; font-size: .78rem; letter-spacing: .14em; color: var(--mute); }
.cf-sum .r, .cf-facts .r { display: flex; align-items: baseline; gap: 10px; padding-block: 12px; border-block-start: 2px solid var(--line); font-size: .88rem; }
.cf-sum .r i, .cf-facts .r i { flex: 1; border-block-end: 1px dotted var(--line-2); transform: translateY(-5px); }
.cf-sum .r b, .cf-facts .r b { font-family: var(--disp); font-weight: 800; }
.cf-stack { display: grid; gap: 10px; margin-top: 16px; }
.cf-stack .cf-btn { width: 100%; }
.cf-pay { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 16px; }
.cf-pay span { border: 2px solid var(--line); padding: 6px 11px; font-size: .74rem; color: var(--crema); }
.cf-dock { position: fixed; z-index: 45; inset-inline: 0; bottom: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 58px; padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px)); border-block-start: 2px solid var(--line); background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(8px); }
.cf-dock b { font-family: var(--disp); }
.cf-dock .cf-btn { min-height: 42px; padding-inline: 18px; }
body:has(.cf-dock) { padding-bottom: 70px; }
@container (max-width: 800px) { .cf-order { grid-template-columns: 1fr; } }
`, _BagOrder = class _BagOrder extends LitElement {
  constructor() {
    super(...arguments), this.weight = 250, this.grind = "whole", this.brew = brewState(), this.away = !1, this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("cf-host"), injectFonts(), injectStyles("cf-base", baseCss), injectStyles("cf-bag-order", css);
    const stopLocale = watchLocale(this), stopBrew = watchBrew(() => {
      this.brew = brewState();
    });
    this.stop = () => {
      stopLocale(), stopBrew();
    };
  }
  disconnectedCallback() {
    var _a;
    this.stop(), (_a = this.seen) == null || _a.disconnect(), super.disconnectedCallback();
  }
  updated() {
    const section = this.querySelector("#cf-order");
    !section || this.seen || (this.seen = new IntersectionObserver(([entry]) => {
      this.away = !entry.isIntersecting;
    }, { threshold: 0.35 }), this.seen.observe(section));
  }
  render() {
    const cfg = getConfig(this.config), base = this.brew.price || amount(cfg.fallback_price) || 85, factors = {
      250: 1,
      500: Number(unwrapValue(cfg.factor_500) || 1.85),
      1e3: Number(unwrapValue(cfg.factor_1000) || 3.4)
    }, total = roundToFive(base * (factors[this.weight] || 1)), old = roundToFive(total * 1.25), origin = this.brew.origin || localizedString(cfg.fallback_origin), roast = this.brew.roast || localizedString(cfg.fallback_roast), currency = localizedString(cfg.currency) || t({ ar: "ر.س", en: "SAR" }), facts = getCollectionItems(cfg.facts, "facts").map((item) => ({ label: localizedString(item.label), value: localizedString(item.value) })).filter((item) => item.label), pays = getCollectionItems(cfg.payments, "payments").map((item) => localizedString(item.label)).filter(Boolean), weights = [
      [250, localizedString(cfg.w_250) || "٢٥٠ غ"],
      [500, localizedString(cfg.w_500) || "٥٠٠ غ"],
      [1e3, localizedString(cfg.w_1000) || "كيلو"]
    ], grinds = [
      ["whole", localizedString(cfg.g_whole) || t({ ar: "حبّ كامل", en: "Whole bean" })],
      ["ground", localizedString(cfg.g_ground) || t({ ar: "حسب طريقتي", en: "Ground for my brew" })]
    ], priceText = `${digits(total)} ${currency}`;
    return html`<section id="cf-order" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "order"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        <div class="cf-order">
          <div>
            <div class="cf-fld">
              <span>${localizedString(cfg.weight_label) || t({ ar: "حجم الكيس", en: "Bag size" })}</span>
              <div class="cf-pills" role="group">
                ${weights.map(([value, label]) => html`<button type="button" class="cf-pill" aria-pressed=${this.weight === value ? "true" : "false"} @click=${() => {
      this.weight = value;
    }}>${label}</button>`)}
              </div>
            </div>
            <div class="cf-fld">
              <span>${localizedString(cfg.grind_label) || t({ ar: "الطحن", en: "Grind" })}</span>
              <div class="cf-pills" role="group">
                ${grinds.map(([value, label]) => html`<button type="button" class="cf-pill" aria-pressed=${this.grind === value ? "true" : "false"} @click=${() => {
      this.grind = value;
    }}>${label}</button>`)}
              </div>
            </div>
            <div class="cf-sum" aria-live="polite">
              <span class="bl">${localizedString(cfg.total_label) || t({ ar: "الإجمالي", en: "Total" })}</span>
              <span class="big">${priceText}</span>
              <div class="r"><span>${t({ ar: "المنشأ", en: "Origin" })}</span><i aria-hidden="true"></i><b>${origin}</b></div>
              <div class="r"><span>${t({ ar: "الدرجة", en: "Roast" })}</span><i aria-hidden="true"></i><b>${roast}</b></div>
              <div class="r"><span>${localizedString(cfg.before_label) || t({ ar: "قبل الخصم", en: "Before discount" })}</span><i aria-hidden="true"></i><b>${digits(old)} ${currency}</b></div>
            </div>
            <div class="cf-stack">
              ${renderCta(cfg.button_label, linkHref(cfg.button_url))}
              ${localizedString(cfg.secondary_label) ? html`<a class="cf-btn ghost" href="#cf-plans">${localizedString(cfg.secondary_label)}</a>` : nothing}
            </div>
          </div>
          <div>
            <div class="cf-facts">
              ${facts.map((item) => html`<div class="r"><span>${item.label}</span><i aria-hidden="true"></i><b>${item.value}</b></div>`)}
            </div>
            ${pays.length ? html`<div class="cf-pay" aria-label=${t({ ar: "طرق الدفع", en: "Payment methods" })}>${pays.map((item) => html`<span>${item}</span>`)}</div>` : nothing}
          </div>
        </div>
      </div>
      ${this.away ? html`<div class="cf-dock">
        <span>${localizedString(cfg.dock_label) || t({ ar: "اطلب", en: "Order" })} — <b>${priceText}</b></span>
        <a class="cf-btn" href="#cf-order">${localizedString(cfg.button_label) || t({ ar: "أضف إلى السلة", en: "Add to cart" })}</a>
      </div>` : nothing}
    </section>`;
  }
};
__name(_BagOrder, "BagOrder");
let BagOrder = _BagOrder;
__decorateClass([
  property({ type: Object })
], BagOrder.prototype, "config");
__decorateClass([
  state()
], BagOrder.prototype, "weight");
__decorateClass([
  state()
], BagOrder.prototype, "grind");
__decorateClass([
  state()
], BagOrder.prototype, "brew");
__decorateClass([
  state()
], BagOrder.prototype, "away");
typeof BagOrder < "u" && BagOrder.registerSallaComponent("salla-bag-order");
export {
  BagOrder as default
};
