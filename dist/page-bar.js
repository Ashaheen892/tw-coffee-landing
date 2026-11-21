var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { LitElement, nothing, html } from "lit";
import { property, state } from "lit/decorators.js";
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
function flag(value) {
  const raw = unwrapValue(value);
  if (raw === !0 || raw === 1) return !0;
  if (typeof raw == "string") {
    const text = raw.trim().toLowerCase();
    return text === "true" || text === "1" || text === "on" || text === "yes";
  }
  return !1;
}
__name(flag, "flag");
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
const TONE_KEY = "cf-landing-tone";
function applyTone(mode) {
  document.documentElement.classList.remove("cf-mode-light", "cf-mode-dark"), document.documentElement.classList.add(mode === "dark" ? "cf-mode-dark" : "cf-mode-light");
  try {
    localStorage.setItem(TONE_KEY, mode);
  } catch {
  }
  window.dispatchEvent(new CustomEvent("cf-tone"));
}
__name(applyTone, "applyTone");
function currentTone() {
  return document.documentElement.classList.contains("cf-mode-dark") ? "dark" : "light";
}
__name(currentTone, "currentTone");
function savedTone() {
  try {
    const saved = localStorage.getItem(TONE_KEY);
    return saved === "dark" || saved === "light" ? saved : "";
  } catch {
    return "";
  }
}
__name(savedTone, "savedTone");
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
  document.documentElement.classList.toggle("cf-kit-font", on);
  const current = document.getElementById("cf-fonts");
  if (!on) {
    current == null || current.remove();
    return;
  }
  if (current) return;
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
.cf-root.cf-light { ${LIGHT} }
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
.cf-bar { position: relative; background: var(--cf-section-bg, var(--bg)); border-block-end: 2px solid var(--line); }
.cf-nav { display: flex; align-items: center; gap: 22px; min-height: 74px; }
.cf-logo { font-family: var(--disp); font-weight: 900; font-size: 1.15rem; letter-spacing: .04em; line-height: 1.05; }
.cf-logo small { display: block; margin-top: 4px; font-family: var(--body); font-size: .62rem; letter-spacing: .28em; color: var(--crema); font-weight: 500; }
.cf-logo img { height: 42px; width: auto; max-width: 42vw; object-fit: contain; }
.cf-nav ul { display: flex; gap: 18px; margin: 0; padding: 0; font-size: .82rem; }
.cf-nav ul a { padding-block: 4px; border-block-end: 2px solid transparent; }
.cf-nav ul a:hover { border-color: var(--amber); color: var(--crema); }
.cf-sp { margin-inline-start: auto; }
.cf-menu, .cf-tone { display: inline-grid; place-items: center; width: 40px; height: 40px; border: 2px solid var(--line-2); background: transparent; color: inherit; cursor: pointer; padding: 0; }
.cf-tone svg { width: 18px; height: 18px; }
.cf-menu { display: none; font-family: var(--disp); font-weight: 800; }
@container (max-width: 860px) {
  .cf-nav { gap: 10px; }
  .cf-logo { font-size: 1rem; white-space: nowrap; }
  .cf-nav ul { display: none; position: absolute; inset-inline: 0; top: 100%; z-index: 5; flex-direction: column; gap: 0; padding: 6px 0 12px; background: var(--bg); border-block-end: 2px solid var(--line); }
  .cf-nav.is-open ul { display: flex; }
  .cf-nav ul a { display: block; padding: 12px var(--pad); }
  .cf-menu { display: inline-grid; }
}
`, _PageBar = class _PageBar extends LitElement {
  constructor() {
    super(...arguments), this.open = !1, this.dark = !1, this.stop = () => {
    }, this.pinned = null, this.opened = [], this.modeKey = "";
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("cf-host"), injectFonts(), injectStyles("cf-base", baseCss), injectStyles("cf-page-bar", css);
    const stopLocale = watchLocale(this), onTone = /* @__PURE__ */ __name(() => {
      this.dark = currentTone() === "dark";
    }, "onTone");
    window.addEventListener("cf-tone", onTone), this.stop = () => {
      stopLocale(), window.removeEventListener("cf-tone", onTone), this.release();
    };
  }
  willUpdate() {
    const cfg = getConfig(this.config);
    setKitFont(this.kitFont(cfg));
    const key = `${unwrapValue(cfg.default_mode) || "dark"}|${this.showMode(cfg)}`;
    key !== this.modeKey && (this.modeKey = key, applyTone(this.openingMode(cfg)), this.dark = currentTone() === "dark");
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  updated() {
    this.pin();
  }
  showMode(cfg) {
    return cfg.show_mode_toggle == null || cfg.show_mode_toggle === "" ? !0 : flag(cfg.show_mode_toggle);
  }
  kitFont(cfg) {
    return cfg.use_kit_font == null || cfg.use_kit_font === "" ? !0 : flag(cfg.use_kit_font);
  }
  openingMode(cfg) {
    const base = String(unwrapValue(cfg.default_mode) || "dark");
    if (this.showMode(cfg)) {
      const saved = savedTone();
      if (saved) return saved;
    }
    return base === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : base === "dark" ? "dark" : "light";
  }
  place(run) {
    const view = this.ownerDocument.defaultView;
    if (!view) {
      run();
      return;
    }
    const nodes = /* @__PURE__ */ new Set([this.ownerDocument.documentElement, this.ownerDocument.body]);
    this.ownerDocument.scrollingElement && nodes.add(this.ownerDocument.scrollingElement);
    let node = this;
    for (; node; )
      nodes.add(node), node = node.parentElement;
    const marks = [...nodes].map((el) => [el, el.scrollTop]), x = view.scrollX, y = view.scrollY, put = /* @__PURE__ */ __name(() => {
      for (const [el, top] of marks) el.scrollTop !== top && (el.scrollTop = top);
      (Math.abs(view.scrollY - y) > 1 || Math.abs(view.scrollX - x) > 1) && view.scrollTo(x, y);
    }, "put");
    run(), put(), view.requestAnimationFrame(() => {
      put(), view.requestAnimationFrame(put);
    });
  }
  outerBox() {
    let node = this;
    for (; node.parentElement && node.parentElement !== document.body && node.parentElement !== document.documentElement; ) {
      const parent = node.parentElement;
      if ([...parent.children].filter((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE").length > 1) return node;
      node = parent;
    }
    return node;
  }
  pin() {
    const cfg = getConfig(this.config), sticky = flag(cfg.sticky), outer = this.outerBox();
    if (this.pinned && this.pinned !== outer && this.release(), this.pinned = outer, outer.style.position = sticky ? "sticky" : "", outer.style.top = sticky ? "0" : "", outer.style.zIndex = sticky ? "40" : "", this.opened.forEach((el) => {
      el.style.overflow = "";
    }), this.opened = [], !sticky) return;
    let node = outer.parentElement;
    for (; node && node !== document.body && node !== document.documentElement; ) {
      const flow = getComputedStyle(node);
      if (flow.overflowY === "auto" || flow.overflowY === "scroll") break;
      (flow.overflowY === "hidden" || flow.overflowX === "hidden") && (node.style.overflow = "clip", this.opened.push(node)), node = node.parentElement;
    }
  }
  release() {
    this.pinned && (this.pinned.style.position = this.pinned.style.top = this.pinned.style.zIndex = "", this.pinned = null), this.opened.forEach((el) => {
      el.style.overflow = "";
    }), this.opened = [];
  }
  render() {
    const cfg = getConfig(this.config), brand = localizedString(cfg.brand) || t({ ar: "مجموعة القهوة", en: "Coffee Group" }), mark = localizedString(cfg.mark), links = getCollectionItems(cfg.links, "links").map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" })).filter((item) => item.label), logo = this.dark && cfg.logo_dark || cfg.logo;
    return html`<header class=${`cf-root cf-bar ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <nav class="cf-nav cf-wrap ${this.open ? "is-open" : ""}">
        <a href=${linkHref(cfg.home_url) || "#cf-cover"} class="cf-logo" aria-label=${brand}>
          ${logo ? html`<img src=${logo} alt=${brand} />` : html`${brand}${mark ? html`<small>${mark}</small>` : nothing}`}
        </a>
        ${links.length ? html`<ul>${links.map((item) => html`<li><a href=${item.url} @click=${() => {
      this.open = !1;
    }}>${item.label}</a></li>`)}</ul>` : nothing}
        <span class="cf-sp"></span>
        ${this.showMode(cfg) ? html`<button type="button" class="cf-tone" aria-pressed=${this.dark ? "true" : "false"} aria-label=${this.dark ? t({ ar: "التبديل إلى الوضع الفاتح", en: "Switch to light mode" }) : t({ ar: "التبديل إلى الوضع الداكن", en: "Switch to dark mode" })} @mousedown=${(event) => event.preventDefault()} @click=${() => this.place(() => {
      applyTone(this.dark ? "light" : "dark"), this.dark = currentTone() === "dark";
    })}>
          ${this.dark ? html`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" /><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" /></g></svg>` : html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.5 2.4a9 9 0 1 0 7.1 13.6A8 8 0 0 1 14.5 2.4z" /></svg>`}
        </button>` : nothing}
        <button type="button" class="cf-menu" aria-expanded=${this.open ? "true" : "false"} aria-label=${t({ ar: "القائمة", en: "Menu" })} @click=${() => {
      this.open = !this.open;
    }}>☰</button>
      </nav>
    </header>`;
  }
};
__name(_PageBar, "PageBar");
let PageBar = _PageBar;
__decorateClass([
  property({ type: Object })
], PageBar.prototype, "config");
__decorateClass([
  state()
], PageBar.prototype, "open");
__decorateClass([
  state()
], PageBar.prototype, "dark");
typeof PageBar < "u" && PageBar.registerSallaComponent("salla-page-bar");
export {
  PageBar as default
};
