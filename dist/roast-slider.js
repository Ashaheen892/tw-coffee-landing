var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/components/roast-slider/index.ts
import { html as html2, LitElement, nothing as nothing2 } from "lit";
import { property } from "lit/decorators.js";

// src/utils/config.ts
function getConfig(raw) {
  if (!raw) return {};
  if (raw.component && typeof raw.component === "object") return raw.component;
  return raw;
}
__name(getConfig, "getConfig");
function getLocale() {
  const lang = window.Salla?.lang?.getLocale?.() || document.documentElement.lang || "ar";
  return String(lang).toLowerCase().startsWith("en") ? "en" : "ar";
}
__name(getLocale, "getLocale");
function isRtl() {
  return (document.documentElement.dir || (getLocale() === "ar" ? "rtl" : "ltr")) === "rtl";
}
__name(isRtl, "isRtl");
function localizedString(value) {
  if (value === null || value === void 0 || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value;
    const text = obj[getLocale()] || obj.ar || obj.en;
    return typeof text === "string" ? text : "";
  }
  return String(value);
}
__name(localizedString, "localizedString");
function t(strings) {
  return getLocale() === "ar" ? strings.ar : strings.en;
}
__name(t, "t");
function unwrapValue(value) {
  if (Array.isArray(value)) return unwrapValue(value[0]?.value ?? value[0] ?? "");
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value ?? "";
}
__name(unwrapValue, "unwrapValue");
function getCollectionItems(items, prefix) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (!item || typeof item !== "object") return {};
    const normalized = {};
    for (const [key, val] of Object.entries(item)) {
      normalized[key.startsWith(`${prefix}.`) ? key.slice(prefix.length + 1) : key] = val;
    }
    return normalized;
  });
}
__name(getCollectionItems, "getCollectionItems");
function watchLocale(host) {
  const update = /* @__PURE__ */ __name(() => host.requestUpdate(), "update");
  window.addEventListener("language-changed", update);
  return () => window.removeEventListener("language-changed", update);
}
__name(watchLocale, "watchLocale");

// src/utils/video.ts
function clipUrl(value) {
  const raw = unwrapValue(value);
  if (typeof raw === "string") return raw.trim();
  if (raw && typeof raw === "object") {
    const url = raw.url ?? raw.src;
    if (typeof url === "string") return url.trim();
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
  let frame = url;
  const kind = kindOf(url);
  try {
    const parsed = new URL(url);
    if (kind === "youtube") {
      const host = parsed.hostname.replace(/^www\./, "");
      let id = "";
      if (host === "youtu.be") id = parsed.pathname.split("/").filter(Boolean)[0] || "";
      else if (parsed.pathname.includes("/embed/")) id = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
      else if (parsed.pathname.includes("/shorts/")) id = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      else id = parsed.searchParams.get("v") || "";
      if (id) frame = `https://www.youtube-nocookie.com/embed/${id}`;
    } else if (kind === "vimeo") {
      const id = parsed.pathname.split("/").filter(Boolean).pop() || "";
      if (/^\d+$/.test(id)) frame = `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    frame = url;
  }
  if (kind === "file") return frame;
  const params = new URLSearchParams();
  params.set("autoplay", "1");
  params.set("playsinline", "1");
  if (kind === "youtube") {
    params.set("mute", "1");
    params.set("rel", "0");
    params.set("enablejsapi", "1");
  } else if (kind === "vimeo") {
    params.set("muted", "1");
  } else {
    params.set("mute", "1");
    params.set("muted", "1");
  }
  return `${frame}${frame.includes("?") ? "&" : "?"}${params.toString()}`;
}
__name(frameSrc, "frameSrc");

// src/utils/deck.ts
var _a;
var Deck = (_a = class {
  constructor(host, imageMs = 6500, frameMs = 18e3) {
    this.host = host;
    this.imageMs = imageMs;
    this.frameMs = frameMs;
    this.index = 0;
    this.sound = false;
    this.paused = false;
    this.reduced = false;
    this.kinds = [];
    /** Slides whose video failed to load: they are timed like an image so the slider never stalls. */
    this.failed = /* @__PURE__ */ new Set();
    this.timer = 0;
    this.left = 0;
    this.since = 0;
    this.point = 0;
    this.pointing = false;
    this.pause = /* @__PURE__ */ __name(() => {
      if (this.paused) return;
      this.paused = true;
      if (this.timer) {
        window.clearTimeout(this.timer);
        this.timer = 0;
        this.left = Math.max(400, this.left - (performance.now() - this.since));
      }
      this.host.requestUpdate();
    }, "pause");
    this.resume = /* @__PURE__ */ __name(() => {
      if (!this.paused) return;
      this.paused = false;
      if (this.auto && this.left) {
        this.since = performance.now();
        this.timer = window.setTimeout(() => this.go(1), this.left);
      }
      this.host.requestUpdate();
    }, "resume");
    /** Bind to a video's error event. */
    this.fail = /* @__PURE__ */ __name(() => {
      if (this.failed.has(this.index)) return;
      this.failed.add(this.index);
      this.arm();
      this.host.requestUpdate();
    }, "fail");
    this.key = /* @__PURE__ */ __name((event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const forward = isRtl() ? event.key === "ArrowLeft" : event.key === "ArrowRight";
      this.go(forward ? 1 : -1);
    }, "key");
    this.down = /* @__PURE__ */ __name((event) => {
      if (event.target.closest("button, a")) return;
      this.point = event.clientX;
      this.pointing = true;
    }, "down");
    this.up = /* @__PURE__ */ __name((event) => {
      if (!this.pointing) return;
      this.pointing = false;
      const delta = event.clientX - this.point;
      if (Math.abs(delta) < 48) return;
      const forward = isRtl() ? delta > 0 : delta < 0;
      this.go(forward ? 1 : -1);
    }, "up");
    /** Fills a progress bar from a video file's own clock. */
    this.progress = /* @__PURE__ */ __name((event) => {
      const video = event.currentTarget;
      const bar = this.host.querySelector("[data-deck-fill]");
      if (bar && video.duration) bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
    }, "progress");
    host.addController(this);
  }
  static kindOf(video) {
    if (!video) return "image";
    return isFileClip(video) ? "file" : "frame";
  }
  hostConnected() {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.host.addEventListener("pointerenter", this.pause);
    this.host.addEventListener("pointerleave", this.resume);
    this.host.addEventListener("focusin", this.pause);
    this.host.addEventListener("focusout", this.resume);
  }
  hostDisconnected() {
    window.clearTimeout(this.timer);
    this.host.removeEventListener("pointerenter", this.pause);
    this.host.removeEventListener("pointerleave", this.resume);
    this.host.removeEventListener("focusin", this.pause);
    this.host.removeEventListener("focusout", this.resume);
  }
  /** Call from render with the current slides. Starts the clock on the first call and when the slides change. */
  sync(kinds) {
    const changed = kinds.join() !== this.kinds.join();
    if (changed) this.failed.clear();
    this.kinds = kinds;
    if (this.index >= kinds.length) this.index = 0;
    if (changed) this.arm();
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
    if (this.kind === "file") return 0;
    return this.kind === "frame" ? this.frameMs : this.imageMs;
  }
  get auto() {
    return !this.reduced && this.count > 1;
  }
  arm(ms = this.ms) {
    window.clearTimeout(this.timer);
    this.timer = 0;
    this.left = ms;
    if (!this.auto || !ms) return;
    this.since = performance.now();
    if (this.paused) return;
    this.timer = window.setTimeout(() => this.go(1), ms);
  }
  go(dir) {
    if (this.count < 2) return;
    this.index = (this.index + dir + this.count) % this.count;
    this.arm();
    this.host.requestUpdate();
  }
  pick(index) {
    this.index = index;
    this.arm();
    this.host.requestUpdate();
  }
  toggleSound() {
    this.sound = !this.sound;
    this.host.requestUpdate();
  }
}, __name(_a, "Deck"), _a);

// src/utils/landing.ts
import { html, nothing } from "lit";
function salla() {
  return window.Salla;
}
__name(salla, "salla");
function landingSettings() {
  return salla()?.config?.get("theme.settings") || {};
}
__name(landingSettings, "landingSettings");
function isLandingPage() {
  return salla()?.config?.get("page.is_landing_page") === true;
}
__name(isLandingPage, "isLandingPage");
function pageMode() {
  const value = landingSettings().page_for_product;
  if (typeof value === "boolean" || value == null) return value === false ? "promotion" : "product";
  if (typeof value === "string") return value === "promotion" ? "promotion" : "product";
  return Array.isArray(value) && value[0]?.value === "promotion" ? "promotion" : "product";
}
__name(pageMode, "pageMode");
function landingProductId() {
  if (!isLandingPage() || pageMode() !== "product") return null;
  const id = landingSettings().product?.value?.[0];
  return id ? String(id) : null;
}
__name(landingProductId, "landingProductId");
function mainButton() {
  const settings = landingSettings();
  return { text: String(settings.main_btn_text || ""), url: String(settings.main_btn_url || "") };
}
__name(mainButton, "mainButton");
function openCheckout() {
  const checkout = document.querySelector(".s-block--fast-checkout");
  const layout = checkout?.getAttribute("data-layout");
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
  const cls = tone === "ghost" ? "cf-btn ghost" : "cf-btn";
  const productPage = Boolean(landingProductId());
  const demo = !isLandingPage();
  if (productPage || demo && !fallbackUrl) {
    return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  }
  const href = (isLandingPage() && pageMode() === "promotion" ? mainButton().url : "") || fallbackUrl;
  if (!href) return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  return html`<a class=${cls} href=${href}>${label}</a>`;
}
__name(renderCta, "renderCta");
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  if (scheme === "dark") return "cf-dark";
  if (scheme === "light") return "cf-light";
  return "cf-auto";
}
__name(schemeOf, "schemeOf");

// src/utils/styles.ts
function markEditing() {
  const root = document.documentElement;
  const read = /* @__PURE__ */ __name(() => {
    let on = true;
    try {
      const salla2 = window.Salla;
      on = window.self !== window.top || salla2?.config?.get?.("page.is_landing_page") !== true;
    } catch {
      on = true;
    }
    root.dataset.lpEditing = on ? "1" : "0";
  }, "read");
  if (root.dataset.lpEditing) return;
  read();
  try {
    window.Salla?.onReady?.(read);
  } catch {
  }
}
__name(markEditing, "markEditing");
function injectStyles(id, css2) {
  markEditing();
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  if (style.textContent !== css2) style.textContent = css2;
}
__name(injectStyles, "injectStyles");
var KIT_FONT = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Noto+Kufi+Arabic:wght@400;600;800;900&display=swap";
function setKitFont(on) {
  document.documentElement.classList.toggle("cf-kit-font", on);
  const current = document.getElementById("cf-fonts");
  if (!on) {
    current?.remove();
    return;
  }
  if (current) return;
  const link = document.createElement("link");
  link.id = "cf-fonts";
  link.rel = "stylesheet";
  link.href = KIT_FONT;
  document.head.appendChild(link);
}
__name(setKitFont, "setKitFont");
function injectFonts() {
  if (!document.documentElement.classList.contains("cf-kit-font")) return;
  setKitFont(true);
}
__name(injectFonts, "injectFonts");
function sectionStyle(cfg) {
  return cfg.bg_color ? `--cf-section-bg:${cfg.bg_color}` : "";
}
__name(sectionStyle, "sectionStyle");
var DARK = `--bg:#0d0b09; --bg-2:#15110d; --ink:#f2ece2; --mute:#9a8f82; --line:#3a322a; --line-2:#564a3e; --rust:#c2410c; --amber:#e08b3f; --crema:#d9b98c; --card:#120f0c; --on-rust:#fff;`;
var LIGHT = `--bg:#f6f1ea; --bg-2:#efe6da; --ink:#1c140e; --mute:#6d6258; --line:#e0d4c6; --line-2:#c9b8a4; --rust:#c2410c; --amber:#a85f1f; --crema:#8a5a28; --card:#fffdf9; --on-rust:#fff;`;
var baseCss = `
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

// src/components/roast-slider/index.ts
var css = `
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
`;
var _RoastSlider = class _RoastSlider extends LitElement {
  constructor() {
    super(...arguments);
    this.deck = new Deck(this, 6500, 18e3);
    this.stop = /* @__PURE__ */ __name(() => {
    }, "stop");
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-roast-slider", css);
    this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }
  media(slide, total) {
    const kind = Deck.kindOf(slide.video);
    if (kind === "image") return slide.image ? html2`<img src=${slide.image} alt=${slide.alt || slide.title} />` : html2`<div class="cf-ph" aria-hidden="true"></div>`;
    const tag = html2`<span class="cf-vtag">${t({ ar: "\u0641\u064A\u062F\u064A\u0648", en: "VIDEO" })}</span>`;
    if (kind === "frame") return html2`${tag}<iframe src=${frameSrc(slide.video)} title=${slide.alt || slide.title} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy"></iframe>`;
    return html2`${tag}<video src=${slide.video} poster=${slide.image || nothing2} .muted=${!this.deck.sound} autoplay playsinline preload="metadata" ?loop=${total < 2 || this.deck.reduced}
        aria-label=${slide.alt || slide.title} @timeupdate=${this.deck.progress} @ended=${() => this.deck.go(1)} @error=${this.deck.fail}></video>
      <button type="button" class="cf-sound" @click=${() => this.deck.toggleSound()}>${this.deck.sound ? t({ ar: "\u0643\u062A\u0645", en: "Mute" }) : t({ ar: "\u0627\u0644\u0635\u0648\u062A", en: "Sound" })}</button>`;
  }
  render() {
    const cfg = getConfig(this.config);
    const slides = getCollectionItems(cfg.items, "items").map((item) => ({
      image: String(item.image || "").trim(),
      video: clipUrl(item.video),
      alt: localizedString(item.alt),
      tag: localizedString(item.tag),
      title: localizedString(item.title),
      text: localizedString(item.text),
      button: localizedString(item.button),
      url: String(item.url || "").trim()
    })).filter((item) => item.title || item.image || item.video);
    const deck = this.deck;
    deck.sync(slides.map((item) => Deck.kindOf(item.video)));
    const slide = slides[deck.index];
    const label = localizedString(cfg.title) || t({ ar: "\u0633\u0644\u0627\u064A\u062F\u0631", en: "Slider" });
    if (!slide) return html2`<section class=${`cf-root cf-sec ${schemeOf(cfg)}`}><div class="cf-wrap"><p class="cf-empty">${t({ ar: "\u0623\u0636\u0641 \u0627\u0644\u0634\u0631\u0627\u0626\u062D \u0645\u0646 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", en: "Add slides in the settings" })}</p></div></section>`;
    const left = html2`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`;
    const right = html2`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`;
    const fillClass = deck.kind === "file" ? "" : deck.auto ? "run" : "done";
    return html2`<section id="cf-slides" class=${`cf-root cf-slides ${schemeOf(cfg)} ${deck.paused ? "is-held" : ""}`} style=${`${sectionStyle(cfg)};--ms:${deck.ms}ms`}
        aria-roledescription="carousel" aria-label=${label} @keydown=${deck.key}>
      <div class="cf-stage" @pointerdown=${deck.down} @pointerup=${deck.up} @pointercancel=${deck.up}>
        ${this.media(slide, slides.length)}
        <div class="cf-wrap">
          <article class="cf-slidecard" aria-live="polite">
            <i><small>${slide.tag || t({ ar: "\u062F\u0641\u0639\u0629", en: "LOT" })}</small>${String(deck.index + 1).padStart(2, "0")}</i>
            <div>
              ${slide.title ? html2`<h2>${slide.title}</h2>` : nothing2}
              ${slide.text ? html2`<p>${slide.text}</p>` : nothing2}
              ${slide.button ? html2`<div class="cf-acts">${renderCta(slide.button, slide.url)}</div>` : nothing2}
            </div>
          </article>
        </div>
        ${slides.length > 1 ? html2`<div class="cf-arrows">
          <button type="button" aria-label=${t({ ar: "\u0627\u0644\u0633\u0627\u0628\u0642", en: "Previous" })} @click=${() => deck.go(-1)}>${left}</button>
          <button type="button" aria-label=${t({ ar: "\u0627\u0644\u062A\u0627\u0644\u064A", en: "Next" })} @click=${() => deck.go(1)}>${right}</button>
        </div>` : nothing2}
      </div>
      ${slides.length > 1 ? html2`<div class="cf-tabs" role="tablist">
        ${slides.map((item, index) => html2`<button type="button" class="cf-tab" role="tab" aria-current=${index === deck.index ? "true" : "false"} @click=${() => deck.pick(index)}>
          <span class="cf-fill ${index === deck.index ? fillClass : ""}" ?data-deck-fill=${index === deck.index && deck.kind === "file"} aria-hidden="true"></span>
          <b>${String(index + 1).padStart(2, "0")}</b><span>${item.title || item.tag}</span>
        </button>`)}
      </div>` : nothing2}
    </section>`;
  }
};
__name(_RoastSlider, "RoastSlider");
__decorateClass([
  property({ type: Object })
], _RoastSlider.prototype, "config", 2);
var RoastSlider = _RoastSlider;
export {
  RoastSlider as default
};
typeof RoastSlider < "u" && RoastSlider.registerSallaComponent("salla-roast-slider");
