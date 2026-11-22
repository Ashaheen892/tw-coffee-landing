import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getCollectionItems, getConfig, linkHref, localizedString, watchLocale } from "../../utils/config.js";
import { announceBar, announceCss } from "../../utils/announce.js";
import { clearDocks, scrollPageTop, syncDocks, type DockNodes } from "../../utils/dock.js";
import { currentTone, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.cf-foot { padding-block: 42px 28px; font-size: .84rem; color: var(--mute); }
.cf-foot-grid { display: grid; gap: 22px; }
.cf-foot b { color: var(--crema); font-weight: 700; font-family: var(--disp); font-size: 1.05rem; }
.cf-foot p { margin-top: 6px; }
.cf-links { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 8px; }
.cf-links a { border-block-end: 1px solid transparent; }
.cf-links a:hover { color: var(--ink); border-color: var(--amber); }
.cf-flogo img { height: 40px; width: auto; object-fit: contain; margin-bottom: 8px; }
.cf-dock { position: fixed; z-index: 80; display: inline-grid; place-items: center; width: 3.5rem; height: 3.5rem; padding: 0; border-radius: .3rem; border: 2px solid #1c140e; background: #e08b3f; color: #1c140e; font-family: var(--font-main, inherit); cursor: pointer; text-decoration: none; box-shadow: 4px 4px 0 #1c140e; }
.cf-dock[hidden] { display: none; }
.cf-dock svg { width: 1.4rem; height: 1.4rem; display: block; }
.cf-dock--top { background: #1c140e; color: #f6efe6; }
`;

export default class PageFooter extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private dark = false;
  private stop = () => {};
  private docks: DockNodes = { wa: null, top: null };

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-announce", announceCss("cf", "bean"));
    injectStyles("cf-page-footer", css);
    const stopLocale = watchLocale(this);
    const onTone = () => { this.dark = currentTone() === "dark"; };
    window.addEventListener("cf-tone", onTone);
    this.dark = currentTone() === "dark";
    this.stop = () => {
      stopLocale();
      window.removeEventListener("cf-tone", onTone);
    };
  }

  disconnectedCallback() {
    this.stop();
    clearDocks(this.docks);
    super.disconnectedCallback();
  }

  protected updated() {
    this.docks = syncDocks(getConfig(this.config), "cf", this.docks, (event) => scrollPageTop(event, this));
  }

  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand);
    const lines = [localizedString(cfg.address), localizedString(cfg.hours), localizedString(cfg.legal)].filter(Boolean);
    const links = getCollectionItems<Record<string, any>>(cfg.links, "links")
      .map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) }))
      .filter((item) => item.label && item.url);
    const logo = (this.dark && cfg.logo_dark) || cfg.logo;
    return html`${announceBar(cfg, "cf", `cf-root ${schemeOf(cfg)}`)}
    <footer class=${`cf-root cf-foot ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="cf-wrap cf-foot-grid">
        <div class="cf-flogo">
          ${logo ? html`<img src=${logo} alt=${brand} />` : nothing}
          ${brand ? html`<b>${brand}</b>` : nothing}
          ${lines.map((line) => html`<p>${line}</p>`)}
        </div>
        ${links.length ? html`<nav class="cf-links">${links.map((item) => html`<a href=${item.url}>${item.label}</a>`)}</nav>` : nothing}
      </div>
    </footer>`;
  }
}
