import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { countUp } from "../../utils/count.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-stats { display: grid; gap: 14px; }
@container (min-width: 800px) { .cf-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.cf-stat { padding: 18px 16px 16px; border: 2px solid var(--line); border-inline-start: 8px solid var(--amber); }
.cf-stat b { display: block; font-size: clamp(2.2rem, 4vw, 3.3rem); font-weight: 900; line-height: .9; color: transparent; -webkit-text-stroke: 1.5px var(--ink); }
.cf-stat span { display: block; margin-top: 10px; color: var(--mute); }
`;

export default class StatStrip extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  private stop = () => {};
  private stopCount = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-stat-strip", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    this.stopCount();
    super.disconnectedCallback();
  }

  protected updated() {
    const cfg = getConfig(this.config);
    const on = cfg.count_up === undefined || cfg.count_up === "" || flag(cfg.count_up);
    if (!on) return;
    this.stopCount();
    this.stopCount = countUp(this, ".cf-stat b");
  }

  render() {
    const cfg = getConfig(this.config);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) }))
      .filter((item) => item.value);
    return html`<section id="cf-stats" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "stats"}>
      <div class="cf-wrap">
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : ""}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : ""}
        ${items.length
          ? html`<div class="cf-stats">${items.map((item) => html`<article class="cf-stat"><b .textContent=${item.value}></b><span>${item.label}</span></article>`)}</div>`
          : html`<p class="cf-empty">${t({ ar: "أضف الأرقام من الإعدادات", en: "Add the numbers in the settings" })}</p>`}
      </div>
    </section>`;
  }
}
