var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { nothing, html, LitElement } from "lit";
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
function watchReels(root, selector = "video[data-reel]") {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window)) return () => {
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      entry.isIntersecting && entry.intersectionRatio > 0.55 && !reduced ? video.play().catch(() => {
      }) : video.paused || video.pause();
    });
  }, { threshold: [0, 0.55, 1] });
  return root.querySelectorAll(selector).forEach((video) => io.observe(video)), () => io.disconnect();
}
__name(watchReels, "watchReels");
function nudge(track, dir) {
  if (!track) return;
  const card = track.firstElementChild, step = ((card == null ? void 0 : card.getBoundingClientRect().width) || 260) + 14, rtl = getComputedStyle(track).direction === "rtl";
  track.scrollBy({ left: (rtl ? -1 : 1) * dir * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
__name(nudge, "nudge");
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
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.cf-film { background: var(--cf-section-bg, var(--bg)); }
.cf-film-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 22px; }
.cf-film-head p { color: var(--mute); max-width: 46ch; margin-top: 8px; }
.cf-film-arrows { display: flex; gap: 8px; }
[dir="rtl"] .cf-film-arrows svg { transform: scaleX(-1); }
.cf-film-arrows button { width: 3rem; height: 3rem; display: grid; place-items: center; border: 2px solid var(--ink); background: transparent; color: var(--ink); cursor: pointer; }
.cf-film-arrows svg { width: 1.2rem; height: 1.2rem; }
.cf-strip { position: relative; padding-block: 26px; background: #120d09; }
.cf-strip::before, .cf-strip::after { content: ""; position: absolute; inset-inline: 0; height: 14px; background: radial-gradient(circle, #f2ece2 0 3.5px, transparent 4px) 0 50% / 22px 14px repeat-x; opacity: .55; }
.cf-strip::before { top: 6px; } .cf-strip::after { bottom: 6px; }
.cf-track { display: grid; grid-auto-flow: column; grid-auto-columns: clamp(210px, 26vw, 270px); gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding-inline: max(var(--pad), calc((100% - var(--max)) / 2)); scrollbar-width: none; }
.cf-track::-webkit-scrollbar { display: none; }
.cf-reel { position: relative; scroll-snap-align: start; aspect-ratio: 9 / 16; overflow: hidden; background: #2a1f17; border: 2px solid #3a2e24; color: #f2ece2; }
.cf-reel.is-on { border-color: var(--amber); }
.cf-reel > video, .cf-reel > img, .cf-reel > iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; }
.cf-reel::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgb(13 11 9 / 92%) 4%, transparent 52%); pointer-events: none; }
.cf-reel-tap { position: absolute; z-index: 2; inset: 0; border: 0; background: transparent; cursor: pointer; }
.cf-reel-no { position: absolute; z-index: 3; top: 10px; inset-inline-start: 10px; padding: 2px 8px; background: var(--amber); color: #1c140e; font-weight: 900; font-size: .78rem; font-variant-numeric: tabular-nums; pointer-events: none; }
.cf-reel-snd { position: absolute; z-index: 3; top: 10px; inset-inline-end: 10px; width: 2.2rem; height: 2.2rem; display: grid; place-items: center; background: rgb(13 11 9 / 70%); border: 2px solid #f2ece2; font-size: .9rem; pointer-events: none; }
.cf-reel-play { position: absolute; z-index: 3; top: 50%; inset-inline-start: 50%; translate: 50% -50%; width: 3.6rem; height: 3.6rem; display: grid; place-items: center; border: 2px solid #f2ece2; background: rgb(13 11 9 / 60%); font-size: 1.2rem; pointer-events: none; }
[dir="ltr"] .cf-reel-play { translate: -50% -50%; }
.cf-reel-cap { position: absolute; z-index: 3; inset-inline: 0; bottom: 0; padding: 14px; display: grid; gap: 4px; pointer-events: none; }
.cf-reel-cap b { font-family: var(--disp); font-weight: 800; font-size: 1.02rem; }
.cf-reel-cap span { font-size: .82rem; opacity: .8; }
.cf-reel-cap .cf-reel-buy { pointer-events: auto; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgb(242 236 226 / 35%); }
.cf-reel-cap .cf-reel-buy em { font-style: normal; font-weight: 900; color: var(--amber); }
.cf-reel-cap .cf-reel-buy .cf-btn, .cf-reel-cap .cf-reel-buy a, .cf-reel-cap .cf-reel-buy button { min-height: 2.3rem; padding: 0 12px; font-size: .8rem; }
@container (max-width: 640px) { .cf-track { grid-auto-columns: 70%; } .cf-film-arrows { display: none; } }
`, _BrewReels = class _BrewReels extends LitElement {
  constructor() {
    super(...arguments), this.active = -1, this.opened = /* @__PURE__ */ new Set(), this.stop = () => {
    }, this.stopReels = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("cf-host"), injectFonts(), injectStyles("cf-base", baseCss), injectStyles("cf-brew-reels", css), this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop(), this.stopReels(), super.disconnectedCallback();
  }
  updated() {
    this.stopReels(), this.stopReels = watchReels(this);
  }
  tap(index, reel) {
    if (reel.video) {
      if (!isFileClip(reel.video)) {
        this.opened = new Set(this.opened).add(index);
        return;
      }
      this.active = this.active === index ? -1 : index, this.querySelectorAll("video[data-reel]").forEach((video) => {
        const mine = Number(video.dataset.reel) === this.active;
        video.muted = !mine, mine && video.play().catch(() => {
        });
      });
    }
  }
  render() {
    const cfg = getConfig(this.config), reels = getCollectionItems(cfg.items, "items").map((item) => ({
      video: clipUrl(item.video),
      poster: String(item.poster || "").trim(),
      name: localizedString(item.name),
      note: localizedString(item.note),
      price: localizedString(item.price),
      button: localizedString(item.button),
      url: String(item.url || "").trim()
    })).filter((item) => item.video || item.poster), left = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`, right = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`, track = /* @__PURE__ */ __name(() => this.querySelector(".cf-track"), "track");
    return html`<section id="cf-film" class=${`cf-root cf-sec cf-film ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "reels"}>
      <div class="cf-wrap cf-film-head">
        <div>
          ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
          ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${reels.length > 2 ? html`<div class="cf-film-arrows">
          <button type="button" aria-label=${t({ ar: "السابق", en: "Previous" })} @click=${() => nudge(track(), -1)}>${left}</button>
          <button type="button" aria-label=${t({ ar: "التالي", en: "Next" })} @click=${() => nudge(track(), 1)}>${right}</button>
        </div>` : nothing}
      </div>
      ${reels.length ? html`<div class="cf-strip"><div class="cf-track">
        ${reels.map((reel, index) => {
      const file = reel.video && isFileClip(reel.video), frameOpen = reel.video && !file && this.opened.has(index);
      return html`<article class=${`cf-reel ${this.active === index ? "is-on" : ""}`}>
            ${file ? html`<video data-reel=${index} src=${reel.video} poster=${reel.poster || nothing} muted loop playsinline preload="metadata" aria-label=${reel.name}></video>` : frameOpen ? html`<iframe src=${frameSrc(reel.video)} title=${reel.name} allow="autoplay; encrypted-media; picture-in-picture"></iframe>` : reel.poster ? html`<img src=${reel.poster} alt=${reel.name} loading="lazy" />` : nothing}
            ${frameOpen ? nothing : html`<button type="button" class="cf-reel-tap" aria-label=${file ? this.active === index ? t({ ar: "كتم الصوت", en: "Mute" }) : t({ ar: "تشغيل الصوت", en: "Play with sound" }) : t({ ar: "تشغيل الفيديو", en: "Play video" })} @click=${() => this.tap(index, reel)}></button>`}
            <span class="cf-reel-no">${String(index + 1).padStart(2, "0")}</span>
            ${file ? html`<span class="cf-reel-snd" aria-hidden="true">${this.active === index ? "🔊" : "🔇"}</span>` : reel.video && !frameOpen ? html`<span class="cf-reel-play" aria-hidden="true">▶</span>` : nothing}
            <div class="cf-reel-cap">
              ${reel.name ? html`<b>${reel.name}</b>` : nothing}
              ${reel.note ? html`<span>${reel.note}</span>` : nothing}
              ${reel.price || reel.button ? html`<div class="cf-reel-buy">${reel.price ? html`<em>${reel.price}</em>` : html`<i></i>`}${reel.button ? renderCta(reel.button, reel.url) : nothing}</div>` : nothing}
            </div>
          </article>`;
    })}
      </div></div>` : html`<div class="cf-wrap"><p class="cf-empty">${t({ ar: "أضف مقاطع الريلز من الإعدادات", en: "Add reels in the settings" })}</p></div>`}
    </section>`;
  }
};
__name(_BrewReels, "BrewReels");
let BrewReels = _BrewReels;
__decorateClass([
  property({ type: Object })
], BrewReels.prototype, "config");
__decorateClass([
  state()
], BrewReels.prototype, "active");
__decorateClass([
  state()
], BrewReels.prototype, "opened");
typeof BrewReels < "u" && BrewReels.registerSallaComponent("salla-brew-reels");
export {
  BrewReels as default
};
