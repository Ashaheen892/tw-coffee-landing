import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { nudge, watchReels } from "../../utils/reels.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { clipUrl, frameSrc, isFileClip } from "../../utils/video.js";

const css = `
.cf-film { background: var(--cf-section-bg, var(--bg)); }
.cf-film-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 22px; }
.cf-film-head p { color: var(--mute); max-width: 46ch; margin-top: 8px; }
.cf-film-arrows { display: flex; gap: 8px; }
[dir="rtl"] .cf-film-arrows svg { transform: scaleX(-1); }
.cf-film-arrows button { width: 3rem; height: 3rem; display: grid; place-items: center; border: 2px solid var(--ink); background: transparent; color: var(--ink); cursor: pointer; }
.cf-film-arrows svg { width: 1.2rem; height: 1.2rem; }
.cf-strip { position: relative; padding-block: 26px; background: #120d09; }
.cf-strip::before, .cf-strip::after { content: ""; position: absolute; inset-inline: 0; height: 14px; background: radial-gradient(circle, #f2ece2 0 3.5px, transparent 4px) 0 50% / 22px 14px repeat-x; opacity: .55; }
.cf-strip::before { top: 6px; } .cf-strip::after { bottom: 6px; }
.cf-track { display: grid; grid-auto-flow: column; grid-auto-columns: clamp(210px, 26vw, 270px); gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding-inline: max(var(--pad), calc((100% - var(--max)) / 2)); scrollbar-width: none; }
.cf-track::-webkit-scrollbar { display: none; }
.cf-reel { position: relative; scroll-snap-align: start; aspect-ratio: 9 / 16; overflow: hidden; background: #2a1f17; border: 2px solid #3a2e24; color: #f2ece2; }
.cf-reel.is-on { border-color: var(--amber); }
.cf-reel > video, .cf-reel > img, .cf-reel > iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; }
.cf-reel::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgb(13 11 9 / 92%) 4%, transparent 52%); pointer-events: none; }
.cf-reel-tap { position: absolute; z-index: 2; inset: 0; border: 0; background: transparent; cursor: pointer; }
.cf-reel-no { position: absolute; z-index: 3; top: 10px; inset-inline-start: 10px; padding: 2px 8px; background: var(--amber); color: #1c140e; font-weight: 900; font-size: .78rem; font-variant-numeric: tabular-nums; pointer-events: none; }
.cf-reel-snd { position: absolute; z-index: 3; top: 10px; inset-inline-end: 10px; width: 2.2rem; height: 2.2rem; display: grid; place-items: center; background: rgb(13 11 9 / 70%); border: 2px solid #f2ece2; font-size: .9rem; pointer-events: none; }
.cf-reel-play { position: absolute; z-index: 3; top: 50%; inset-inline-start: 50%; translate: 50% -50%; width: 3.6rem; height: 3.6rem; display: grid; place-items: center; border: 2px solid #f2ece2; background: rgb(13 11 9 / 60%); font-size: 1.2rem; pointer-events: none; }
[dir="ltr"] .cf-reel-play { translate: -50% -50%; }
.cf-reel-cap { position: absolute; z-index: 3; inset-inline: 0; bottom: 0; padding: 14px; display: grid; gap: 4px; pointer-events: none; }
.cf-reel-cap b { font-family: var(--disp); font-weight: 800; font-size: 1.02rem; }
.cf-reel-cap span { font-size: .82rem; opacity: .8; }
.cf-reel-cap .cf-reel-buy { pointer-events: auto; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgb(242 236 226 / 35%); }
.cf-reel-cap .cf-reel-buy em { font-style: normal; font-weight: 900; color: var(--amber); }
.cf-reel-cap .cf-reel-buy .cf-btn, .cf-reel-cap .cf-reel-buy a, .cf-reel-cap .cf-reel-buy button { min-height: 2.3rem; padding: 0 12px; font-size: .8rem; }
@container (max-width: 640px) { .cf-track { grid-auto-columns: 70%; } .cf-film-arrows { display: none; } }
`;

type Reel = { video: string; poster: string; name: string; note: string; price: string; button: string; url: string };

export default class BrewReels extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private active = -1;
  @state() private opened = new Set<number>();
  private stop = () => {};
  private stopReels = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-brew-reels", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    this.stopReels();
    super.disconnectedCallback();
  }

  protected updated() {
    this.stopReels();
    this.stopReels = watchReels(this);
  }

  private tap(index: number, reel: Reel) {
    if (!reel.video) return;
    if (!isFileClip(reel.video)) {
      this.opened = new Set(this.opened).add(index);
      return;
    }
    this.active = this.active === index ? -1 : index;
    this.querySelectorAll<HTMLVideoElement>("video[data-reel]").forEach((video) => {
      const mine = Number(video.dataset.reel) === this.active;
      video.muted = !mine;
      if (mine) void video.play().catch(() => undefined);
    });
  }

  render() {
    const cfg = getConfig(this.config);
    const reels: Reel[] = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        video: clipUrl(item.video),
        poster: String(item.poster || "").trim(),
        name: localizedString(item.name),
        note: localizedString(item.note),
        price: localizedString(item.price),
        button: localizedString(item.button),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.video || item.poster);
    const left = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`;
    const right = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" /></svg>`;
    const track = () => this.querySelector<HTMLElement>(".cf-track");
    return html`<section id="cf-film" class=${`cf-root cf-sec cf-film ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "reels"}>
      <div class="cf-wrap cf-film-head">
        <div>
          ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
          ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${reels.length > 2 ? html`<div class="cf-film-arrows">
          <button type="button" aria-label=${t({ ar: "السابق", en: "Previous" })} @click=${() => nudge(track(), -1)}>${left}</button>
          <button type="button" aria-label=${t({ ar: "التالي", en: "Next" })} @click=${() => nudge(track(), 1)}>${right}</button>
        </div>` : nothing}
      </div>
      ${reels.length ? html`<div class="cf-strip"><div class="cf-track">
        ${reels.map((reel, index) => {
          const file = reel.video && isFileClip(reel.video);
          const frameOpen = reel.video && !file && this.opened.has(index);
          return html`<article class=${`cf-reel ${this.active === index ? "is-on" : ""}`}>
            ${file
              ? html`<video data-reel=${index} src=${reel.video} poster=${reel.poster || nothing} muted loop playsinline preload="metadata" aria-label=${reel.name}></video>`
              : frameOpen
                ? html`<iframe src=${frameSrc(reel.video)} title=${reel.name} allow="autoplay; encrypted-media; picture-in-picture"></iframe>`
                : reel.poster ? html`<img src=${reel.poster} alt=${reel.name} loading="lazy" />` : nothing}
            ${frameOpen ? nothing : html`<button type="button" class="cf-reel-tap" aria-label=${file ? (this.active === index ? t({ ar: "كتم الصوت", en: "Mute" }) : t({ ar: "تشغيل الصوت", en: "Play with sound" })) : t({ ar: "تشغيل الفيديو", en: "Play video" })} @click=${() => this.tap(index, reel)}></button>`}
            <span class="cf-reel-no">${String(index + 1).padStart(2, "0")}</span>
            ${file ? html`<span class="cf-reel-snd" aria-hidden="true">${this.active === index ? "🔊" : "🔇"}</span>` : reel.video && !frameOpen ? html`<span class="cf-reel-play" aria-hidden="true">▶</span>` : nothing}
            <div class="cf-reel-cap">
              ${reel.name ? html`<b>${reel.name}</b>` : nothing}
              ${reel.note ? html`<span>${reel.note}</span>` : nothing}
              ${reel.price || reel.button ? html`<div class="cf-reel-buy">${reel.price ? html`<em>${reel.price}</em>` : html`<i></i>`}${reel.button ? renderCta(reel.button, reel.url) : nothing}</div>` : nothing}
            </div>
          </article>`;
        })}
      </div></div>` : html`<div class="cf-wrap"><p class="cf-empty">${t({ ar: "أضف مقاطع الريلز من الإعدادات", en: "Add reels in the settings" })}</p></div>`}
    </section>`;
  }
}
