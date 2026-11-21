import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, linkHref, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { announceBar, announceCss } from "../../utils/announce.js";
import { applyTone, currentTone, savedTone, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, setKitFont } from "../../utils/styles.js";

const css = `
.cf-bar { position: relative; background: var(--cf-section-bg, var(--bg)); border-block-end: 2px solid var(--line); }
.cf-nav { display: flex; align-items: center; gap: 22px; min-height: 74px; }
.cf-logo { font-family: var(--disp); font-weight: 900; font-size: 1.15rem; letter-spacing: .04em; line-height: 1.05; }
.cf-logo small { display: block; margin-top: 4px; font-family: var(--body); font-size: .62rem; letter-spacing: .28em; color: var(--crema); font-weight: 500; }
.cf-logo img { height: 42px; width: auto; max-width: 42vw; object-fit: contain; }
.cf-nav ul { display: flex; gap: 18px; margin: 0; padding: 0; font-size: .82rem; }
.cf-nav ul a { padding-block: 4px; border-block-end: 2px solid transparent; }
.cf-nav ul a:hover { border-color: var(--amber); color: var(--crema); }
.cf-sp { margin-inline-start: auto; }
.cf-menu, .cf-tone { display: inline-grid; place-items: center; width: 40px; height: 40px; border: 2px solid var(--line-2); background: transparent; color: inherit; cursor: pointer; padding: 0; }
.cf-tone svg { width: 18px; height: 18px; }
.cf-menu { display: none; font-family: var(--disp); font-weight: 800; }
@container (max-width: 860px) {
  .cf-nav { gap: 10px; }
  .cf-logo { font-size: 1rem; white-space: nowrap; }
  .cf-nav ul { display: none; position: absolute; inset-inline: 0; top: 100%; z-index: 5; flex-direction: column; gap: 0; padding: 6px 0 12px; background: var(--bg); border-block-end: 2px solid var(--line); }
  .cf-nav.is-open ul { display: flex; }
  .cf-nav ul a { display: block; padding: 12px var(--pad); }
  .cf-menu { display: inline-grid; }
}
`;

export default class PageBar extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private open = false;
  @state() private dark = false;
  private stop = () => {};
  private pinned: HTMLElement | null = null;
  private opened: HTMLElement[] = [];
  private modeKey = "";

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("cf-host");
    injectFonts();
    injectStyles("cf-base", baseCss);
    injectStyles("cf-announce", announceCss("cf"));
    injectStyles("cf-page-bar", css);
    const stopLocale = watchLocale(this);
    const onTone = () => { this.dark = currentTone() === "dark"; };
    window.addEventListener("cf-tone", onTone);
    this.stop = () => {
      stopLocale();
      window.removeEventListener("cf-tone", onTone);
      this.release();
    };
  }

  protected willUpdate() {
    const cfg = getConfig(this.config);
    setKitFont(this.kitFont(cfg));
    const key = `${unwrapValue(cfg.default_mode) || "dark"}|${this.showMode(cfg)}`;
    if (key === this.modeKey) return;
    this.modeKey = key;
    applyTone(this.openingMode(cfg));
    this.dark = currentTone() === "dark";
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected updated() {
    this.pin();
  }

  private showMode(cfg: Record<string, any>): boolean {
    if (cfg.show_mode_toggle == null || cfg.show_mode_toggle === "") return true;
    return flag(cfg.show_mode_toggle);
  }

  private kitFont(cfg: Record<string, any>): boolean {
    if (cfg.use_kit_font == null || cfg.use_kit_font === "") return false;
    return flag(cfg.use_kit_font);
  }

  private openingMode(cfg: Record<string, any>): "light" | "dark" {
    const base = String(unwrapValue(cfg.default_mode) || "dark");
    if (this.showMode(cfg)) {
      const saved = savedTone();
      if (saved) return saved;
    }
    if (base === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return base === "dark" ? "dark" : "light";
  }

  private place(run: () => void) {
    const view = this.ownerDocument.defaultView;
    if (!view) {
      run();
      return;
    }
    const nodes = new Set<Element>([this.ownerDocument.documentElement, this.ownerDocument.body]);
    if (this.ownerDocument.scrollingElement) nodes.add(this.ownerDocument.scrollingElement);
    let node: HTMLElement | null = this;
    while (node) {
      nodes.add(node);
      node = node.parentElement;
    }
    const marks = [...nodes].map((el) => [el, el.scrollTop] as const);
    const x = view.scrollX;
    const y = view.scrollY;
    const put = () => {
      for (const [el, top] of marks) if (el.scrollTop !== top) el.scrollTop = top;
      if (Math.abs(view.scrollY - y) > 1 || Math.abs(view.scrollX - x) > 1) view.scrollTo(x, y);
    };
    run();
    put();
    view.requestAnimationFrame(() => {
      put();
      view.requestAnimationFrame(put);
    });
  }

  private outerBox(): HTMLElement {
    let node: HTMLElement = this;
    while (node.parentElement && node.parentElement !== document.body && node.parentElement !== document.documentElement) {
      const parent = node.parentElement;
      const sections = [...parent.children].filter((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE");
      if (sections.length > 1) return node;
      node = parent;
    }
    return node;
  }

  private pin() {
    const cfg = getConfig(this.config);
    const sticky = flag(cfg.sticky);
    const outer = this.outerBox();
    if (this.pinned && this.pinned !== outer) this.release();
    this.pinned = outer;
    outer.style.position = sticky ? "sticky" : "";
    outer.style.top = sticky ? "0" : "";
    outer.style.zIndex = sticky ? "40" : "";
    this.opened.forEach((el) => { el.style.overflow = ""; });
    this.opened = [];
    if (!sticky) return;
    let node = outer.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      const flow = getComputedStyle(node);
      if (flow.overflowY === "auto" || flow.overflowY === "scroll") break;
      if (flow.overflowY === "hidden" || flow.overflowX === "hidden") {
        node.style.overflow = "clip";
        this.opened.push(node);
      }
      node = node.parentElement;
    }
  }

  private release() {
    if (this.pinned) {
      this.pinned.style.position = this.pinned.style.top = this.pinned.style.zIndex = "";
      this.pinned = null;
    }
    this.opened.forEach((el) => { el.style.overflow = ""; });
    this.opened = [];
  }

  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || t({ ar: "مجموعة القهوة", en: "Coffee Group" });
    const mark = localizedString(cfg.mark);
    const links = getCollectionItems<Record<string, any>>(cfg.links, "links")
      .map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" }))
      .filter((item) => item.label);
    const logo = (this.dark && cfg.logo_dark) || cfg.logo;
    return html`${announceBar(cfg, "cf", `cf-root ${schemeOf(cfg)}`, "--ann-bg:var(--amber);--ann-ink:#1c140e")}
    <header class=${`cf-root cf-bar ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <nav class="cf-nav cf-wrap ${this.open ? "is-open" : ""}">
        <a href=${linkHref(cfg.home_url) || "#cf-cover"} class="cf-logo" aria-label=${brand}>
          ${logo
            ? html`<img src=${logo} alt=${brand} />`
            : html`${brand}${mark ? html`<small>${mark}</small>` : nothing}`}
        </a>
        ${links.length ? html`<ul>${links.map((item) => html`<li><a href=${item.url} @click=${() => { this.open = false; }}>${item.label}</a></li>`)}</ul>` : nothing}
        <span class="cf-sp"></span>
        ${this.showMode(cfg) ? html`<button type="button" class="cf-tone" aria-pressed=${this.dark ? "true" : "false"} aria-label=${this.dark ? t({ ar: "التبديل إلى الوضع الفاتح", en: "Switch to light mode" }) : t({ ar: "التبديل إلى الوضع الداكن", en: "Switch to dark mode" })} @mousedown=${(event: Event) => event.preventDefault()} @click=${() => this.place(() => { applyTone(this.dark ? "light" : "dark"); this.dark = currentTone() === "dark"; })}>
          ${this.dark
            ? html`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" /><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" /></g></svg>`
            : html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.5 2.4a9 9 0 1 0 7.1 13.6A8 8 0 0 1 14.5 2.4z" /></svg>`}
        </button>` : nothing}
        <button type="button" class="cf-menu" aria-expanded=${this.open ? "true" : "false"} aria-label=${t({ ar: "القائمة", en: "Menu" })} @click=${() => { this.open = !this.open; }}>☰</button>
      </nav>
    </header>`;
  }
}
