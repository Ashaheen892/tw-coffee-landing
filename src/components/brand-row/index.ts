import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-brands { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 22px; }
@container (min-width: 800px) { .cf-brands { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.cf-brand { display: grid; place-items: center; gap: 8px; min-height: 7.2rem; padding: 16px 10px; border: 2px solid var(--ink); color: inherit; text-decoration: none; text-align: center; background: var(--card, transparent); }
.cf-brand img { height: 42px; width: auto; max-width: 78%; object-fit: contain; }
.cf-brand b { font-weight: 800; }
.cf-brand small { color: var(--mute); }
`;

export default class BrandRow extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-brand-row", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({ name: localizedString(item.name), note: localizedString(item.note), image: String(item.image || "").trim(), url: String(item.url || "").trim() }))
      .filter((item) => item.name);
    const inner = (item: { name: string; note: string; image: string }) => html`${item.image ? html`<img src=${item.image} alt="" />` : nothing}<b>${item.name}</b>${item.note ? html`<small>${item.note}</small>` : nothing}`;
    return html`<section id="cf-brands" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "brands"}>
      <div class="cf-wrap">
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${items.length
          ? html`<div class="cf-brands">${items.map((item) => item.url ? html`<a class="cf-brand" href=${item.url}>${inner(item)}</a>` : html`<article class="cf-brand">${inner(item)}</article>`)}</div>`
          : html`<p class="cf-empty">${t({ ar: "أضف الماركات من الإعدادات", en: "Add the brands in the settings" })}</p>`}
      </div>
    </section>`;
  }
}
