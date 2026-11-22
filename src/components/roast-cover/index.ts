import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, linkHref, localizedString, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-cover { position: relative; overflow: hidden; overflow: clip; min-height: min(88vh, 760px); display: flex; align-items: center; }
.cf-cover .cf-wrap { position: relative; z-index: 1; width: min(var(--max), calc(100% - (var(--pad) * 2))); }
.cf-stamp { display: inline-flex; align-items: center; gap: 10px; border: 2px solid var(--line-2); padding: 8px 16px; font-size: .78rem; letter-spacing: .08em; color: var(--crema); margin-bottom: 24px; }
.cf-stamp i { width: 9px; height: 9px; background: var(--amber); border-radius: 50%; }
.cf-cover h1 { padding-bottom: .08em; font-size: clamp(2.5rem, 8vw, 6.2rem); line-height: .92; font-weight: 900; }
.cf-cover h1 em { font-style: normal; color: var(--rust); }
.cf-meta { display: flex; flex-wrap: wrap; margin-top: 32px; border-block-start: 2px solid var(--line); }
.cf-meta div { flex: 1 1 140px; padding: 16px 0; padding-inline-end: 18px; border-inline-end: 2px solid var(--line); }
.cf-meta div:last-child { border-inline-end: 0; }
.cf-meta span { display: block; font-size: .72rem; letter-spacing: .12em; color: var(--mute); }
.cf-meta b { display: block; margin-top: 4px; font-family: var(--disp); font-weight: 800; font-size: 1.05rem; }
.cf-bean { position: absolute; inset-inline-end: -6vw; top: 50%; transform: translateY(-50%); width: min(42vw, 440px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 36% 30%, var(--crema), var(--rust) 42%, #3a1d08 78%); opacity: .28; pointer-events: none; }
.cf-bean::after { content: ""; position: absolute; inset-block: 8%; inset-inline-start: 48%; width: 5%; background: var(--bg); border-radius: 99px; transform: rotate(-8deg); }
@container (max-width: 720px) { .cf-bean { display: none; } .cf-cover { min-height: 0; } }
`;

export default class RoastCover extends LitElement {
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
    injectStyles("cf-roast-cover", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const stamp = localizedString(cfg.stamp);
    const before = localizedString(cfg.title_before);
    const mid = localizedString(cfg.title_mid);
    const accent = localizedString(cfg.title_accent);
    const after = localizedString(cfg.title_after);
    const text = localizedString(cfg.text);
    const secondary = localizedString(cfg.secondary_label);
    const secondaryUrl = linkHref(cfg.secondary_url);
    const stats = getCollectionItems<Record<string, any>>(cfg.stats, "stats")
      .map((item) => ({ label: localizedString(item.label), value: localizedString(item.value) }))
      .filter((item) => item.value);
    return html`<section id="cf-cover" class=${`cf-root cf-cover ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${before || "cover"}>
      <div class="cf-bean" aria-hidden="true"></div>
      <div class="cf-wrap">
        ${stamp ? html`<span class="cf-stamp"><i aria-hidden="true"></i>${stamp}</span>` : nothing}
        ${before || mid || accent || after ? html`<h1>${before}${mid || accent ? html`<br>${mid} ${accent ? html`<em>${accent}</em>` : nothing}` : nothing}${after ? html`<br>${after}` : nothing}</h1>` : nothing}
        ${text ? html`<p class="cf-lead">${text}</p>` : nothing}
        ${stats.length ? html`<div class="cf-meta">${stats.map((item) => html`<div><span>${item.label}</span><b>${item.value}</b></div>`)}</div>` : nothing}
        <div class="cf-actions">
          ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
          ${secondary && secondaryUrl ? html`<a class="cf-btn ghost" href=${secondaryUrl}>${secondary}</a>` : nothing}
        </div>
      </div>
    </section>`;
  }
}
