import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { clipUrl, frameSrc, isFileClip, setFrameSound } from "../../utils/video.js";

const css = `
.cf-cup { background: var(--cf-section-bg, var(--bg)); }
.cf-sheet { margin-top: 28px; border: 2px solid var(--line); background: var(--card, var(--bg)); }
.cf-ticket { display: grid; grid-template-columns: 46px minmax(0, 1.15fr) minmax(220px, .85fr); border-block-end: 2px solid var(--line); }
.cf-ticket:last-child { border-block-end: 0; }
.cf-sprocket { background:
  radial-gradient(circle at 50% 18px, var(--bg) 5px, transparent 6px) 0 0 / 100% 36px repeat-y,
  var(--ink); }
.cf-frame { position: relative; min-height: 180px; background: #1c140e; color: #f6efe6; }
.cf-frame video, .cf-frame iframe, .cf-frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; }
.cf-tap { position: absolute; z-index: 2; inset: 0; display: grid; place-items: center; border: 0; background: linear-gradient(90deg, rgb(28 20 14 / 18%), rgb(28 20 14 / 55%)); color: inherit; cursor: pointer; }
.cf-tap b { min-width: 4.6rem; min-height: 2.4rem; display: grid; place-items: center; border: 2px solid #f6efe6; background: rgb(28 20 14 / 72%); font-family: var(--disp); font-weight: 800; letter-spacing: .08em; }
.cf-mute { position: absolute; z-index: 3; top: 10px; inset-inline-end: 10px; min-height: 32px; padding: 2px 10px; border: 2px solid #f6efe6; background: #1c140e; color: #f6efe6; font: inherit; font-size: .75rem; cursor: pointer; }
.cf-note { padding: 18px 18px 16px; display: grid; align-content: center; gap: 8px; }
.cf-note .no { font-family: var(--disp); font-weight: 800; letter-spacing: .16em; color: var(--amber); font-size: .78rem; }
.cf-note h3 { margin: 0; font-family: var(--disp); font-weight: 800; font-size: 1.15rem; }
.cf-note p { margin: 0; color: var(--mute); font-size: .92rem; }
.cf-note cite { font-style: normal; font-size: .8rem; }
.cf-cup .cf-actions { margin-top: 22px; }
@container (max-width: 760px) {
  .cf-ticket { grid-template-columns: 28px 1fr; }
  .cf-note { grid-column: 1 / -1; border-block-start: 2px solid var(--line); }
  .cf-frame { min-height: 200px; }
}
`;

type Cup = { source: string; poster: string; name: string; place: string; note: string };

export default class CupReels extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private live = -1;
  @state() private sound = false;
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-cup-reels", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected updated() {
    const box = this.querySelector(".cf-mute")?.closest(".cf-frame");
    const video = box?.querySelector("video");
    if (video instanceof HTMLVideoElement) video.muted = !this.sound;
    const frame = box?.querySelector("iframe");
    if (frame instanceof HTMLIFrameElement) setFrameSound(frame, this.sound);
  }

  private cups(cfg: Record<string, any>): Cup[] {
    return getCollectionItems<Record<string, any>>(cfg.items, "items").map((item) => ({
      source: clipUrl(item.video_url),
      poster: clipUrl(item.poster),
      name: localizedString(item.name),
      place: localizedString(item.place),
      note: localizedString(item.note),
    })).filter((item) => item.name || item.source || item.poster);
  }

  render() {
    const cfg = getConfig(this.config);
    const cups = this.cups(cfg);
    return html`<section id="cf-cups" class=${`cf-root cf-sec cf-cup ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "tastings"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${localizedString(cfg.text) ? html`<p class="cf-lead">${localizedString(cfg.text)}</p>` : nothing}
        ${cups.length ? html`<div class="cf-sheet">
          ${cups.map((cup, index) => {
            const on = this.live === index;
            const file = cup.source && isFileClip(cup.source);
            return html`<article class="cf-ticket">
              <div class="cf-sprocket" aria-hidden="true"></div>
              <div class="cf-frame">
                ${on && cup.source
                  ? file
                    ? html`<video src=${cup.source} poster=${cup.poster} autoplay muted playsinline loop controls></video>`
                    : html`<iframe src=${frameSrc(cup.source)} title=${cup.name} allow="autoplay; encrypted-media"></iframe>`
                  : cup.poster
                    ? html`<img src=${cup.poster} alt="">`
                    : nothing}
                ${on ? html`<button type="button" class="cf-mute" @click=${() => { this.sound = !this.sound; }}>${this.sound ? t({ ar: "كتم", en: "Mute" }) : t({ ar: "صوت", en: "Sound" })}</button>` : html`<button type="button" class="cf-tap" @click=${() => { this.live = index; this.sound = false; }}><b>${t({ ar: "تذوق", en: "Taste" })}</b></button>`}
              </div>
              <div class="cf-note">
                <span class="no">${String(index + 1).padStart(2, "0")}</span>
                ${cup.name ? html`<h3>${cup.name}</h3>` : nothing}
                ${cup.note ? html`<p>${cup.note}</p>` : nothing}
                ${cup.place ? html`<cite>${cup.place}</cite>` : nothing}
              </div>
            </article>`;
          })}
        </div>` : html`<p class="cf-empty">${t({ ar: "أضف تجارب التذوق من إعدادات القسم", en: "Add tasting clips in the section settings" })}</p>`}
        <div class="cf-actions">${renderCta(cfg.button_label, "#cf-order")}</div>
      </div>
    </section>`;
  }
}
