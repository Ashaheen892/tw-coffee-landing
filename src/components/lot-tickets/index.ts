import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-brands { display: grid; gap: 14px; margin-top: 22px; }
@container (min-width: 640px) { .cf-brands { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 980px) { .cf-brands { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.cf-brand { --notch: 11px; position: relative; display: grid; grid-template-columns: 3.4rem 1fr; align-items: center; min-height: 6.4rem; color: inherit; text-decoration: none; background: var(--amber); color: var(--bg); clip-path: polygon(0 0, 100% 0, 100% calc(50% - var(--notch)), calc(100% - var(--notch)) 50%, 100% calc(50% + var(--notch)), 100% 100%, 0 100%, 0 calc(50% + var(--notch)), var(--notch) 50%, 0 calc(50% - var(--notch))); }
.cf-brand:nth-child(even) { background: var(--crema); }
.cf-brand i { align-self: stretch; display: grid; place-items: center; border-inline-end: 2px dashed color-mix(in srgb, var(--bg) 55%, transparent); align-content: center; gap: 2px; font-style: normal; font-weight: 900; font-size: 1.25rem; line-height: 1; font-variant-numeric: tabular-nums; }
.cf-brand i small { font-size: .62rem; font-weight: 700; letter-spacing: .1em; opacity: .8; }
.cf-brand div { display: grid; gap: 4px; padding: 14px 18px; }
.cf-brand img { height: 30px; width: auto; max-width: 80%; object-fit: contain; }
.cf-brand b { font-family: var(--disp); font-weight: 900; font-size: 1.15rem; }
.cf-brand small { font-size: .78rem; letter-spacing: .08em; opacity: .82; }
a.cf-brand:hover { filter: brightness(1.06); }
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
    const inner = (item: { name: string; note: string; image: string }, index: number) => html`<i aria-hidden="true"><small>${t({ ar: "دفعة", en: "LOT" })}</small>${String(index + 1).padStart(2, "0")}</i><div>${item.image ? html`<img src=${item.image} alt="" />` : nothing}<b>${item.name}</b>${item.note ? html`<small>${item.note}</small>` : nothing}</div>`;
    return html`<section id="cf-brands" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "brands"}>
      <div class="cf-wrap">
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${items.length
          ? html`<div class="cf-brands">${items.map((item, index) => item.url ? html`<a class="cf-brand" href=${item.url}>${inner(item, index)}</a>` : html`<article class="cf-brand">${inner(item, index)}</article>`)}</div>`
          : html`<p class="cf-empty">${t({ ar: "أضف الماركات من الإعدادات", en: "Add the brands in the settings" })}</p>`}
      </div>
    </section>`;
  }
}
