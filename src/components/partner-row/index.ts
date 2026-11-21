import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-partners { margin-top: 18px; border-block-start: 2px solid var(--line); }
.cf-partner { display: grid; grid-template-columns: 4.5rem 1fr; gap: 12px; align-items: baseline; padding: 16px 0; border-block-end: 2px solid var(--line); }
.cf-partner i { font-style: normal; font-weight: 800; color: var(--amber); }
.cf-partner b { display: block; font-weight: 800; }
.cf-partner span { display: block; color: var(--mute); }
`;

export default class PartnerRow extends LitElement {
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
    injectStyles("cf-partner-row", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({ mark: localizedString(item.mark), name: localizedString(item.name), note: localizedString(item.note) }))
      .filter((item) => item.name);
    return html`<section id="cf-partners" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "partners"}>
      <div class="cf-wrap">
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${items.length
          ? html`<div class="cf-partners">${items.map((item) => html`<article class="cf-partner"><i>${item.mark}</i><div><b>${item.name}</b>${item.note ? html`<span>${item.note}</span>` : nothing}</div></article>`)}</div>`
          : html`<p class="cf-empty">${t({ ar: "أضف الشركاء من الإعدادات", en: "Add the partners in the settings" })}</p>`}
      </div>
    </section>`;
  }
}
