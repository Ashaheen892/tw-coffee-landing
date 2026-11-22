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
const COPIES = 12, ROTATE_MS = 4200, ANN_THUMB = {
  tile: { w: 28, h: 28 },
  bean: { w: 28, h: 28 },
  arch: { w: 24, h: 30 },
  slant: { w: 40, h: 26 }
}, lookCss = /* @__PURE__ */ __name((p, look) => {
  const box = ANN_THUMB[look], size = `.${p}-ann__media { width: ${box.w}px; height: ${box.h}px; }`;
  return look === "bean" ? `${size}
.${p}-ann__media { border-radius: 50%; box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 30%, transparent); }
.${p}-ann__item .${p}-ann__text::after { width: .55rem; height: .32rem; border-radius: 50%; transform: rotate(-35deg); box-shadow: inset 1px 0 0 color-mix(in srgb, var(--ann-fill) 70%, transparent); }
.${p}-anns.is-stack > .${p}-ann + .${p}-ann { box-shadow: none; background-image: linear-gradient(90deg, color-mix(in srgb, currentColor 35%, transparent) 50%, transparent 0); background-size: 10px 1px; background-repeat: repeat-x; }` : look === "arch" ? `${size}
.${p}-ann__media { border-radius: 999px 999px 3px 3px; outline: 1px solid color-mix(in srgb, currentColor 45%, transparent); outline-offset: 2px; }
.${p}-ann__label { letter-spacing: .02em; }
.${p}-ann__item .${p}-ann__text::after { width: .38rem; height: .38rem; border-radius: 0; transform: rotate(45deg); opacity: .7; }` : look === "slant" ? `${size}
.${p}-ann__media { border-radius: 0; clip-path: polygon(16% 0, 100% 0, 84% 100%, 0 100%); }
.${p}-ann__label { font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: .03em; }
.${p}-ann__item .${p}-ann__text::after { content: "/"; width: auto; height: auto; border-radius: 0; background: none; font-weight: 900; font-style: normal; opacity: .6; }` : `${size}
.${p}-ann__media { border-radius: 7px; }`;
}, "lookCss");
function announceCss(prefix, look = "tile") {
  const p = prefix;
  return `
.${p}-ann.${p}-ann {
  --ann-fill: var(--ann-bg-light, var(--ann-bg, var(--color-primary)));
  --ann-text: var(--ann-ink-light, var(--ann-ink, var(--color-primary-reverse, #fff)));
  overflow: hidden;
  padding-block: 5px;
  border: 0;
  font-family: var(--font-main, inherit);
  background: var(--ann-fill);
  color: var(--ann-text);
}
html.${p}-mode-dark .${p}-ann.${p}-auto, .${p}-ann.${p}-dark {
  --ann-fill: var(--ann-bg-dark, var(--ann-bg-light, var(--ann-bg, var(--color-primary))));
  --ann-text: var(--ann-ink-dark, var(--ann-ink-light, var(--ann-ink, var(--color-primary-reverse, #fff))));
}
.${p}-ann__still {
  display: flex;
  justify-content: center;
  padding: 5px 1.5rem;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  line-height: 26px;
}
.${p}-ann__list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 5px 0;
  list-style: none;
  white-space: nowrap;
}
.${p}-ann__item {
  flex: none;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  line-height: 26px;
  animation: ${p}-ann-ltr var(--ann-speed, 18s) linear infinite;
}
.${p}-ann.is-rtl .${p}-ann__item { animation-name: ${p}-ann-rtl; }
.${p}-ann.is-back .${p}-ann__item { animation-name: ${p}-ann-ltr-back; }
.${p}-ann.is-rtl.is-back .${p}-ann__item { animation-name: ${p}-ann-rtl-back; }
.${p}-ann__list:hover .${p}-ann__item { animation-play-state: paused; }
.${p}-ann__text {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  padding-inline: 1.5rem;
}
.${p}-ann__item .${p}-ann__text::after {
  content: "";
  width: .35rem;
  height: .35rem;
  margin-inline-start: .9rem;
  border-radius: 50%;
  background: currentColor;
  opacity: .55;
  flex: none;
}
.${p}-ann__still .${p}-ann__text { padding-inline: 0; }
.${p}-ann__link { display: inline-flex; align-items: center; gap: .6rem; color: inherit; text-decoration: none; }
.${p}-ann__link:hover .${p}-ann__label { text-decoration: underline; text-underline-offset: 3px; }
.${p}-ann__link:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.${p}-ann__media {
  flex: none;
  display: inline-grid;
  place-items: center;
  overflow: hidden;
  background: color-mix(in srgb, currentColor 16%, transparent);
}
.${p}-ann__media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${p}-ann__media i { font-size: 15px; line-height: 1; }
.${p}-ann__media.is-hint {
  width: auto;
  padding-inline: .45rem;
  border: 1px dashed currentColor;
  background: color-mix(in srgb, currentColor 10%, transparent);
  clip-path: none;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  direction: ltr;
}
.${p}-anns { display: grid; }
.${p}-anns.is-stack > .${p}-ann + .${p}-ann { box-shadow: inset 0 1px 0 color-mix(in srgb, currentColor 18%, transparent); }
.${p}-anns.is-stack > .${p}-ann:nth-child(even):not(.is-own) { background-color: color-mix(in srgb, var(--ann-fill) 84%, #000); }
.${p}-anns.is-rotate > .${p}-ann { grid-area: 1 / 1; opacity: 0; visibility: hidden; transition: opacity .45s ease, visibility 0s linear .45s; }
.${p}-anns.is-rotate > .${p}-ann.is-on { opacity: 1; visibility: visible; transition: opacity .45s ease; }
@keyframes ${p}-ann-ltr { to { transform: translateX(-100%); } }
@keyframes ${p}-ann-rtl { to { transform: translateX(100%); } }
@keyframes ${p}-ann-ltr-back { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes ${p}-ann-rtl-back { from { transform: translateX(100%); } to { transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) {
  .${p}-ann .${p}-ann__item { animation: none !important; }
  .${p}-ann__item[aria-hidden="true"] { display: none; }
  .${p}-ann__list { justify-content: center; }
  .${p}-ann__item .${p}-ann__text::after { display: none; }
  .${p}-anns.is-rotate > .${p}-ann { transition: none; }
}
${lookCss(p, look)}
`;
}
__name(announceCss, "announceCss");
function announceTone(cfg) {
  const paint = /* @__PURE__ */ __name((key, variable) => {
    const value = String(cfg[key] || "").trim();
    return value ? `${variable}:${value}` : "";
  }, "paint");
  return [
    paint("announce_bg", "--ann-bg-light"),
    paint("announce_ink", "--ann-ink-light"),
    paint("announce_bg_dark", "--ann-bg-dark"),
    paint("announce_ink_dark", "--ann-ink-dark")
  ].filter(Boolean).join(";");
}
__name(announceTone, "announceTone");
function marquee(prefix, extraClass, style, body, own = !1, go = "") {
  const rtl = isRtl();
  return html`<div class="${prefix}-ann${rtl ? " is-rtl" : ""}${go === (rtl ? "left" : "right") ? " is-back" : ""}${own ? " is-own" : ""} ${extraClass}" style=${style}>
    <ul class="${prefix}-ann__list">
      ${Array.from({ length: COPIES }, (_, index) => html`<li class="${prefix}-ann__item" aria-hidden=${index ? "true" : "false"}><span class="${prefix}-ann__text">${body}</span></li>`)}
    </ul>
  </div>`;
}
__name(marquee, "marquee");
function readStrips(cfg) {
  if (!Array.isArray(cfg.bars)) {
    const text = localizedString(cfg.announce).trim();
    return text ? [{ text, media: "none", icon: "", image: "", link: "", still: String(unwrapValue(cfg.announce_mode) || "move") === "still", go: "", bg: "", ink: "" }] : [];
  }
  return getCollectionItems(cfg.bars, "bars").map((row) => {
    const kind = String(unwrapValue(row.media) || "none"), motion = String(unwrapValue(row.motion) || "right");
    return {
      text: localizedString(row.text).trim(),
      media: kind === "icon" || kind === "image" ? kind : "none",
      icon: String(unwrapValue(row.icon) || "").trim(),
      image: String(unwrapValue(row.image) || "").trim(),
      link: linkHref(row.link),
      still: motion === "still",
      go: motion === "left" || motion === "right" ? motion : "",
      bg: String(row.bg || "").trim(),
      ink: String(row.ink || "").trim()
    };
  }).filter((row) => row.text);
}
__name(readStrips, "readStrips");
function stripBody(prefix, look, row) {
  const box = ANN_THUMB[look];
  let media = nothing;
  row.media === "icon" && row.icon ? media = html`<span class="${prefix}-ann__media is-icon" aria-hidden="true"><i class=${row.icon}></i></span>` : row.media === "image" && row.image ? media = html`<span class="${prefix}-ann__media"><img src=${row.image} alt="" width=${box.w * 2} height=${box.h * 2} loading="lazy" decoding="async" /></span>` : row.media === "image" && (media = html`<span class="${prefix}-ann__media is-hint ${prefix}-hint" aria-hidden="true">${box.w * 4}×${box.h * 4}</span>`);
  const inner = html`${media}<span class="${prefix}-ann__label">${row.text}</span>`;
  return row.link ? html`<a class="${prefix}-ann__link" href=${row.link}>${inner}</a>` : inner;
}
__name(stripBody, "stripBody");
function announceStrips(cfg, prefix, look, extraClass = "", tone = "") {
  const rows = readStrips(cfg);
  if (!rows.length) return nothing;
  const rotate = rows.length > 1 && String(unwrapValue(cfg.bars_layout) || "stack") === "rotate", strips = rows.map((row, index) => {
    const own = !!(row.bg || row.ink), style = [row.bg ? `--ann-fill:${row.bg}` : "", row.ink ? `--ann-text:${row.ink}` : ""].filter(Boolean).join(";"), body = stripBody(prefix, look, row);
    return row.still || rotate ? html`<div class="${prefix}-ann ${prefix}-ann__still${own ? " is-own" : ""}${rotate && index === 0 ? " is-on" : ""} ${extraClass}" style=${style} aria-hidden=${rotate && index ? "true" : "false"}><span class="${prefix}-ann__text">${body}</span></div>` : marquee(prefix, extraClass, style, body, own, row.go);
  });
  return html`<div class="${prefix}-anns ${rotate ? "is-rotate" : "is-stack"}" style=${tone} data-ann-rotate=${rotate ? String(rows.length) : "0"} role="region" aria-label=${isRtl() ? "إعلانات المتجر" : "Store announcements"}>${strips}</div>`;
}
__name(announceStrips, "announceStrips");
const timers = /* @__PURE__ */ new WeakMap();
function rotateStrips(root, prefix) {
  root.querySelectorAll(`.${prefix}-anns`).forEach((group) => {
    const count = Number(group.dataset.annRotate || 0), running = timers.get(group);
    if (running && running.count === count || (running && window.clearInterval(running.id), timers.delete(group), count < 2)) return;
    let index = 0;
    if (!group.dataset.annHold) {
      group.dataset.annHold = "0";
      const hold = /* @__PURE__ */ __name((on) => () => {
        group.dataset.annHold = on ? "1" : "0";
      }, "hold");
      group.addEventListener("mouseenter", hold(!0)), group.addEventListener("mouseleave", hold(!1)), group.addEventListener("focusin", hold(!0)), group.addEventListener("focusout", hold(!1));
    }
    const id = window.setInterval(() => {
      if (group.dataset.annHold === "1" || document.hidden) return;
      const items = [...group.children];
      items.length && (index = (index + 1) % items.length, items.forEach((item, at) => {
        item.classList.toggle("is-on", at === index), item.setAttribute("aria-hidden", at === index ? "false" : "true");
      }));
    }, ROTATE_MS);
    timers.set(group, { id, count });
  });
}
__name(rotateStrips, "rotateStrips");
function stopStrips(root, prefix) {
  root.querySelectorAll(`.${prefix}-anns`).forEach((group) => {
    const running = timers.get(group);
    running && window.clearInterval(running.id), timers.delete(group);
  });
}
__name(stopStrips, "stopStrips");
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
    super.connectedCallback(), this.classList.add("cf-host"), injectFonts(), injectStyles("cf-base", baseCss), injectStyles("cf-announce", announceCss("cf", "bean")), injectStyles("cf-page-bar", css);
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
    stopStrips(this, "cf"), this.stop(), super.disconnectedCallback();
  }
  updated() {
    rotateStrips(this, "cf"), this.pin();
  }
  showMode(cfg) {
    return cfg.show_mode_toggle == null || cfg.show_mode_toggle === "" ? !0 : flag(cfg.show_mode_toggle);
  }
  kitFont(cfg) {
    return cfg.use_kit_font == null || cfg.use_kit_font === "" ? !1 : flag(cfg.use_kit_font);
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
    var _a, _b, _c;
    const cfg = getConfig(this.config), brand = localizedString(cfg.brand) || ((_c = (_b = (_a = window.Salla) == null ? void 0 : _a.config) == null ? void 0 : _b.get) == null ? void 0 : _c.call(_b, "store.name")) || "", mark = localizedString(cfg.mark), links = getCollectionItems(cfg.links, "links").map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" })).filter((item) => item.label), logo = this.dark && cfg.logo_dark || cfg.logo;
    return html`${announceStrips(cfg, "cf", "bean", `cf-root ${schemeOf(cfg)}`, announceTone(cfg))}
    <header class=${`cf-root cf-bar ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
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
typeof PageBar < "u" && PageBar.registerSallaComponent("salla-roast-bar");
export {
  PageBar as default
};
