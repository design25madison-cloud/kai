import { referenceImage } from "../app/referenceImages.js";

export const LANDING_COPY = {
  nav: ["Product", "Customers", "Pricing", "Log in", "Get started"],
  fallbackIntro: "One place for your team to plan the work, track it, and see what needs attention next.",
  buttons: ["Book a demo", "See how it works"],
  stat: ["This week", "On schedule"],
  customersLabel: "Teams already on board",
  customers: ["Northline", "Halden Co.", "Corvid", "Mesa Works", "Tallis"],
  featuresTitle: "Everything in one view",
  features: [
    ["See it all", "Every project, owner, and deadline on one page, so nobody has to go looking."],
    ["Catch it early", "Anything slipping rises to the top before it becomes a problem."],
    ["Share it fast", "Send a clean update to your team without building another report."],
  ],
  statementLabel: "How we work",
  stats: [["94%", "Finished on schedule"], ["3 hrs", "Saved each week"], ["12 days", "To get set up"]],
  cta: ["See it with your own work.", "Book a demo"],
  footer: ["Privacy", "Terms", "Contact"],
};

export default function LandingMockup({ vm }) {
  const c = vm.cur;
  const copy = LANDING_COPY;
  const heroImage = referenceImage(c.imgs[0][0]);
  const bandImage = referenceImage(c.imgs[1][0]);
  const wordmark = <span className="mock-wordmark">{vm.wordUpper}</span>;

  return (
    <div className="mock-site">
      <div className="mock-chrome">
        <span className="mock-chrome__dot" />
        <span className="mock-chrome__url">{vm.domainShown}</span>
      </div>

      <nav className="mock-nav" aria-hidden="true">
        {wordmark}
        <span className="mock-nav__links">
          {copy.nav.slice(0, 3).map((x) => <span key={x}>{x}</span>)}
        </span>
        <span className="mock-nav__actions">
          <span>{copy.nav[3]}</span>
          <span className="mock-btn mock-btn--sm">{copy.nav[4]}</span>
        </span>
      </nav>

      <div className="mock-hero">
        <div className="mock-hero__text">
          <h3 className="mock-hero__title">{c.headline}</h3>
          <p className="mock-hero__intro">{vm.mockIntro || copy.fallbackIntro}</p>
          <div className="mock-hero__buttons">
            <span className="mock-btn">{copy.buttons[0]}</span>
            <span className="mock-link">{copy.buttons[1]} →</span>
          </div>
        </div>
        <div className="mock-hero__media">
          {heroImage && <img src={heroImage.src} alt={c.imgs[0][0]} loading="lazy" />}
          <div className="mock-stat-card">
            <span className="mock-stat-card__label">{copy.stat[0]}</span>
            <span className="mock-stat-card__value">{copy.stats[0][0]}</span>
            <span className="mock-stat-card__label">{copy.stat[1]}</span>
          </div>
        </div>
      </div>

      <div className="mock-customers">
        <span className="mock-customers__label">{copy.customersLabel}</span>
        {copy.customers.map((x) => <span key={x} className="mock-customers__name">{x}</span>)}
      </div>

      <div className="mock-features">
        <h4 className="mock-section-title">{copy.featuresTitle}</h4>
        <div className="mock-features__grid">
          {copy.features.map(([title, text], k) => (
            <div key={title} className="mock-feature">
              <span className="mock-feature__num">0{k + 1}</span>
              <span className="mock-feature__title">{title}</span>
              <span className="mock-feature__text">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mock-band">
        <div className="mock-band__media">
          {bandImage && <img src={bandImage.src} alt={c.imgs[1][0]} loading="lazy" />}
        </div>
        <div className="mock-band__text">
          <span className="mock-band__label">{copy.statementLabel}</span>
          {c.tone.map((t) => (
            <span key={t.yes} className="mock-band__line">{t.yes}, <em>not {t.no}.</em></span>
          ))}
        </div>
      </div>

      <div className="mock-stats">
        {copy.stats.map(([value, label]) => (
          <div key={label} className="mock-stats__item">
            <span className="mock-stats__value">{value}</span>
            <span className="mock-stats__label">{label}</span>
          </div>
        ))}
      </div>

      <div className="mock-cta">
        <span className="mock-cta__title">{copy.cta[0]}</span>
        <span className="mock-btn mock-btn--accent">{copy.cta[1]}</span>
      </div>

      <div className="mock-footer">
        {wordmark}
        <span className="mock-footer__links">
          {copy.footer.map((x) => <span key={x}>{x}</span>)}
        </span>
      </div>
    </div>
  );
}
