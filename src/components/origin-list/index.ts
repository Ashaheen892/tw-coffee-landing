import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { setBrew } from "../../utils/brew.js";
import { amount, digits, getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-orig { margin-top: 28px; border-block-start: 2px solid var(--line); }
.cf-orig button { display: grid; grid-template-columns: auto 1fr auto auto; gap: 14px; align-items: center; width: 100%; text-align: start; padding-block: 18px; border: 0; border-block-end: 2px solid var(--line); background: transparent; color: inherit; cursor: pointer; }
.cf-orig button:hover { padding-inline-start: 12px; background: color-mix(in srgb, var(--amber) 8%, transparent); }
.cf-orig button[aria-pressed="true"] { padding-inline-start: 12px; background: color-mix(in srgb, var(--rust) 16%, transparent); border-block-end-color: var(--rust); }
.cf-orig .n { font-variant-numeric: tabular-nums; font-size: .76rem; color: var(--mute); width: 28px; }
.cf-orig .nm { font-family: var(--disp); font-weight: 800; font-size: clamp(1.05rem, 2.4vw, 1.4rem); }
.cf-orig .nt { display: block; font-size: .82rem; color: var(--mute); font-weight: 300; }
.cf-orig .sc { font-variant-numeric: tabular-nums; font-family: var(--disp); font-weight: 800; color: var(--amber); }
.cf-orig .pr { font-variant-numeric: tabular-nums; font-size: .86rem; white-space: nowrap; }
.cf-ocard { margin-top: 22px; border: 2px solid var(--line); padding: 22px; display: grid; gap: 12px; }
.cf-ocard h3 { font-size: 1.15rem; }
.cf-ocard p { color: var(--mute); font-size: .92rem; }
.cf-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cf-chips span { border: 2px solid var(--line-2); padding: 5px 12px; font-size: .76rem; color: var(--crema); }
@container (max-width: 680px) {
  .cf-orig button { grid-template-columns: auto 1fr; }
  .cf-orig .sc, .cf-orig .pr { grid-column: 2; }
}
`;

type Origin = { name: string; note: string; score: string; priceLabel: string; price: number; story: string; chips: string[] };

export default class OriginList extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private index = 0;
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-origin-list", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected updated() {
    const current = this.rows()[this.index];
    if (!current) return;
    setBrew({ origin: current.name, price: current.price });
  }

  private rows(): Origin[] {
    const cfg = getConfig(this.config);
    return getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        name: localizedString(item.name),
        note: localizedString(item.note),
        score: localizedString(item.score),
        priceLabel: localizedString(item.price_label),
        price: amount(item.price),
        story: localizedString(item.story),
        chips: localizedString(item.chips).split(/[,،]/).map((part) => part.trim()).filter(Boolean),
      }))
      .filter((item) => item.name);
  }

  render() {
    const cfg = getConfig(this.config);
    const items = this.rows();
    const current = items[Math.min(this.index, Math.max(items.length - 1, 0))];
    return html`<section id="cf-origin" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "origins"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${localizedString(cfg.text) ? html`<p class="cf-lead">${localizedString(cfg.text)}</p>` : nothing}
        ${items.length ? html`<div class="cf-orig" role="group" aria-label=${localizedString(cfg.title) || "origins"}>
          ${items.map((item, i) => html`<button type="button" aria-pressed=${i === this.index ? "true" : "false"} @click=${() => { this.index = i; }}>
            <span class="n">${digits(String(i + 1).padStart(2, "0"))}</span>
            <span><span class="nm">${item.name}</span>${item.note ? html`<span class="nt">${item.note}</span>` : nothing}</span>
            ${item.score ? html`<span class="sc">${item.score}</span>` : html`<span></span>`}
            ${item.priceLabel ? html`<span class="pr">${item.priceLabel}</span>` : html`<span></span>`}
          </button>`)}
        </div>
        ${current ? html`<div class="cf-ocard" aria-live="polite">
          <h3>${current.name}</h3>
          ${current.story ? html`<p>${current.story}</p>` : nothing}
          ${current.chips.length ? html`<div class="cf-chips">${current.chips.map((chip) => html`<span>${chip}</span>`)}</div>` : nothing}
          ${localizedString(cfg.button_label) ? html`<div class="cf-actions"><a class="cf-btn" href="#cf-order">${localizedString(cfg.button_label)}</a></div>` : nothing}
        </div>` : nothing}` : html`<p class="cf-empty">${t({ ar: "أضف المناشئ من إعدادات القسم", en: "Add origins in the section settings" })}</p>`}
      </div>
    </section>`;
  }
}
