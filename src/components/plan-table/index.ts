import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-table-wrap { margin-top: 28px; overflow-x: auto; }
.cf-tbl { width: 100%; border-collapse: collapse; font-size: .9rem; min-width: 640px; }
.cf-tbl th, .cf-tbl td { border: 2px solid var(--line); padding: 14px 12px; text-align: start; vertical-align: top; }
.cf-tbl thead th { font-family: var(--disp); font-weight: 800; font-size: .95rem; background: color-mix(in srgb, var(--ink) 4%, transparent); }
.cf-tbl thead th.hot { background: var(--rust); color: var(--on-rust); border-color: var(--rust); }
.cf-tbl td.c { text-align: center; font-variant-numeric: tabular-nums; }
.cf-tbl .pv { font-family: var(--disp); font-weight: 900; font-size: 1.25rem; color: var(--amber); }
.cf-yes { color: var(--amber); font-weight: 700; }
.cf-no { color: var(--line-2); }
.cf-note { margin-top: 14px; font-size: .82rem; color: var(--mute); }
`;

function cell(value: string) {
  const token = value.trim().toLowerCase();
  if (token === "yes" || token === "✓" || value.trim() === "نعم") return html`<span class="cf-yes">✓</span>`;
  if (token === "no" || token === "—" || token === "-" || value.trim() === "لا") return html`<span class="cf-no">—</span>`;
  const numeric = /^[\d٠-٩.\s]+$/.test(value.trim());
  return html`<span class=${numeric ? "pv" : ""}>${value}</span>`;
}

export default class PlanTable extends LitElement {
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
    injectStyles("cf-plan-table", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const heads = [localizedString(cfg.col_a), localizedString(cfg.col_b), localizedString(cfg.col_c)];
    const hot = String(unwrapValue(cfg.hot_column) || "2");
    const rows = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        feature: localizedString(item.feature),
        cells: [localizedString(item.a), localizedString(item.b), localizedString(item.c)],
      }))
      .filter((item) => item.feature);
    return html`<section id="cf-plans" class=${`cf-root cf-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "plans"}>
      <div class="cf-wrap">
        ${localizedString(cfg.index_label) ? html`<div class="cf-idx" aria-hidden="true">${localizedString(cfg.index_label)}</div>` : nothing}
        ${localizedString(cfg.kicker) ? html`<span class="cf-kick">${localizedString(cfg.kicker)}</span>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="cf-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${rows.length ? html`<div class="cf-table-wrap">
          <table class="cf-tbl">
            <caption class="cf-sr">${localizedString(cfg.title)}</caption>
            <thead><tr>
              <th>${localizedString(cfg.feature_label) || t({ ar: "الميزة", en: "Feature" })}</th>
              ${heads.map((head, i) => html`<th class=${hot === String(i + 1) ? "hot" : ""}>${head}</th>`)}
            </tr></thead>
            <tbody>
              ${rows.map((row) => html`<tr>
                <td>${row.feature}</td>
                ${row.cells.map((value) => html`<td class="c">${cell(value)}</td>`)}
              </tr>`)}
            </tbody>
          </table>
        </div>
        ${localizedString(cfg.note) ? html`<p class="cf-note">${localizedString(cfg.note)}</p>` : nothing}
        ${localizedString(cfg.button_label) ? html`<div class="cf-actions"><a class="cf-btn" href="#cf-order">${localizedString(cfg.button_label)}</a></div>` : nothing}` : html`<p class="cf-empty">${t({ ar: "أضف صفوف المقارنة من الإعدادات", en: "Add comparison rows in the settings" })}</p>`}
      </div>
    </section>`;
  }
}
