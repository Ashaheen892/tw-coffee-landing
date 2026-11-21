import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { digits, getConfig, localizedString, unwrapValue, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-calc { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 28px; }
.cf-fld { margin-bottom: 20px; }
.cf-fld > span { display: block; margin-bottom: 9px; font-size: .74rem; letter-spacing: .12em; color: var(--mute); font-weight: 600; }
.cf-pills { display: flex; flex-wrap: wrap; gap: 7px; }
.cf-pill { border: 2px solid var(--line-2); padding: 8px 14px; background: transparent; color: inherit; cursor: pointer; font-size: .82rem; }
.cf-pill[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); font-weight: 600; }
.cf-rng { display: flex; align-items: center; gap: 12px; }
.cf-rng input { flex: 1; -webkit-appearance: none; appearance: none; height: 4px; background: var(--line-2); }
.cf-rng input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; background: var(--amber); border-radius: 50%; }
.cf-rng input::-moz-range-thumb { width: 18px; height: 18px; background: var(--amber); border-radius: 50%; border: 0; }
.cf-rng output { min-width: 72px; font-family: var(--disp); font-weight: 800; font-size: 1.1rem; font-variant-numeric: tabular-nums; }
.cf-out { border: 2px solid var(--amber); padding: 24px; align-content: start; }
.cf-out .big { display: block; font-family: var(--disp); font-weight: 900; font-size: clamp(2.2rem, 6vw, 3.4rem); color: var(--amber); line-height: 1; }
.cf-out .bl { display: block; margin-bottom: 8px; font-size: .78rem; letter-spacing: .14em; color: var(--mute); }
.cf-out .r { display: flex; align-items: baseline; gap: 10px; padding-block: 11px; border-block-start: 2px solid var(--line); font-size: .86rem; }
.cf-out .r i { flex: 1; border-block-end: 1px dotted var(--line-2); transform: translateY(-5px); }
.cf-out .r b { font-family: var(--disp); font-variant-numeric: tabular-nums; }
.cf-hint { margin-top: 16px; font-size: .82rem; color: var(--mute); }
@container (max-width: 800px) { .cf-calc { grid-template-columns: 1fr; } }
`;

const METHODS = [
  { id: "v60", temp: 93, seconds: 150 },
  { id: "press", temp: 94, seconds: 240 },
  { id: "drip", temp: 92, seconds: 300 },
  { id: "espresso", temp: 92, seconds: 28 },
];

export default class BrewCalc extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private method = "v60";
  @state() private ratio = 16;
  @state() private dose = 20;
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-brew-calc", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  private copy(cfg: Record<string, any>, id: string, fallback: string): string {
    return localizedString(cfg[id]) || fallback;
  }

  render() {
    const cfg = getConfig(this.config);
    const method = METHODS.find((item) => item.id === this.method) || METHODS[0];
    const espresso = method.id === "espresso";
    const water = espresso ? Math.round(this.dose * 2) : Math.round(this.dose * this.ratio);
    const cups = Math.max(1, Math.round(water / 170));
    const bloom = this.dose * 2;
    const minutes = Math.floor(method.seconds / 60);
    const seconds = method.seconds % 60;
    const time = espresso
      ? `${digits(method.seconds)} ${this.copy(cfg, "seconds_unit", "ثانية")}`
      : `${digits(minutes)}:${digits(String(seconds).padStart(2, "0"))} ${this.copy(cfg, "minutes_unit", "د")}`;
    const methods = [
      ["v60", this.copy(cfg, "m_v60", "V60")],
      ["press", this.copy(cfg, "m_press", "فرنش برس")],
      ["drip", this.copy(cfg, "m_drip", "قطرة")],
      ["espresso", this.copy(cfg, "m_espresso", "إسبريسو")],
    ];
    const ratios = [14, 16, 18];
    const ratioNames = [
      this.copy(cfg, "r_strong", "١:١٤ مركّز"),
      this.copy(cfg, "r_even", "١:١٦ متوازن"),
      this.copy(cfg, "r_light", "١:١٨ خفيف"),
    ];
    return html`<section id="cf-brew" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "brew"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        <div class="cf-calc">
          <div>
            <div class="cf-fld">
              <span>${this.copy(cfg, "method_label", "الطريقة")}</span>
              <div class="cf-pills" role="group">
                ${methods.map(([id, label]) => html`<button type="button" class="cf-pill" aria-pressed=${this.method === id ? "true" : "false"} @click=${() => { this.method = id; }}>${label}</button>`)}
              </div>
            </div>
            <div class="cf-fld">
              <span>${this.copy(cfg, "ratio_label", "النسبة")}</span>
              <div class="cf-pills" role="group">
                ${ratios.map((value, i) => html`<button type="button" class="cf-pill" aria-pressed=${this.ratio === value ? "true" : "false"} ?disabled=${espresso} @click=${() => { this.ratio = value; }}>${ratioNames[i]}</button>`)}
              </div>
            </div>
            <div class="cf-fld">
              <span>${this.copy(cfg, "dose_label", "وزن القهوة")}</span>
              <div class="cf-rng">
                <input type="range" min=${Number(unwrapValue(cfg.dose_min) || 12)} max=${Number(unwrapValue(cfg.dose_max) || 40)} step="1" .value=${String(this.dose)} aria-label=${this.copy(cfg, "dose_label", "وزن القهوة")} @input=${(event: Event) => { this.dose = Number((event.target as HTMLInputElement).value); }} />
                <output>${digits(this.dose)} ${this.copy(cfg, "gram_unit", "غ")}</output>
              </div>
            </div>
            ${localizedString(cfg.hint) ? html`<p class="cf-hint">${localizedString(cfg.hint)}</p>` : nothing}
          </div>
          <div class="cf-out" aria-live="polite">
            <span class="bl">${this.copy(cfg, "water_label", "كمية الماء")}</span>
            <span class="big">${digits(water)} ${this.copy(cfg, "ml_unit", "مل")}</span>
            <div class="r"><span>${this.copy(cfg, "cups_label", "عدد الأكواب")}</span><i aria-hidden="true"></i><b>${digits(cups)}</b></div>
            <div class="r"><span>${this.copy(cfg, "bloom_label", "ماء الإزهار")}</span><i aria-hidden="true"></i><b>${espresso ? "—" : `${digits(bloom)} ${this.copy(cfg, "ml_unit", "مل")}`}</b></div>
            <div class="r"><span>${this.copy(cfg, "time_label", "الزمن المقترح")}</span><i aria-hidden="true"></i><b>${time}</b></div>
            <div class="r"><span>${this.copy(cfg, "temp_label", "درجة الماء")}</span><i aria-hidden="true"></i><b>${digits(method.temp)}°</b></div>
            ${localizedString(cfg.button_label) ? html`<div class="cf-actions"><a class="cf-btn" href="#cf-order">${localizedString(cfg.button_label)}</a></div>` : nothing}
          </div>
        </div>
      </div>
    </section>`;
  }
}
