import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { Deck } from "../../utils/deck.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { clipUrl, frameSrc } from "../../utils/video.js";

const css = `
.cf-slides { padding: 0; background: var(--cf-section-bg, var(--bg)); }
.cf-stage { position: relative; min-height: clamp(460px, 78vh, 780px); display: flex; align-items: flex-end; overflow: hidden; overflow: clip; background: var(--bg-2); touch-action: pan-y; }
.cf-stage > img, .cf-stage > video, .cf-stage > iframe, .cf-stage > .cf-ph { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; animation: cf-slide-in .6s ease; }
.cf-stage > iframe { pointer-events: none; transform: scale(1.35); }
.cf-stage > .cf-ph { background: radial-gradient(circle at 70% 30%, var(--crema), var(--rust) 45%, #241208 85%); }
.cf-stage::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgb(13 11 9 / 88%) 8%, rgb(13 11 9 / 18%) 58%, transparent); pointer-events: none; }
.cf-stage .cf-wrap { position: relative; z-index: 1; padding-block: 0 34px; }
.cf-slidecard { --notch: 12px; display: grid; grid-template-columns: 4.2rem 1fr; max-width: 640px; background: var(--bg); color: var(--ink); clip-path: polygon(0 0, 100% 0, 100% calc(50% - var(--notch)), calc(100% - var(--notch)) 50%, 100% calc(50% + var(--notch)), 100% 100%, 0 100%, 0 calc(50% + var(--notch)), var(--notch) 50%, 0 calc(50% - var(--notch))); }
.cf-slidecard > i { display: grid; place-content: center; gap: 4px; border-inline-end: 2px dashed var(--line-2); font-style: normal; text-align: center; font-weight: 900; font-size: 1.5rem; line-height: 1; color: var(--amber); font-variant-numeric: tabular-nums; }
.cf-slidecard > i small { font-size: .62rem; letter-spacing: .14em; color: var(--mute); font-weight: 700; }
.cf-slidecard > div { padding: 22px 24px 24px; }
.cf-slidecard h2 { font-size: clamp(1.5rem, 3.6vw, 2.5rem); }
.cf-slidecard p { margin-top: 8px; color: var(--mute); max-width: 48ch; }
.cf-slidecard .cf-acts { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 10px; }
.cf-sound { position: absolute; z-index: 2; top: 18px; inset-inline-end: 18px; min-height: 2.5rem; padding: 0 14px; border: 2px solid #f2ece2; background: rgb(13 11 9 / 70%); color: #f2ece2; font: inherit; font-weight: 800; cursor: pointer; }
.cf-vtag { position: absolute; z-index: 2; top: 18px; inset-inline-start: 18px; padding: 4px 12px; background: var(--rust); color: var(--on-rust); font-size: .76rem; font-weight: 800; letter-spacing: .12em; }
.cf-tabs { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); border-block-end: 2px solid var(--line); background: var(--cf-section-bg, var(--bg)); }
.cf-tab { position: relative; display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; min-height: 4.2rem; padding: 14px 18px 12px; border: 0; border-inline-start: 2px solid var(--line); background: transparent; color: var(--mute); font: inherit; text-align: start; cursor: pointer; }
.cf-tab:first-child { border-inline-start: 0; }
.cf-tab b { font-weight: 900; color: var(--amber); font-variant-numeric: tabular-nums; }
.cf-tab span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: .9rem; }
.cf-tab[aria-current="true"] { color: var(--ink); background: var(--bg-2); }
.cf-tab .cf-fill { position: absolute; inset-inline: 0; top: -2px; height: 4px; background: var(--amber); transform: scaleX(0); transform-origin: right; }
[dir="ltr"] .cf-tab .cf-fill { transform-origin: left; }
.cf-tab[aria-current="true"] .cf-fill.run { animation: cf-fill var(--ms, 6500ms) linear forwards; }
.cf-slides.is-held .cf-fill.run { animation-play-state: paused; }
.cf-tab[aria-current="true"] .cf-fill.done { transform: scaleX(1); }
.cf-arrows { position: absolute; z-index: 2; bottom: 34px; inset-inline-end: max(var(--pad), calc((100% - var(--max)) / 2)); display: flex; gap: 8px; }
[dir="rtl"] .cf-arrows svg { transform: scaleX(-1); }
.cf-arrows button { width: 3rem; height: 3rem; display: grid; place-items: center; border: 2px solid #f2ece2; background: rgb(13 11 9 / 60%); color: #f2ece2; cursor: pointer; }
.cf-arrows svg { width: 1.2rem; height: 1.2rem; }
@keyframes cf-fill { to { transform: scaleX(1); } }
@keyframes cf-slide-in { from { opacity: .3; } to { opacity: 1; } }
@container (max-width: 760px) {
  .cf-tabs { grid-auto-flow: row; grid-auto-columns: auto; }
  .cf-tab { border-inline-start: 0; border-block-start: 2px solid var(--line); }
  .cf-arrows { display: none; }
  .cf-slidecard { grid-template-columns: 3.2rem 1fr; }
}
@media (prefers-reduced-motion: reduce) { .cf-stage > * { animation: none !important; } .cf-fill.run { animation: none !important; transform: scaleX(1); } }
`;

type Slide = { image: string; video: string; alt: string; tag: string; title: string; text: string; button: string; url: string };

export default class RoastSlider extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  private deck = new Deck(this, 6500, 18000);
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-roast-slider", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  private media(slide: Slide, total: number) {
    const kind = Deck.kindOf(slide.video);
    if (kind === "image") return slide.image ? html`<img src=${slide.image} alt=${slide.alt || slide.title} />` : html`<div class="cf-ph" aria-hidden="true"></div>`;
    const tag = html`<span class="cf-vtag">${t({ ar: "فيديو", en: "VIDEO" })}</span>`;
    if (kind === "frame") return html`${tag}<iframe src=${frameSrc(slide.video)} title=${slide.alt || slide.title} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy"></iframe>`;
    return html`${tag}<video src=${slide.video} poster=${slide.image || nothing} .muted=${!this.deck.sound} autoplay playsinline preload="metadata" ?loop=${total < 2 || this.deck.reduced}
        aria-label=${slide.alt || slide.title} @timeupdate=${this.deck.progress} @ended=${() => this.deck.go(1)} @error=${this.deck.fail}></video>
      <button type="button" class="cf-sound" @click=${() => this.deck.toggleSound()}>${this.deck.sound ? t({ ar: "كتم", en: "Mute" }) : t({ ar: "الصوت", en: "Sound" })}</button>`;
  }

  render() {
    const cfg = getConfig(this.config);
    const slides: Slide[] = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        image: String(item.image || "").trim(),
        video: clipUrl(item.video),
        alt: localizedString(item.alt),
        tag: localizedString(item.tag),
        title: localizedString(item.title),
        text: localizedString(item.text),
        button: localizedString(item.button),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.title || item.image || item.video);
    const deck = this.deck;
    deck.sync(slides.map((item) => Deck.kindOf(item.video)));
    const slide = slides[deck.index];
    const label = localizedString(cfg.title) || t({ ar: "سلايدر", en: "Slider" });
    if (!slide) return html`<section class=${`cf-root cf-sec ${schemeOf(cfg)}`}><div class="cf-wrap"><p class="cf-empty">${t({ ar: "أضف الشرائح من الإعدادات", en: "Add slides in the settings" })}</p></div></section>`;
    const left = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`;
    const right = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`;
    const fillClass = deck.kind === "file" ? "" : deck.auto ? "run" : "done";
    return html`<section id="cf-slides" class=${`cf-root cf-slides ${schemeOf(cfg)} ${deck.paused ? "is-held" : ""}`} style=${`${sectionStyle(cfg)};--ms:${deck.ms}ms`}
        aria-roledescription="carousel" aria-label=${label} @keydown=${deck.key}>
      <div class="cf-stage" @pointerdown=${deck.down} @pointerup=${deck.up} @pointercancel=${deck.up}>
        ${this.media(slide, slides.length)}
        <div class="cf-wrap">
          <article class="cf-slidecard" aria-live="polite">
            <i><small>${slide.tag || t({ ar: "دفعة", en: "LOT" })}</small>${String(deck.index + 1).padStart(2, "0")}</i>
            <div>
              ${slide.title ? html`<h2>${slide.title}</h2>` : nothing}
              ${slide.text ? html`<p>${slide.text}</p>` : nothing}
              ${slide.button ? html`<div class="cf-acts">${renderCta(slide.button, slide.url)}</div>` : nothing}
            </div>
          </article>
        </div>
        ${slides.length > 1 ? html`<div class="cf-arrows">
          <button type="button" aria-label=${t({ ar: "السابق", en: "Previous" })} @click=${() => deck.go(-1)}>${left}</button>
          <button type="button" aria-label=${t({ ar: "التالي", en: "Next" })} @click=${() => deck.go(1)}>${right}</button>
        </div>` : nothing}
      </div>
      ${slides.length > 1 ? html`<div class="cf-tabs" role="tablist">
        ${slides.map((item, index) => html`<button type="button" class="cf-tab" role="tab" aria-current=${index === deck.index ? "true" : "false"} @click=${() => deck.pick(index)}>
          <span class="cf-fill ${index === deck.index ? fillClass : ""}" ?data-deck-fill=${index === deck.index && deck.kind === "file"} aria-hidden="true"></span>
          <b>${String(index + 1).padStart(2, "0")}</b><span>${item.title || item.tag}</span>
        </button>`)}
      </div>` : nothing}
    </section>`;
  }
}
