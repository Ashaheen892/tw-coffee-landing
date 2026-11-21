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
function unwrapValue(value) {
  var _a;
  return Array.isArray(value) ? unwrapValue(((_a = value[0]) == null ? void 0 : _a.value) ?? value[0] ?? "") : value && typeof value == "object" && "value" in value ? value.value : value ?? "";
}
__name(unwrapValue, "unwrapValue");
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
.cf-calc { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 28px; }
.cf-fld { margin-bottom: 20px; }
.cf-fld > span { display: block; margin-bottom: 9px; font-size: .74rem; letter-spacing: .12em; color: var(--mute); font-weight: 600; }
.cf-pills { display: flex; flex-wrap: wrap; gap: 7px; }
.cf-pill { border: 2px solid var(--line-2); padding: 8px 14px; background: transparent; color: inherit; cursor: pointer; font-size: .82rem; }
.cf-pill[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); font-weight: 600; }
.cf-rng { display: flex; align-items: center; gap: 12px; }
.cf-rng input { flex: 1; -webkit-appearance: none; appearance: none; height: 4px; background: var(--line-2); }
.cf-rng input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: var(--amber); border-radius: 50%; }
.cf-rng input::-moz-range-thumb { width: 18px; height: 18px; background: var(--amber); border-radius: 50%; border: 0; }
.cf-rng output { min-width: 72px; font-family: var(--disp); font-weight: 800; font-size: 1.1rem; font-variant-numeric: tabular-nums; }
.cf-out { border: 2px solid var(--amber); padding: 24px; align-content: start; }
.cf-out .big { display: block; font-family: var(--disp); font-weight: 900; font-size: clamp(2.2rem, 6vw, 3.4rem); color: var(--amber); line-height: 1; }
.cf-out .bl { display: block; margin-bottom: 8px; font-size: .78rem; letter-spacing: .14em; color: var(--mute); }
.cf-out .r { display: flex; align-items: baseline; gap: 10px; padding-block: 11px; border-block-start: 2px solid var(--line); font-size: .86rem; }
.cf-out .r i { flex: 1; border-block-end: 1px dotted var(--line-2); transform: translateY(-5px); }
.cf-out .r b { font-family: var(--disp); font-variant-numeric: tabular-nums; }
.cf-hint { margin-top: 16px; font-size: .82rem; color: var(--mute); }
@container (max-width: 800px) { .cf-calc { grid-template-columns: 1fr; } }
`, METHODS = [
  { id: "v60", temp: 93, seconds: 150 },
  { id: "press", temp: 94, seconds: 240 },
  { id: "drip", temp: 92, seconds: 300 },
  { id: "espresso", temp: 92, seconds: 28 }
], _BrewCalc = class _BrewCalc extends LitElement {
  constructor() {
    super(...arguments), this.method = "v60", this.ratio = 16, this.dose = 20, this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("cf-host"), injectFonts(), injectStyles("cf-base", baseCss), injectStyles("cf-brew-calc", css), this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  copy(cfg, id, fallback) {
    return localizedString(cfg[id]) || fallback;
  }
  render() {
    const cfg = getConfig(this.config), method = METHODS.find((item) => item.id === this.method) || METHODS[0], espresso = method.id === "espresso", water = Math.round(espresso ? this.dose * 2 : this.dose * this.ratio), cups = Math.max(1, Math.round(water / 170)), bloom = this.dose * 2, minutes = Math.floor(method.seconds / 60), seconds = method.seconds % 60, time = espresso ? `${digits(method.seconds)} ${this.copy(cfg, "seconds_unit", "ثانية")}` : `${digits(minutes)}:${digits(String(seconds).padStart(2, "0"))} ${this.copy(cfg, "minutes_unit", "د")}`, methods = [
      ["v60", this.copy(cfg, "m_v60", "V60")],
      ["press", this.copy(cfg, "m_press", "فرنش برس")],
      ["drip", this.copy(cfg, "m_drip", "قطرة")],
      ["espresso", this.copy(cfg, "m_espresso", "إسبريسو")]
    ], ratios = [14, 16, 18], ratioNames = [
      this.copy(cfg, "r_strong", "١:١٤ مركّز"),
      this.copy(cfg, "r_even", "١:١٦ متوازن"),
      this.copy(cfg, "r_light", "١:١٨ خفيف")
    ];
    return html`<section id="cf-brew" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "brew"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        <div class="cf-calc">
          <div>
            <div class="cf-fld">
              <span>${this.copy(cfg, "method_label", "الطريقة")}</span>
              <div class="cf-pills" role="group">
                ${methods.map(([id, label]) => html`<button type="button" class="cf-pill" aria-pressed=${this.method === id ? "true" : "false"} @click=${() => {
      this.method = id;
    }}>${label}</button>`)}
              </div>
            </div>
            <div class="cf-fld">
              <span>${this.copy(cfg, "ratio_label", "النسبة")}</span>
              <div class="cf-pills" role="group">
                ${ratios.map((value, i) => html`<button type="button" class="cf-pill" aria-pressed=${this.ratio === value ? "true" : "false"} ?disabled=${espresso} @click=${() => {
      this.ratio = value;
    }}>${ratioNames[i]}</button>`)}
              </div>
            </div>
            <div class="cf-fld">
              <span>${this.copy(cfg, "dose_label", "وزن القهوة")}</span>
              <div class="cf-rng">
                <input type="range" min=${Number(unwrapValue(cfg.dose_min) || 12)} max=${Number(unwrapValue(cfg.dose_max) || 40)} step="1" .value=${String(this.dose)} aria-label=${this.copy(cfg, "dose_label", "وزن القهوة")} @input=${(event) => {
      this.dose = Number(event.target.value);
    }} />
                <output>${digits(this.dose)} ${this.copy(cfg, "gram_unit", "غ")}</output>
              </div>
            </div>
            ${localizedString(cfg.hint) ? html`<p class="cf-hint">${localizedString(cfg.hint)}</p>` : nothing}
          </div>
          <div class="cf-out" aria-live="polite">
            <span class="bl">${this.copy(cfg, "water_label", "كمية الماء")}</span>
            <span class="big">${digits(water)} ${this.copy(cfg, "ml_unit", "مل")}</span>
            <div class="r"><span>${this.copy(cfg, "cups_label", "عدد الأكواب")}</span><i aria-hidden="true"></i><b>${digits(cups)}</b></div>
            <div class="r"><span>${this.copy(cfg, "bloom_label", "ماء الإزهار")}</span><i aria-hidden="true"></i><b>${espresso ? "—" : `${digits(bloom)} ${this.copy(cfg, "ml_unit", "مل")}`}</b></div>
            <div class="r"><span>${this.copy(cfg, "time_label", "الزمن المقترح")}</span><i aria-hidden="true"></i><b>${time}</b></div>
            <div class="r"><span>${this.copy(cfg, "temp_label", "درجة الماء")}</span><i aria-hidden="true"></i><b>${digits(method.temp)}°</b></div>
            ${localizedString(cfg.button_label) ? html`<div class="cf-actions"><a class="cf-btn" href="#cf-order">${localizedString(cfg.button_label)}</a></div>` : nothing}
          </div>
        </div>
      </div>
    </section>`;
  }
};
__name(_BrewCalc, "BrewCalc");
let BrewCalc = _BrewCalc;
__decorateClass([
  property({ type: Object })
], BrewCalc.prototype, "config");
__decorateClass([
  state()
], BrewCalc.prototype, "method");
__decorateClass([
  state()
], BrewCalc.prototype, "ratio");
__decorateClass([
  state()
], BrewCalc.prototype, "dose");
typeof BrewCalc < "u" && BrewCalc.registerSallaComponent("salla-brew-calc");
export {
  BrewCalc as default
};
