import { copyHits } from "../app/language.js";
import DashboardMockup, { DASHBOARD_COPY } from "./DashboardMockup.jsx";
import LandingMockup, { LANDING_COPY } from "./LandingMockup.jsx";
import PieceActions from "./PieceActions.jsx";

// Every string in a nested copy object, for the restricted word check.
const strings = (value) => (typeof value === "string" ? [value] : typeof value === "object" && value ? Object.values(value).flatMap(strings) : []);
const MOCK_COPY = [...strings(LANDING_COPY), ...strings(DASHBOARD_COPY)];

export default function VisualizationSection({ vm }) {
  const c = vm.cur;
  const hits = copyHits(vm.banned, MOCK_COPY);
  // Everything inside the mockups reads from these, so each direction restyles them completely.
  const theme = {
    "--m-ui": c.ui,
    "--m-ui-hover": c.uiHover,
    "--m-primary": c.primary,
    "--m-on-primary": c.onPrimary,
    "--m-accent": c.accent,
    "--m-on-accent": c.onAccent,
    "--m-accent-text": c.accentText,
    "--m-surface": c.surface,
    "--m-light": c.light,
    "--m-card": c.card,
    "--m-ink": c.ink,
    "--m-deep": c.deep,
    "--m-on-deep": c.onDeep,
    "--m-link": c.linkColor,
    "--m-display": `'${c.display}', sans-serif`,
    "--m-body": `'${c.body}', sans-serif`,
    "--m-word": `'${c.wordFont}', sans-serif`,
    "--m-track": c.trackPx,
  };

  return (
    <section aria-labelledby="h-preview" className="flex col gap-14px smt-16px" id="sec-preview">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px minh-53px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-preview">6. Visualization{vm.sec.preview.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
      </div>
      {hits.length > 0 && <span className="language-flag">Sample copy uses a restricted word: {hits.join(", ")}</span>}

      <div className="mock-frame" style={theme}>
        {vm.cmode && (
          <button className="pick" type="button" onClick={vm.pins.landing} aria-pressed={vm.pinSel.landing} aria-label="Comment on the landing page" />
        )}
        <PieceActions vm={vm} piece={vm.pieces.landing} />
        <LandingMockup vm={vm} />
      </div>

      <div className="mock-frame" style={theme}>
        {vm.cmode && (
          <button className="pick" type="button" onClick={vm.pins.preview} aria-pressed={vm.pinSel.preview} aria-label="Comment on the product UI" />
        )}
        <PieceActions vm={vm} piece={vm.pieces.preview} />
        <DashboardMockup vm={vm} />
      </div>

      <div className="two" style={theme}>
        <div className="mock-tile" style={{ background: c.light }}>
          <div className="mock-card">
            <span className="mock-card__tag">New</span>
            <span className="mock-card__title">Project update</span>
            <span className="mock-card__text">Three items moved forward this week. One needs a decision.</span>
            <span className="mock-link mock-link--sm">Read more →</span>
          </div>
        </div>
        <div className="mock-tile mock-tile--states" style={{ background: c.light }}>
          <div className="mock-states">
            <span className="mock-btn">Default</span>
            <span className="mock-btn mock-btn--hover">Hover</span>
            <span className="mock-btn mock-btn--disabled">Disabled</span>
            <span className="mock-btn mock-btn--focus">Focus</span>
          </div>
          <span className="mock-link">Link text</span>
        </div>
      </div>
    </section>
  );
}
