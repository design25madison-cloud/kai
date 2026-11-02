import { referenceImage } from "../app/referenceImages.js";
import DashboardMockup from "./DashboardMockup.jsx";

export const LANDING_COPY = {
  nav: ["Home", "Products", "Resources", "Pricing"],
  navActions: ["Log in", "Sign up"],
  fallbackIntro: "One place for your team to plan the work, track it, and see what needs attention next.",
  heroButtons: ["Demo", "Sign up"],
  proofLabel: "Join 4,000+ companies already growing",
  proof: ["Northline", "Halden Co.", "Corvid", "Mesa Works", "Tallis", "Ostrava"],
  featuresTitle: "The only view you'll ever need. Simple.",
  featuresIntro: "Every project, owner, and deadline in one place, so nobody has to go looking.",
  features: [
    ["Share one workspace", "Whether you have a team of 2 or 200, everyone stays on the same page and in the loop."],
    ["Get instant answers", "Find the status of any project in seconds, without asking around."],
    ["Report in one click", "Send a clean update to your team without building another deck."],
    ["Bring in your partners", "Give vendors and customers a clear view of the work they're part of."],
    ["Connect your tools", "Works with the systems you already use, so nothing gets entered twice."],
    ["Talk to real people", "Our team is on hand to help you set up, roll out, and keep going."],
  ],
  cta: ["Give us a shot", "Set up your first project this week and see the whole picture by Friday.", "Learn more", "Get started"],
  tabsEyebrow: "Features",
  tabsTitle: "Everything your team needs to stay on schedule",
  tabsIntro: "Plan the work, track it, and see what needs attention next.",
  tabs: [
    ["See it all", "Every project, owner, and deadline on one page."],
    ["Catch it early", "Anything slipping rises to the top before it becomes a problem."],
    ["Share it fast", "Send a clean update to your team in a couple of clicks."],
  ],
  learnMore: "Learn more",
  pricingEyebrow: "Upgrade",
  pricingTitle: "Pricing that grows with you",
  pricingIntro: "Simple plans for teams of every size. No hidden fees.",
  billed: "Billed annually.",
  plans: [
    ["Basic plan", "$10/mth", ["Access to all basic features", "Basic reporting and analytics", "Up to 10 individual users", "20GB individual data each user", "Basic chat and email support"]],
    ["Business plan", "$20/mth", ["200+ integrations", "Advanced reporting", "Up to 20 individual users", "40GB individual data each user", "Priority chat and email support"]],
  ],
  planAction: "Get started",
  quote: "We replaced three spreadsheets and a weekly status call in our first month.",
  quoteName: "Renee Wells",
  quoteRole: "Operations Lead, Halden Co.",
  closingTitle: ["No long-term contracts.", "No catches."],
  closingIntro: "Start with one project. Add the rest of your team when you're ready.",
  newsletterTitle: "Join our newsletter",
  newsletterIntro: "We'll send you a short update once a month.",
  emailPlaceholder: "Enter your email",
  subscribe: "Subscribe",
  footer: [
    ["Product", ["Overview", "Features", "Solutions", "Tutorials", "Pricing", "Releases"]],
    ["Company", ["About us", "Careers", "Press", "News", "Media kit", "Contact"]],
    ["Resources", ["Blog", "Newsletter", "Events", "Help centre", "Tutorials", "Support"]],
    ["Use cases", ["Startups", "Enterprise", "Government", "Operations", "Marketplaces", "Field teams"]],
    ["Social", ["Twitter", "LinkedIn", "Facebook", "GitHub", "AngelList", "Dribbble"]],
    ["Legal", ["Terms", "Privacy", "Cookies", "Licenses", "Settings", "Contact"]],
  ],
  newBadge: "New",
  rights: "All rights reserved.",
};

// The template stays the same for every brand. These set how each direction wears it: its corners,
// weight, and which of its colors the hero sits on. "Your mix" falls back to the template's own look.
const LOOKS = {
  "Forged warmth": { radius: "8px", cardRadius: "20px", weight: 600, hero: "primary", align: "center" },
  "Cool alloy": { radius: "2px", cardRadius: "4px", weight: 500, hero: "deep", align: "start" },
  "Raw ground": { radius: "0px", cardRadius: "0px", weight: 800, hero: "light", align: "start" },
};
const DEFAULT_LOOK = { radius: "8px", cardRadius: "20px", weight: 600, hero: "primary", align: "center" };

const HERO_COLORS = {
  primary: { "--h-bg": "var(--m-primary)", "--h-fg": "var(--m-on-primary)", "--h-sec-bg": "var(--m-on-primary)", "--h-sec-fg": "var(--m-primary)", "--h-sec-bd": "var(--m-on-primary)" },
  deep: { "--h-bg": "var(--m-deep)", "--h-fg": "var(--m-on-deep)", "--h-sec-bg": "var(--m-on-deep)", "--h-sec-fg": "var(--m-deep)", "--h-sec-bd": "var(--m-on-deep)" },
  light: { "--h-bg": "var(--m-light)", "--h-fg": "var(--m-ink)", "--h-sec-bg": "transparent", "--h-sec-fg": "var(--m-ink)", "--h-sec-bd": "var(--m-ink)" },
};

function Icon({ path, size = 20 }) {
  return (
    <svg className="mock-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
const CHEVRON = "M6 9l6 6 6-6";
const ARROW = "M5 12h14M13 6l6 6-6 6";
const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const PLAY = "M8 5.5v13l11-6.5z";
const STACK = "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5";

// Photos fill their parent. A label with no photo, such as someone's own upload, keeps the plain tile.
function Photo({ label }) {
  const image = referenceImage(label);
  return image ? <img className="mock-photo" src={image.src} alt={label} loading="lazy" title={`${image.author}, ${image.license}`} /> : null;
}

const STAR = "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z";

export default function LandingMockup({ vm, expanded = true }) {
  const c = vm.cur;
  const copy = LANDING_COPY;
  const look = LOOKS[c.name] || DEFAULT_LOOK;
  const photo = (k) => c.imgs[k % c.imgs.length][0];
  const eyebrow = c.tone.map((t) => `${t.yes}.`).join(" ");
  const style = {
    "--m-radius": look.radius,
    "--m-card-radius": look.cardRadius,
    "--m-weight": look.weight,
    "--m-hero-align": look.align,
    ...HERO_COLORS[look.hero],
  };
  // Alternates photos with the brand's own colors, so the fan shows the system at a glance.
  const fan = [
    { angle: -60, image: 1 },
    { angle: -30, tone: "accent" },
    { angle: 0, image: 0 },
    { angle: 30, tone: "surface" },
    { angle: 60, image: 2 },
  ];

  return (
    <div className="mock-site" style={style}>
      <div className="mock-chrome">
        <span className="mock-chrome__dot" />
        <span className="mock-chrome__url">{vm.domainShown}</span>
      </div>

      <div className={`mock-hero mock-hero--${look.align}`}>
        <nav className="mock-nav" aria-hidden="true">
          <span className="mock-wordmark">{vm.wordUpper}</span>
          <span className="mock-nav__links">
            {copy.nav.map((x, k) => (
              <span key={x} className="mock-nav__item">{x}{(k === 1 || k === 2) && <Icon path={CHEVRON} size={16} />}</span>
            ))}
          </span>
          <span className="mock-nav__actions">
            <span className="mock-nav__item">{copy.navActions[0]}</span>
            <span className="mock-btn mock-btn--sm">{copy.navActions[1]}</span>
          </span>
        </nav>

        <div className="mock-hero__text">
          <span className="mock-hero__eyebrow">{eyebrow}</span>
          <h3 className="mock-hero__title">{c.headline}</h3>
          <p className="mock-hero__intro">{vm.mockIntro || copy.fallbackIntro}</p>
          <div className="mock-hero__buttons">
            <span className="mock-btn mock-btn--lg mock-btn--hero"><Icon path={PLAY} />{copy.heroButtons[0]}</span>
            <span className="mock-btn mock-btn--lg">{copy.heroButtons[1]}</span>
          </div>
        </div>

        <div className="mock-fan" aria-hidden="true">
          {fan.map(({ angle, image, tone }) => (
            <div key={angle} className={tone ? `mock-fan__card mock-fan__card--${tone}` : "mock-fan__card"} style={{ "--angle": `${angle}deg` }}>
              {image !== undefined ? <Photo label={photo(image)} /> : <span className="mock-wordmark mock-fan__word">{vm.wordUpper}</span>}
            </div>
          ))}
        </div>
      </div>

      {expanded && (
        <>
          <div className="mock-section mock-proof">
            <span className="mock-proof__label">{copy.proofLabel}</span>
            <div className="mock-proof__row">
              {copy.proof.map((x) => <span key={x} className="mock-proof__name">{x}</span>)}
            </div>
          </div>

          <div className="mock-divider" />

          <div className="mock-section mock-trio">
            <div className="mock-trio__lead">
              <span className="mock-featured"><Icon path={STACK} /></span>
              <h4 className="mock-h2">{copy.featuresTitle}</h4>
              <p className="mock-sub">{copy.featuresIntro}</p>
            </div>
            {[copy.features.slice(0, 3), copy.features.slice(3)].map((group) => (
              <div key={group[0][0]} className="mock-trio__col">
                {group.map(([title, text]) => (
                  <div key={title} className="mock-feature">
                    <span className="mock-feature__title">{title}</span>
                    <span className="mock-feature__text">{text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mock-section mock-section--tail">
            <div className="mock-split">
              <div className="mock-split__text">
                <div className="mock-split__copy">
                  <h4 className="mock-h2">{copy.cta[0]}</h4>
                  <p className="mock-sub">{copy.cta[1]}</p>
                </div>
                <div className="mock-buttons">
                  <span className="mock-btn mock-btn--invert">{copy.cta[2]}</span>
                  <span className="mock-btn">{copy.cta[3]}</span>
                </div>
              </div>
              <div className="mock-split__media"><Photo label={photo(3)} /></div>
            </div>
          </div>

          <div className="mock-divider" />

          <div className="mock-section mock-tabs">
            <div className="mock-heading">
              <span className="mock-eyebrow">{copy.tabsEyebrow}</span>
              <h4 className="mock-h2">{copy.tabsTitle}</h4>
              <p className="mock-sub">{copy.tabsIntro}</p>
            </div>
            <div className="mock-tabs__row">
              <div className="mock-tabs__list">
                {copy.tabs.map(([title, text], k) => (
                  <div key={title} className={k === 0 ? "mock-tab mock-tab--on" : "mock-tab"}>
                    <span className="mock-feature">
                      <span className="mock-feature__title">{title}</span>
                      <span className="mock-feature__text">{text}</span>
                    </span>
                    <span className="mock-more">{copy.learnMore}<Icon path={ARROW} /></span>
                  </div>
                ))}
              </div>
              <div className="mock-tabs__screen">
                <div className="mock-tabs__app"><DashboardMockup vm={vm} /></div>
              </div>
            </div>
          </div>

          <div className="mock-section mock-section--alt mock-pricing">
            <div className="mock-pricing__lead">
              <span className="mock-eyebrow">{copy.pricingEyebrow}</span>
              <h4 className="mock-h2">{copy.pricingTitle}</h4>
              <p className="mock-sub">{copy.pricingIntro}</p>
            </div>
            <div className="mock-pricing__plans">
              {copy.plans.map(([name, price, items]) => (
                <div key={name} className="mock-plan">
                  <div className="mock-plan__head">
                    <span className="mock-featured mock-featured--sm"><Icon path={STACK} /></span>
                    <span className="mock-plan__name">{name}</span>
                    <span className="mock-plan__price">{price}</span>
                    <span className="mock-plan__billed">{copy.billed}</span>
                  </div>
                  <div className="mock-plan__list">
                    {items.map((x) => <span key={x} className="mock-plan__item"><Icon path={CHECK} />{x}</span>)}
                  </div>
                  <div className="mock-plan__foot"><span className="mock-btn mock-btn--block">{copy.planAction}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="mock-section">
            <div className="mock-split">
              <div className="mock-split__text">
                <span className="mock-stars">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <svg key={k} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={STAR} /></svg>
                  ))}
                </span>
                <p className="mock-quote">{copy.quote}</p>
                <span className="mock-quote__by">
                  <span className="mock-quote__name">— {copy.quoteName}</span>
                  <span className="mock-quote__role">{copy.quoteRole}</span>
                </span>
                <span className="mock-dots"><i className="mock-dots__on" /><i /><i /></span>
              </div>
              <div className="mock-split__media">
                <Photo label={photo(4)} />
                <span className="mock-play"><Icon path={PLAY} size={28} /></span>
              </div>
            </div>
          </div>

          <div className="mock-section mock-section--alt mock-closing">
            <div className="mock-closing__text">
              <div className="mock-closing__copy">
                <h4 className="mock-h1">{copy.closingTitle[0]}<br />{copy.closingTitle[1]}</h4>
                <p className="mock-sub">{copy.closingIntro}</p>
              </div>
              <div className="mock-buttons">
                <span className="mock-btn mock-btn--line">{copy.cta[2]}</span>
                <span className="mock-btn">{copy.cta[3]}</span>
              </div>
            </div>
            <div className="mock-collage" aria-hidden="true">
              {[0, 1, 2, 3, 5].map((image, k) => (
                <div key={image} className={`mock-collage__tile mock-collage__tile--${k + 1}`}><Photo label={photo(image)} /></div>
              ))}
            </div>
          </div>

          <footer className="mock-footer">
            <div className="mock-footer__news">
              <span className="mock-footer__news-text">
                <span className="mock-footer__news-title">{copy.newsletterTitle}</span>
                <span>{copy.newsletterIntro}</span>
              </span>
              <span className="mock-footer__capture">
                <span className="mock-footer__input">{copy.emailPlaceholder}</span>
                <span className="mock-btn">{copy.subscribe}</span>
              </span>
            </div>
            <div className="mock-footer__cols">
              {copy.footer.map(([heading, links]) => (
                <div key={heading} className="mock-footer__col">
                  <span className="mock-footer__head">{heading}</span>
                  {links.map((x) => (
                    <span key={x} className="mock-footer__link">{x}{x === "Solutions" && <span className="mock-footer__badge">{copy.newBadge}</span>}</span>
                  ))}
                </div>
              ))}
            </div>
            <div className="mock-footer__base">
              <span className="mock-wordmark">{vm.wordUpper}</span>
              <span>© {new Date().getFullYear()} {vm.f.name || vm.wordUpper}. {copy.rights}</span>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
