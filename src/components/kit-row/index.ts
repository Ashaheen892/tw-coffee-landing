import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-kit { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); margin-top: 28px; border-block-start: 2px solid var(--line); }
.cf-kit article { padding: 22px 20px 22px 0; border-block-end: 2px solid var(--line); border-inline-end: 2px solid var(--line); }
.cf-kit .mark { display: block; margin-bottom: 8px; font-size: 1.5rem; }
.cf-kit b { display: block; font-family: var(--disp); font-weight: 800; font-size: 1.02rem; }
.cf-kit p { margin-top: 6px; font-size: .86rem; color: var(--mute); }
.cf-kit em { display: block; margin-top: 10px; font-style: normal; font-size: .86rem; color: var(--crema); font-variant-numeric: tabular-nums; }
`;

export default class KitRow extends LitElement {
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
    injectStyles("cf-kit-row", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        mark: localizedString(item.mark),
        title: localizedString(item.title),
        text: localizedString(item.text),
        price: localizedString(item.price),
      }))
      .filter((item) => item.title);
    return html`<section id="cf-kit" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "kit"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${localizedString(cfg.text) ? html`<p class="cf-lead">${localizedString(cfg.text)}</p>` : nothing}
        ${items.length ? html`<div class="cf-kit">
          ${items.map((item) => html`<article>
            ${item.mark ? html`<span class="mark" aria-hidden="true">${item.mark}</span>` : nothing}
            <b>${item.title}</b>
            ${item.text ? html`<p>${item.text}</p>` : nothing}
            ${item.price ? html`<em>${item.price}</em>` : nothing}
          </article>`)}
        </div>
        ${localizedString(cfg.button_label) ? html`<div class="cf-actions"><a class="cf-btn" href="#cf-order">${localizedString(cfg.button_label)}</a></div>` : nothing}` : html`<p class="cf-empty">${t({ ar: "أضف قطع العدّة من الإعدادات", en: "Add kit pieces in the settings" })}</p>`}
      </div>
    </section>`;
  }
}
