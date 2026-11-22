import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { brewState, roundToFive, watchBrew } from "../../utils/brew.js";
import { amount, digits, getCollectionItems, getConfig, linkHref, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-order { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 26px; }
.cf-fld { margin-bottom: 18px; }
.cf-fld > span { display: block; margin-bottom: 9px; font-size: .74rem; letter-spacing: .12em; color: var(--mute); font-weight: 600; }
.cf-pills { display: flex; flex-wrap: wrap; gap: 7px; }
.cf-pill { border: 2px solid var(--line-2); padding: 8px 14px; background: transparent; color: inherit; cursor: pointer; }
.cf-pill[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); font-weight: 600; }
.cf-sum { border: 2px solid var(--line); padding: 22px; }
.cf-sum .big { display: block; font-family: var(--disp); font-weight: 900; font-size: clamp(2rem, 6vw, 3.2rem); color: var(--amber); line-height: 1; }
.cf-sum .bl { display: block; margin-bottom: 8px; font-size: .78rem; letter-spacing: .14em; color: var(--mute); }
.cf-sum .r, .cf-facts .r { display: flex; align-items: baseline; gap: 10px; padding-block: 12px; border-block-start: 2px solid var(--line); font-size: .88rem; }
.cf-sum .r i, .cf-facts .r i { flex: 1; border-block-end: 1px dotted var(--line-2); transform: translateY(-5px); }
.cf-sum .r b, .cf-facts .r b { font-family: var(--disp); font-weight: 800; }
.cf-stack { display: grid; gap: 10px; margin-top: 16px; }
.cf-stack .cf-btn { width: 100%; }
.cf-pay { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 16px; }
.cf-pay span { border: 2px solid var(--line); padding: 6px 11px; font-size: .74rem; color: var(--crema); }
@container (max-width: 800px) { .cf-order { grid-template-columns: 1fr; } }
`;

export default class BagOrder extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private weight = 250;
  @state() private grind = "whole";
  @state() private brew = brewState();
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-bag-order", css);
    const stopLocale = watchLocale(this);
    const stopBrew = watchBrew(() => { this.brew = brewState(); });
    this.stop = () => {
      stopLocale();
      stopBrew();
    };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const base = this.brew.price || amount(cfg.fallback_price) || 85;
    const factors: Record<number, number> = {
      250: 1,
      500: Number(unwrapValue(cfg.factor_500) || 1.85),
      1000: Number(unwrapValue(cfg.factor_1000) || 3.4),
    };
    const total = roundToFive(base * (factors[this.weight] || 1));
    const old = roundToFive(total * 1.25);
    const origin = this.brew.origin || localizedString(cfg.fallback_origin);
    const roast = this.brew.roast || localizedString(cfg.fallback_roast);
    const currency = localizedString(cfg.currency) || t({ ar: "ر.س", en: "SAR" });
    const facts = getCollectionItems<Record<string, any>>(cfg.facts, "facts")
      .map((item) => ({ label: localizedString(item.label), value: localizedString(item.value) }))
      .filter((item) => item.label);
    const pays = getCollectionItems<Record<string, any>>(cfg.payments, "payments")
      .map((item) => localizedString(item.label))
      .filter(Boolean);
    const weights = [
      [250, localizedString(cfg.w_250) || "٢٥٠ غ"],
      [500, localizedString(cfg.w_500) || "٥٠٠ غ"],
      [1000, localizedString(cfg.w_1000) || "كيلو"],
    ] as const;
    const grinds = [
      ["whole", localizedString(cfg.g_whole) || t({ ar: "حبّ كامل", en: "Whole bean" })],
      ["ground", localizedString(cfg.g_ground) || t({ ar: "حسب طريقتي", en: "Ground for my brew" })],
    ] as const;
    const priceText = `${digits(total)} ${currency}`;
    return html`<section id="cf-order" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "order"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        <div class="cf-order">
          <div>
            <div class="cf-fld">
              <span>${localizedString(cfg.weight_label) || t({ ar: "حجم الكيس", en: "Bag size" })}</span>
              <div class="cf-pills" role="group">
                ${weights.map(([value, label]) => html`<button type="button" class="cf-pill" aria-pressed=${this.weight === value ? "true" : "false"} @click=${() => { this.weight = value; }}>${label}</button>`)}
              </div>
            </div>
            <div class="cf-fld">
              <span>${localizedString(cfg.grind_label) || t({ ar: "الطحن", en: "Grind" })}</span>
              <div class="cf-pills" role="group">
                ${grinds.map(([value, label]) => html`<button type="button" class="cf-pill" aria-pressed=${this.grind === value ? "true" : "false"} @click=${() => { this.grind = value; }}>${label}</button>`)}
              </div>
            </div>
            <div class="cf-sum" aria-live="polite">
              <span class="bl">${localizedString(cfg.total_label) || t({ ar: "الإجمالي", en: "Total" })}</span>
              <span class="big">${priceText}</span>
              <div class="r"><span>${t({ ar: "المنشأ", en: "Origin" })}</span><i aria-hidden="true"></i><b>${origin}</b></div>
              <div class="r"><span>${t({ ar: "الدرجة", en: "Roast" })}</span><i aria-hidden="true"></i><b>${roast}</b></div>
              <div class="r"><span>${localizedString(cfg.before_label) || t({ ar: "قبل الخصم", en: "Before discount" })}</span><i aria-hidden="true"></i><b>${digits(old)} ${currency}</b></div>
            </div>
            <div class="cf-stack">
              ${renderCta(cfg.button_label, linkHref(cfg.button_url))}
              ${localizedString(cfg.secondary_label) ? html`<a class="cf-btn ghost" href="#cf-plans">${localizedString(cfg.secondary_label)}</a>` : nothing}
            </div>
          </div>
          <div>
            <div class="cf-facts">
              ${facts.map((item) => html`<div class="r"><span>${item.label}</span><i aria-hidden="true"></i><b>${item.value}</b></div>`)}
            </div>
            ${pays.length ? html`<div class="cf-pay" aria-label=${t({ ar: "طرق الدفع", en: "Payment methods" })}>${pays.map((item) => html`<span>${item}</span>`)}</div>` : nothing}
          </div>
        </div>
      </div>
    </section>`;
  }
}
