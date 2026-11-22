import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-receipt { position: relative; max-width: 560px; margin: 26px auto 0; padding: 26px 26px 30px; background: var(--card); border: 2px solid var(--line); }
.cf-receipt::before, .cf-receipt::after { content: ""; position: absolute; inset-inline: -2px; height: 10px; background: radial-gradient(circle at 6px 0, transparent 5px, var(--card) 5.5px) 0 0 / 12px 10px repeat-x; }
.cf-receipt::before { top: -10px; transform: scaleY(-1); }
.cf-receipt::after { bottom: -10px; }
.cf-receipt header { display: flex; justify-content: space-between; gap: 10px; padding-bottom: 14px; margin-bottom: 6px; border-block-end: 2px dashed var(--line-2); font-size: .74rem; letter-spacing: .16em; color: var(--mute); }
.cf-partner { display: flex; align-items: baseline; gap: 10px; padding-block: 13px; border-block-end: 1px dotted var(--line-2); }
.cf-partner i { font-style: normal; font-weight: 800; color: var(--amber); font-variant-numeric: tabular-nums; min-width: 2ch; }
.cf-partner b { font-family: var(--disp); font-weight: 800; }
.cf-partner em { flex: 1; min-width: 1rem; border-block-end: 1px dotted var(--line-2); transform: translateY(-4px); }
.cf-partner span { color: var(--mute); font-size: .88rem; text-align: end; }
.cf-receipt footer { padding-top: 14px; text-align: center; font-size: .74rem; letter-spacing: .2em; color: var(--mute); }
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
          ? html`<div class="cf-receipt">
              ${localizedString(cfg.kicker) || localizedString(cfg.subtitle) ? html`<header><span>${localizedString(cfg.kicker)}</span><span>${localizedString(cfg.subtitle)}</span></header>` : nothing}
              ${items.map((item) => html`<article class="cf-partner">${item.mark ? html`<i>${item.mark}</i>` : nothing}<b>${item.name}</b><em aria-hidden="true"></em>${item.note ? html`<span>${item.note}</span>` : nothing}</article>`)}
              ${localizedString(cfg.note) ? html`<footer>${localizedString(cfg.note)}</footer>` : nothing}
            </div>`
          : html`<p class="cf-empty">${t({ ar: "أضف الشركاء من الإعدادات", en: "Add the partners in the settings" })}</p>`}
      </div>
    </section>`;
  }
}
