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
function setFrameSound(frame, on) {
  const win = frame.contentWindow;
  if (!win) return;
  const src = frame.src || "";
  src.includes("youtube") ? (win.postMessage(JSON.stringify({ event: "command", func: on ? "unMute" : "mute", args: "" }), "*"), win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [on ? 100 : 0] }), "*")) : src.includes("vimeo") && win.postMessage(JSON.stringify({ method: "setVolume", value: on ? 1 : 0 }), "*");
}
__name(setFrameSound, "setFrameSound");
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.cf-cup { background: var(--cf-section-bg, var(--bg)); }
.cf-sheet { margin-top: 28px; border: 2px solid var(--line); background: var(--card, var(--bg)); }
.cf-ticket { display: grid; grid-template-columns: 46px minmax(0, 1.15fr) minmax(220px, .85fr); border-block-end: 2px solid var(--line); }
.cf-ticket:last-child { border-block-end: 0; }
.cf-sprocket { background:
  radial-gradient(circle at 50% 18px, var(--bg) 5px, transparent 6px) 0 0 / 100% 36px repeat-y,
  var(--ink); }
.cf-frame { position: relative; min-height: 180px; background: #1c140e; color: #f6efe6; }
.cf-frame video, .cf-frame iframe, .cf-frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; }
.cf-tap { position: absolute; z-index: 2; inset: 0; display: grid; place-items: center; border: 0; background: linear-gradient(90deg, rgb(28 20 14 / 18%), rgb(28 20 14 / 55%)); color: inherit; cursor: pointer; }
.cf-tap b { min-width: 4.6rem; min-height: 2.4rem; display: grid; place-items: center; border: 2px solid #f6efe6; background: rgb(28 20 14 / 72%); font-family: var(--disp); font-weight: 800; letter-spacing: .08em; }
.cf-mute { position: absolute; z-index: 3; top: 10px; inset-inline-end: 10px; min-height: 32px; padding: 2px 10px; border: 2px solid #f6efe6; background: #1c140e; color: #f6efe6; font: inherit; font-size: .75rem; cursor: pointer; }
.cf-note { padding: 18px 18px 16px; display: grid; align-content: center; gap: 8px; }
.cf-note .no { font-family: var(--disp); font-weight: 800; letter-spacing: .16em; color: var(--amber); font-size: .78rem; }
.cf-note h3 { margin: 0; font-family: var(--disp); font-weight: 800; font-size: 1.15rem; }
.cf-note p { margin: 0; color: var(--mute); font-size: .92rem; }
.cf-note cite { font-style: normal; font-size: .8rem; }
.cf-cup .cf-actions { margin-top: 22px; }
@container (max-width: 760px) {
  .cf-ticket { grid-template-columns: 28px 1fr; }
  .cf-note { grid-column: 1 / -1; border-block-start: 2px solid var(--line); }
  .cf-frame { min-height: 200px; }
}
`, _CupReels = class _CupReels extends LitElement {
  constructor() {
    super(...arguments), this.live = -1, this.sound = !1, this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("cf-host"), injectFonts(), injectStyles("cf-base", baseCss), injectStyles("cf-cup-reels", css), this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  updated() {
    var _a;
    const box = (_a = this.querySelector(".cf-mute")) == null ? void 0 : _a.closest(".cf-frame"), video = box == null ? void 0 : box.querySelector("video");
    video instanceof HTMLVideoElement && (video.muted = !this.sound);
    const frame = box == null ? void 0 : box.querySelector("iframe");
    frame instanceof HTMLIFrameElement && setFrameSound(frame, this.sound);
  }
  cups(cfg) {
    return getCollectionItems(cfg.items, "items").map((item) => ({
      source: clipUrl(item.video_url),
      poster: clipUrl(item.poster),
      name: localizedString(item.name),
      place: localizedString(item.place),
      note: localizedString(item.note)
    })).filter((item) => item.name || item.source || item.poster);
  }
  render() {
    const cfg = getConfig(this.config), cups = this.cups(cfg);
    return html`<section id="cf-cups" class=${`cf-root cf-sec cf-cup ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "tastings"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${localizedString(cfg.text) ? html`<p class="cf-lead">${localizedString(cfg.text)}</p>` : nothing}
        ${cups.length ? html`<div class="cf-sheet">
          ${cups.map((cup, index) => {
      const on = this.live === index, file = cup.source && isFileClip(cup.source);
      return html`<article class="cf-ticket">
              <div class="cf-sprocket" aria-hidden="true"></div>
              <div class="cf-frame">
                ${on && cup.source ? file ? html`<video src=${cup.source} poster=${cup.poster} autoplay muted playsinline loop controls></video>` : html`<iframe src=${frameSrc(cup.source)} title=${cup.name} allow="autoplay; encrypted-media"></iframe>` : cup.poster ? html`<img src=${cup.poster} alt="">` : nothing}
                ${on ? html`<button type="button" class="cf-mute" @click=${() => {
        this.sound = !this.sound;
      }}>${this.sound ? t({ ar: "كتم", en: "Mute" }) : t({ ar: "صوت", en: "Sound" })}</button>` : html`<button type="button" class="cf-tap" @click=${() => {
        this.live = index, this.sound = !1;
      }}><b>${t({ ar: "تذوق", en: "Taste" })}</b></button>`}
              </div>
              <div class="cf-note">
                <span class="no">${String(index + 1).padStart(2, "0")}</span>
                ${cup.name ? html`<h3>${cup.name}</h3>` : nothing}
                ${cup.note ? html`<p>${cup.note}</p>` : nothing}
                ${cup.place ? html`<cite>${cup.place}</cite>` : nothing}
              </div>
            </article>`;
    })}
        </div>` : html`<p class="cf-empty">${t({ ar: "أضف تجارب التذوق من إعدادات القسم", en: "Add tasting clips in the section settings" })}</p>`}
        <div class="cf-actions">${renderCta(cfg.button_label, "#cf-order")}</div>
      </div>
    </section>`;
  }
};
__name(_CupReels, "CupReels");
let CupReels = _CupReels;
__decorateClass([
  property({ type: Object })
], CupReels.prototype, "config");
__decorateClass([
  state()
], CupReels.prototype, "live");
__decorateClass([
  state()
], CupReels.prototype, "sound");
typeof CupReels < "u" && CupReels.registerSallaComponent("salla-cup-reels");
export {
  CupReels as default
};
