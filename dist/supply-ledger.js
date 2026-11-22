var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { LitElement, nothing, html } from "lit";
import { property } from "lit/decorators.js";
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
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  return scheme === "dark" ? "cf-dark" : scheme === "light" ? "cf-light" : "cf-auto";
}
__name(schemeOf, "schemeOf");
function markEditing() {
  var _a, _b;
  const root = document.documentElement, read = /* @__PURE__ */ __name(() => {
    var _a2, _b2;
    let on = !0;
    try {
      const salla = window.Salla;
      on = window.self !== window.top || ((_b2 = (_a2 = salla == null ? void 0 : salla.config) == null ? void 0 : _a2.get) == null ? void 0 : _b2.call(_a2, "page.is_landing_page")) !== !0;
    } catch {
      on = !0;
    }
    root.dataset.lpEditing = on ? "1" : "0";
  }, "read");
  if (!root.dataset.lpEditing) {
    read();
    try {
      (_b = (_a = window.Salla) == null ? void 0 : _a.onReady) == null || _b.call(_a, read);
    } catch {
    }
  }
}
__name(markEditing, "markEditing");
function injectStyles(id, css2) {
  markEditing();
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
html[data-lp-editing="0"] .cf-empty, html[data-lp-editing="0"] .cf-hint { display: none !important; }
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
  font-family: var(--font-main, inherit); font-weight: 300; line-height: 1.8; -webkit-font-smoothing: antialiased;
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
.cf-root .cf-lead { color: var(--mute); max-width: 52ch; margin-top: 16px; font-size: clamp(.95rem, 1.6vw, 1.08rem); }
.cf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px; padding: 14px 26px; background: var(--color-primary, var(--rust)); color: var(--color-primary-reverse, var(--on-rust)); font-family: var(--font-main, inherit); font-weight: 700; font-size: 1rem; border: 2px solid var(--color-primary, var(--rust)); cursor: pointer; transition: opacity .2s, transform .2s; }
.cf-btn:hover { opacity: .92; transform: translateY(-2px); }
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
.cf-receipt { position: relative; max-width: 560px; margin: 26px auto 0; padding: 26px 26px 30px; background: var(--card); border: 2px solid var(--line); }
.cf-receipt::before, .cf-receipt::after { content: ""; position: absolute; inset-inline: -2px; height: 10px; background: radial-gradient(circle at 6px 0, transparent 5px, var(--card) 5.5px) 0 0 / 12px 10px repeat-x; }
.cf-receipt::before { top: -10px; transform: scaleY(-1); }
.cf-receipt::after { bottom: -10px; }
.cf-receipt header { display: flex; justify-content: space-between; gap: 10px; padding-bottom: 14px; margin-bottom: 6px; border-block-end: 2px dashed var(--line-2); font-size: .74rem; letter-spacing: .16em; color: var(--mute); }
.cf-partner { display: flex; align-items: baseline; gap: 10px; padding-block: 13px; border-block-end: 1px dotted var(--line-2); }
.cf-partner i { font-style: normal; font-weight: 800; color: var(--amber); font-variant-numeric: tabular-nums; min-width: 2ch; }
.cf-partner b { font-family: var(--disp); font-weight: 800; }
.cf-partner em { flex: 1; min-width: 1rem; border-block-end: 1px dotted var(--line-2); transform: translateY(-4px); }
.cf-partner span { color: var(--mute); font-size: .88rem; text-align: end; }
.cf-receipt footer { padding-top: 14px; text-align: center; font-size: .74rem; letter-spacing: .2em; color: var(--mute); }
`, _PartnerRow = class _PartnerRow extends LitElement {
  constructor() {
    super(...arguments), this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("cf-host"), injectFonts(), injectStyles("cf-base", baseCss), injectStyles("cf-partner-row", css), this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  render() {
    const cfg = getConfig(this.config), items = getCollectionItems(cfg.items, "items").map((item) => ({ mark: localizedString(item.mark), name: localizedString(item.name), note: localizedString(item.note) })).filter((item) => item.name);
    return html`<section id="cf-partners" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "partners"}>
      <div class="cf-wrap">
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${items.length ? html`<div class="cf-receipt">
              ${localizedString(cfg.kicker) || localizedString(cfg.subtitle) ? html`<header><span>${localizedString(cfg.kicker)}</span><span>${localizedString(cfg.subtitle)}</span></header>` : nothing}
              ${items.map((item) => html`<article class="cf-partner">${item.mark ? html`<i>${item.mark}</i>` : nothing}<b>${item.name}</b><em aria-hidden="true"></em>${item.note ? html`<span>${item.note}</span>` : nothing}</article>`)}
              ${localizedString(cfg.note) ? html`<footer>${localizedString(cfg.note)}</footer>` : nothing}
            </div>` : html`<p class="cf-empty">${t({ ar: "أضف الشركاء من الإعدادات", en: "Add the partners in the settings" })}</p>`}
      </div>
    </section>`;
  }
};
__name(_PartnerRow, "PartnerRow");
let PartnerRow = _PartnerRow;
__decorateClass([
  property({ type: Object })
], PartnerRow.prototype, "config");
typeof PartnerRow < "u" && PartnerRow.registerSallaComponent("salla-supply-ledger");
export {
  PartnerRow as default
};
