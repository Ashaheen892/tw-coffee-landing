var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { nothing, html, LitElement } from "lit";
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
function isRtl() {
  return (document.documentElement.dir || (getLocale() === "ar" ? "rtl" : "ltr")) === "rtl";
}
__name(isRtl, "isRtl");
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
function clipUrl(value) {
  const raw = unwrapValue(value);
  if (typeof raw == "string") return raw.trim();
  if (raw && typeof raw == "object") {
    const url = raw.url ?? raw.src;
    if (typeof url == "string") return url.trim();
  }
  return "";
}
__name(clipUrl, "clipUrl");
function isFileClip(url) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url);
}
__name(isFileClip, "isFileClip");
function kindOf(url) {
  if (isFileClip(url)) return "file";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host.includes("youtube.com") || host.includes("youtube-nocookie.com")) return "youtube";
    if (host.includes("vimeo.com")) return "vimeo";
  } catch {
  }
  return "other";
}
__name(kindOf, "kindOf");
function frameSrc(url) {
  var _a, _b;
  let frame = url;
  const kind = kindOf(url);
  try {
    const parsed = new URL(url);
    if (kind === "youtube") {
      const host = parsed.hostname.replace(/^www\./, "");
      let id = "";
      host === "youtu.be" ? id = parsed.pathname.split("/").filter(Boolean)[0] || "" : parsed.pathname.includes("/embed/") ? id = ((_a = parsed.pathname.split("/embed/")[1]) == null ? void 0 : _a.split("/")[0]) || "" : parsed.pathname.includes("/shorts/") ? id = ((_b = parsed.pathname.split("/shorts/")[1]) == null ? void 0 : _b.split("/")[0]) || "" : id = parsed.searchParams.get("v") || "", id && (frame = `https://www.youtube-nocookie.com/embed/${id}`);
    } else if (kind === "vimeo") {
      const id = parsed.pathname.split("/").filter(Boolean).pop() || "";
      /^\d+$/.test(id) && (frame = `https://player.vimeo.com/video/${id}`);
    }
  } catch {
    frame = url;
  }
  if (kind === "file") return frame;
  const params = new URLSearchParams();
  return params.set("autoplay", "1"), params.set("playsinline", "1"), kind === "youtube" ? (params.set("mute", "1"), params.set("rel", "0"), params.set("enablejsapi", "1")) : (kind === "vimeo" || params.set("mute", "1"), params.set("muted", "1")), `${frame}${frame.includes("?") ? "&" : "?"}${params.toString()}`;
}
__name(frameSrc, "frameSrc");
const _Deck = class _Deck {
  constructor(host, imageMs = 6500, frameMs = 18e3) {
    this.host = host, this.imageMs = imageMs, this.frameMs = frameMs, this.index = 0, this.sound = !1, this.paused = !1, this.reduced = !1, this.kinds = [], this.failed = /* @__PURE__ */ new Set(), this.timer = 0, this.left = 0, this.since = 0, this.point = 0, this.pointing = !1, this.pause = () => {
      this.paused || (this.paused = !0, this.timer && (window.clearTimeout(this.timer), this.timer = 0, this.left = Math.max(400, this.left - (performance.now() - this.since))), this.host.requestUpdate());
    }, this.resume = () => {
      this.paused && (this.paused = !1, this.auto && this.left && (this.since = performance.now(), this.timer = window.setTimeout(() => this.go(1), this.left)), this.host.requestUpdate());
    }, this.fail = () => {
      this.failed.has(this.index) || (this.failed.add(this.index), this.arm(), this.host.requestUpdate());
    }, this.key = (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const forward = isRtl() ? event.key === "ArrowLeft" : event.key === "ArrowRight";
      this.go(forward ? 1 : -1);
    }, this.down = (event) => {
      event.target.closest("button, a") || (this.point = event.clientX, this.pointing = !0);
    }, this.up = (event) => {
      if (!this.pointing) return;
      this.pointing = !1;
      const delta = event.clientX - this.point;
      if (Math.abs(delta) < 48) return;
      const forward = isRtl() ? delta > 0 : delta < 0;
      this.go(forward ? 1 : -1);
    }, this.progress = (event) => {
      const video = event.currentTarget, bar = this.host.querySelector("[data-deck-fill]");
      bar && video.duration && (bar.style.transform = `scaleX(${video.currentTime / video.duration})`);
    }, host.addController(this);
  }
  static kindOf(video) {
    return video ? isFileClip(video) ? "file" : "frame" : "image";
  }
  hostConnected() {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches, this.host.addEventListener("pointerenter", this.pause), this.host.addEventListener("pointerleave", this.resume), this.host.addEventListener("focusin", this.pause), this.host.addEventListener("focusout", this.resume);
  }
  hostDisconnected() {
    window.clearTimeout(this.timer), this.host.removeEventListener("pointerenter", this.pause), this.host.removeEventListener("pointerleave", this.resume), this.host.removeEventListener("focusin", this.pause), this.host.removeEventListener("focusout", this.resume);
  }
  /** Call from render with the current slides. Starts the clock on the first call and when the slides change. */
  sync(kinds) {
    const changed = kinds.join() !== this.kinds.join();
    changed && this.failed.clear(), this.kinds = kinds, this.index >= kinds.length && (this.index = 0), changed && this.arm();
  }
  get count() {
    return this.kinds.length;
  }
  get kind() {
    const kind = this.kinds[this.index] || "image";
    return kind === "file" && this.failed.has(this.index) ? "image" : kind;
  }
  /** How long the current slide stays, or 0 when it waits for a video to end. */
  get ms() {
    return this.kind === "file" ? 0 : this.kind === "frame" ? this.frameMs : this.imageMs;
  }
  get auto() {
    return !this.reduced && this.count > 1;
  }
  arm(ms = this.ms) {
    window.clearTimeout(this.timer), this.timer = 0, this.left = ms, !(!this.auto || !ms) && (this.since = performance.now(), !this.paused && (this.timer = window.setTimeout(() => this.go(1), ms)));
  }
  go(dir) {
    this.count < 2 || (this.index = (this.index + dir + this.count) % this.count, this.arm(), this.host.requestUpdate());
  }
  pick(index) {
    this.index = index, this.arm(), this.host.requestUpdate();
  }
  toggleSound() {
    this.sound = !this.sound, this.host.requestUpdate();
  }
};
__name(_Deck, "Deck");
let Deck = _Deck;
typeof Deck < "u" && Deck.registerSallaComponent("salla-roast-slider");
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
function markEditing() {
  var _a, _b;
  const root = document.documentElement, read = /* @__PURE__ */ __name(() => {
    var _a2, _b2;
    let on = !0;
    try {
      const salla2 = window.Salla;
      on = window.self !== window.top || ((_b2 = (_a2 = salla2 == null ? void 0 : salla2.config) == null ? void 0 : _a2.get) == null ? void 0 : _b2.call(_a2, "page.is_landing_page")) !== !0;
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
.cf-slides { padding: 0; background: var(--cf-section-bg, var(--bg)); }
.cf-stage { position: relative; min-height: clamp(460px, 78vh, 780px); display: flex; align-items: flex-end; overflow: hidden; overflow: clip; background: var(--bg-2); touch-action: pan-y; }
.cf-stage > img, .cf-stage > video, .cf-stage > iframe, .cf-stage > .cf-ph { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; animation: cf-slide-in .6s ease; }
.cf-stage > iframe { pointer-events: none; transform: scale(1.35); }
.cf-stage > .cf-ph { background: radial-gradient(circle at 70% 30%, var(--crema), var(--rust) 45%, #241208 85%); }
.cf-stage::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgb(13 11 9 / 88%) 8%, rgb(13 11 9 / 18%) 58%, transparent); pointer-events: none; }
.cf-stage .cf-wrap { position: relative; z-index: 1; padding-block: 0 34px; }
.cf-slidecard { --notch: 12px; display: grid; grid-template-columns: 4.2rem 1fr; max-width: 640px; background: var(--bg); color: var(--ink); clip-path: polygon(0 0, 100% 0, 100% calc(50% - var(--notch)), calc(100% - var(--notch)) 50%, 100% calc(50% + var(--notch)), 100% 100%, 0 100%, 0 calc(50% + var(--notch)), var(--notch) 50%, 0 calc(50% - var(--notch))); }
.cf-slidecard > i { display: grid; place-content: center; gap: 4px; border-inline-end: 2px dashed var(--line-2); font-style: normal; text-align: center; font-weight: 900; font-size: 1.5rem; line-height: 1; color: var(--amber); font-variant-numeric: tabular-nums; }
.cf-slidecard > i small { font-size: .62rem; letter-spacing: .14em; color: var(--mute); font-weight: 700; }
.cf-slidecard > div { padding: 22px 24px 24px; }
.cf-slidecard h2 { font-size: clamp(1.5rem, 3.6vw, 2.5rem); }
.cf-slidecard p { margin-top: 8px; color: var(--mute); max-width: 48ch; }
.cf-slidecard .cf-acts { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 10px; }
.cf-sound { position: absolute; z-index: 2; top: 18px; inset-inline-end: 18px; min-height: 2.5rem; padding: 0 14px; border: 2px solid #f2ece2; background: rgb(13 11 9 / 70%); color: #f2ece2; font: inherit; font-weight: 800; cursor: pointer; }
.cf-vtag { position: absolute; z-index: 2; top: 18px; inset-inline-start: 18px; padding: 4px 12px; background: var(--rust); color: var(--on-rust); font-size: .76rem; font-weight: 800; letter-spacing: .12em; }
.cf-tabs { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); border-block-end: 2px solid var(--line); background: var(--cf-section-bg, var(--bg)); }
.cf-tab { position: relative; display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; min-height: 4.2rem; padding: 14px 18px 12px; border: 0; border-inline-start: 2px solid var(--line); background: transparent; color: var(--mute); font: inherit; text-align: start; cursor: pointer; }
.cf-tab:first-child { border-inline-start: 0; }
.cf-tab b { font-weight: 900; color: var(--amber); font-variant-numeric: tabular-nums; }
.cf-tab span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: .9rem; }
.cf-tab[aria-current="true"] { color: var(--ink); background: var(--bg-2); }
.cf-tab .cf-fill { position: absolute; inset-inline: 0; top: -2px; height: 4px; background: var(--amber); transform: scaleX(0); transform-origin: right; }
[dir="ltr"] .cf-tab .cf-fill { transform-origin: left; }
.cf-tab[aria-current="true"] .cf-fill.run { animation: cf-fill var(--ms, 6500ms) linear forwards; }
.cf-slides.is-held .cf-fill.run { animation-play-state: paused; }
.cf-tab[aria-current="true"] .cf-fill.done { transform: scaleX(1); }
.cf-arrows { position: absolute; z-index: 2; bottom: 34px; inset-inline-end: max(var(--pad), calc((100% - var(--max)) / 2)); display: flex; gap: 8px; }
[dir="rtl"] .cf-arrows svg { transform: scaleX(-1); }
.cf-arrows button { width: 3rem; height: 3rem; display: grid; place-items: center; border: 2px solid #f2ece2; background: rgb(13 11 9 / 60%); color: #f2ece2; cursor: pointer; }
.cf-arrows svg { width: 1.2rem; height: 1.2rem; }
@keyframes cf-fill { to { transform: scaleX(1); } }
@keyframes cf-slide-in { from { opacity: .3; } to { opacity: 1; } }
@container (max-width: 760px) {
  .cf-tabs { grid-auto-flow: row; grid-auto-columns: auto; }
  .cf-tab { border-inline-start: 0; border-block-start: 2px solid var(--line); }
  .cf-arrows { display: none; }
  .cf-slidecard { grid-template-columns: 3.2rem 1fr; }
}
@media (prefers-reduced-motion: reduce) { .cf-stage > * { animation: none !important; } .cf-fill.run { animation: none !important; transform: scaleX(1); } }
`, _RoastSlider = class _RoastSlider extends LitElement {
  constructor() {
    super(...arguments), this.deck = new Deck(this, 6500, 18e3), this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("cf-host"), injectFonts(), injectStyles("cf-base", baseCss), injectStyles("cf-roast-slider", css), this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  media(slide, total) {
    const kind = Deck.kindOf(slide.video);
    if (kind === "image") return slide.image ? html`<img src=${slide.image} alt=${slide.alt || slide.title} />` : html`<div class="cf-ph" aria-hidden="true"></div>`;
    const tag = html`<span class="cf-vtag">${t({ ar: "فيديو", en: "VIDEO" })}</span>`;
    return kind === "frame" ? html`${tag}<iframe src=${frameSrc(slide.video)} title=${slide.alt || slide.title} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy"></iframe>` : html`${tag}<video src=${slide.video} poster=${slide.image || nothing} .muted=${!this.deck.sound} autoplay playsinline preload="metadata" ?loop=${total < 2 || this.deck.reduced}
        aria-label=${slide.alt || slide.title} @timeupdate=${this.deck.progress} @ended=${() => this.deck.go(1)} @error=${this.deck.fail}></video>
      <button type="button" class="cf-sound" @click=${() => this.deck.toggleSound()}>${this.deck.sound ? t({ ar: "كتم", en: "Mute" }) : t({ ar: "الصوت", en: "Sound" })}</button>`;
  }
  render() {
    const cfg = getConfig(this.config), slides = getCollectionItems(cfg.items, "items").map((item) => ({
      image: String(item.image || "").trim(),
      video: clipUrl(item.video),
      alt: localizedString(item.alt),
      tag: localizedString(item.tag),
      title: localizedString(item.title),
      text: localizedString(item.text),
      button: localizedString(item.button),
      url: String(item.url || "").trim()
    })).filter((item) => item.title || item.image || item.video), deck = this.deck;
    deck.sync(slides.map((item) => Deck.kindOf(item.video)));
    const slide = slides[deck.index], label = localizedString(cfg.title) || t({ ar: "سلايدر", en: "Slider" });
    if (!slide) return html`<section class=${`cf-root cf-sec ${schemeOf(cfg)}`}><div class="cf-wrap"><p class="cf-empty">${t({ ar: "أضف الشرائح من الإعدادات", en: "Add slides in the settings" })}</p></div></section>`;
    const left = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`, right = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`, fillClass = deck.kind === "file" ? "" : deck.auto ? "run" : "done";
    return html`<section id="cf-slides" class=${`cf-root cf-slides ${schemeOf(cfg)} ${deck.paused ? "is-held" : ""}`} style=${`${sectionStyle(cfg)};--ms:${deck.ms}ms`}
        aria-roledescription="carousel" aria-label=${label} @keydown=${deck.key}>
      <div class="cf-stage" @pointerdown=${deck.down} @pointerup=${deck.up} @pointercancel=${deck.up}>
        ${this.media(slide, slides.length)}
        <div class="cf-wrap">
          <article class="cf-slidecard" aria-live="polite">
            <i><small>${slide.tag || t({ ar: "دفعة", en: "LOT" })}</small>${String(deck.index + 1).padStart(2, "0")}</i>
            <div>
              ${slide.title ? html`<h2>${slide.title}</h2>` : nothing}
              ${slide.text ? html`<p>${slide.text}</p>` : nothing}
              ${slide.button ? html`<div class="cf-acts">${renderCta(slide.button, slide.url)}</div>` : nothing}
            </div>
          </article>
        </div>
        ${slides.length > 1 ? html`<div class="cf-arrows">
          <button type="button" aria-label=${t({ ar: "السابق", en: "Previous" })} @click=${() => deck.go(-1)}>${left}</button>
          <button type="button" aria-label=${t({ ar: "التالي", en: "Next" })} @click=${() => deck.go(1)}>${right}</button>
        </div>` : nothing}
      </div>
      ${slides.length > 1 ? html`<div class="cf-tabs" role="tablist">
        ${slides.map((item, index) => html`<button type="button" class="cf-tab" role="tab" aria-current=${index === deck.index ? "true" : "false"} @click=${() => deck.pick(index)}>
          <span class="cf-fill ${index === deck.index ? fillClass : ""}" ?data-deck-fill=${index === deck.index && deck.kind === "file"} aria-hidden="true"></span>
          <b>${String(index + 1).padStart(2, "0")}</b><span>${item.title || item.tag}</span>
        </button>`)}
      </div>` : nothing}
    </section>`;
  }
};
__name(_RoastSlider, "RoastSlider");
let RoastSlider = _RoastSlider;
__decorateClass([
  property({ type: Object })
], RoastSlider.prototype, "config");
typeof RoastSlider < "u" && RoastSlider.registerSallaComponent("salla-roast-slider");
export {
  RoastSlider as default
};
