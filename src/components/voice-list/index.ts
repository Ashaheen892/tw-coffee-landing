import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-voices { margin-top: 26px; }
.cf-voices blockquote { margin: 0; padding-block: 22px; border-block-start: 2px solid var(--line); display: grid; grid-template-columns: auto 1fr; gap: 18px; }
.cf-av { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(140deg, var(--crema), var(--rust)); display: grid; place-items: center; font-family: var(--disp); font-weight: 800; color: #1c140e; }
.cf-voices q { quotes: "«" "»"; font-size: clamp(.98rem, 2vw, 1.12rem); }
.cf-voices cite { display: block; margin-top: 8px; font-style: normal; font-size: .8rem; color: var(--mute); }
.cf-voices .st { color: var(--amber); letter-spacing: .08em; }
`;

export default class VoiceList extends LitElement {
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
    injectStyles("cf-voice-list", css);
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
        quote: localizedString(item.quote),
        name: localizedString(item.name),
        place: localizedString(item.place),
        detail: localizedString(item.detail),
        initial: localizedString(item.initial),
        stars: Number(unwrapValue(item.stars) || 5),
      }))
      .filter((item) => item.quote);
    return html`<section id="cf-voices" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "voices"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${items.length ? html`<div class="cf-voices">
          ${items.map((item) => html`<blockquote>
            <span class="cf-av" aria-hidden="true">${item.initial || item.name.slice(0, 1)}</span>
            <div>
              <q>${item.quote}</q>
              <cite><span class="st">${"★".repeat(Math.max(1, Math.min(5, item.stars)))}${"☆".repeat(Math.max(0, 5 - item.stars))}</span> · ${item.name}${item.place ? ` · ${item.place}` : ""}${item.detail ? ` · ${item.detail}` : ""}</cite>
            </div>
          </blockquote>`)}
        </div>` : html`<p class="cf-empty">${t({ ar: "أضف الآراء من إعدادات القسم", en: "Add reviews in the section settings" })}</p>`}
      </div>
    </section>`;
  }
}
