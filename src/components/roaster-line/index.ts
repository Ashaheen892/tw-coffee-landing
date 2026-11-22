import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-quick { display: grid; margin-top: 22px; background: var(--rust); color: var(--on-rust); }
@container (min-width: 860px) { .cf-quick { grid-template-columns: 1.15fr repeat(3, minmax(0, 1fr)); } }
.cf-quick p { margin: 0; padding: 22px; }
.cf-quick a { display: block; padding: 22px; border-block-start: 2px solid rgb(255 255 255 / 28%); color: inherit; text-decoration: none; font-weight: 800; }
@container (min-width: 860px) {
  .cf-quick a { border-block-start: 0; border-inline-start: 2px solid rgb(255 255 255 / 28%); }
}
.cf-quick small { display: block; font-weight: 600; opacity: .8; }
.cf-quick b { display: block; margin-top: 6px; font-size: 1.05rem; }
`;

function telHref(value: unknown): string {
  const raw = (typeof value === "string" ? value : localizedString(value)).trim();
  const num = raw.replace(/\D/g, "");
  if (!num) return "";
  if (raw.startsWith("+")) return `tel:+${num}`;
  if (num.startsWith("00")) return `tel:+${num.slice(2)}`;
  return `tel:${num}`;
}

function digits(value: unknown): string {
  const raw = typeof value === "string" ? value : localizedString(value);
  return raw.replace(/\D/g, "");
}

export default class QuickContact extends LitElement {
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
    injectStyles("cf-quick-contact", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const phone = digits(cfg.phone);
    const wa = digits(cfg.whatsapp || "201153958512");
    const email = String(cfg.email || "").trim();
    const message = localizedString(cfg.whatsapp_message);
    const note = localizedString(cfg.text);
    const actions = [
      phone ? { kicker: localizedString(cfg.phone_label) || t({ ar: "اتصال", en: "Call" }), value: localizedString(cfg.phone_text) || phone, href: telHref(cfg.phone) } : null,
      wa ? { kicker: localizedString(cfg.whatsapp_label) || t({ ar: "واتساب", en: "WhatsApp" }), value: localizedString(cfg.whatsapp_text) || t({ ar: "واتساب", en: "WhatsApp" }), href: `https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ""}` } : null,
      email.includes("@") ? { kicker: localizedString(cfg.email_label) || t({ ar: "البريد", en: "Email" }), value: email, href: `mailto:${email}` } : null,
    ].filter((item) => item) as { kicker: string; value: string; href: string }[];
    return html`<section id="cf-contact" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "contact"}>
      <div class="cf-wrap">
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${actions.length ? html`<div class="cf-quick">${note ? html`<p>${note}</p>` : nothing}${actions.map((item) => html`<a href=${item.href}><small>${item.kicker}</small><b>${item.value}</b></a>`)}</div>` : html`<p class="cf-empty">${t({ ar: "أضف وسيلة تواصل من الإعدادات", en: "Add a contact method in the settings" })}</p>`}
      </div>
    </section>`;
  }
}
