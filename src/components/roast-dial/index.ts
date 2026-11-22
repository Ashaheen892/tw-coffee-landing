import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { setBrew } from "../../utils/brew.js";
import { amount, digits, getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-scale { margin-top: 32px; }
.cf-scale input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 12px; background: linear-gradient(90deg, #d9b98c, #a85f1f, #6b3410, #3a1d08, #1d0f06); border: 0; }
.cf-scale input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 30px; background: var(--ink); border: 2px solid var(--bg); cursor: ew-resize; }
.cf-scale input[type="range"]::-moz-range-thumb { width: 22px; height: 30px; background: var(--ink); border: 2px solid var(--bg); cursor: ew-resize; }
.cf-ticks { display: flex; justify-content: space-between; gap: 8px; margin-top: 10px; font-size: .74rem; color: var(--mute); }
.cf-rout { display: grid; grid-template-columns: auto 1fr; gap: 24px; align-items: center; margin-top: 28px; border: 2px solid var(--line); padding: 22px; }
.cf-disc { width: 120px; aspect-ratio: 1; border-radius: 50%; background: var(--rc, #6b3410); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--ink) 18%, transparent), inset -10px -14px 30px rgba(0,0,0,.45); }
.cf-rout h3 { font-size: 1.35rem; }
.cf-rout .sub { margin: 6px 0 14px; font-size: .88rem; color: var(--mute); }
.cf-bars { display: grid; gap: 11px; }
.cf-meter b { display: flex; justify-content: space-between; font-size: .78rem; font-weight: 600; margin-bottom: 6px; }
.cf-meter b span { color: var(--amber); font-variant-numeric: tabular-nums; }
.cf-tr { height: 6px; background: var(--line); overflow: hidden; }
.cf-fl { display: block; height: 100%; width: 0; background: var(--amber); transition: width .45s; }
@container (max-width: 700px) { .cf-rout { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .cf-fl { transition: none; } }
`;

type Roast = { name: string; note: string; color: string; acid: number; body: number; sweet: number };

export default class RoastDial extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private index = 1;
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-roast-dial", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected updated() {
    const current = this.rows()[this.index];
    if (current) setBrew({ roast: current.name.replace(/^تحميص\s*/, "") });
  }

  private rows(): Roast[] {
    const cfg = getConfig(this.config);
    return getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        name: localizedString(item.name),
        note: localizedString(item.note),
        color: typeof item.color === "string" && item.color ? item.color : "#6b3410",
        acid: amount(item.acid),
        body: amount(item.body),
        sweet: amount(item.sweet),
      }))
      .filter((item) => item.name);
  }

  render() {
    const cfg = getConfig(this.config);
    const items = this.rows();
    const index = Math.min(this.index, Math.max(items.length - 1, 0));
    const current = items[index];
    const labels = [localizedString(cfg.acid_label) || t({ ar: "الحموضة", en: "Acidity" }), localizedString(cfg.body_label) || t({ ar: "القوام", en: "Body" }), localizedString(cfg.sweet_label) || t({ ar: "الحلاوة", en: "Sweetness" })];
    const values = current ? [current.acid, current.body, current.sweet] : [];
    return html`<section id="cf-roast" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "roast"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${localizedString(cfg.text) ? html`<p class="cf-lead">${localizedString(cfg.text)}</p>` : nothing}
        ${items.length && current ? html`<div class="cf-scale">
          <label class="cf-sr" for="cf-roast-range">${localizedString(cfg.title) || "roast"}</label>
          <input id="cf-roast-range" type="range" min="1" max=${items.length} step="1" .value=${String(index + 1)} @input=${(event: Event) => { this.index = Number((event.target as HTMLInputElement).value) - 1; }} />
          <div class="cf-ticks">${items.map((item) => html`<span>${item.name.replace(/^تحميص\s*/, "")}</span>`)}</div>
        </div>
        <div class="cf-rout">
          <div class="cf-disc" style=${`--rc:${current.color}`} aria-hidden="true"></div>
          <div>
            <h3>${current.name}</h3>
            ${current.note ? html`<p class="sub">${current.note}</p>` : nothing}
            <div class="cf-bars">
              ${labels.map((label, i) => html`<div class="cf-meter"><b>${label} <span>${digits(values[i])}٪</span></b><div class="cf-tr"><span class="cf-fl" style=${`width:${values[i]}%`}></span></div></div>`)}
            </div>
          </div>
        </div>` : html`<p class="cf-empty">${t({ ar: "أضف درجات التحميص من الإعدادات", en: "Add roast levels in the settings" })}</p>`}
      </div>
    </section>`;
  }
}
