import Breadcrumbs from "./Breadcrumbs.jsx";
import { HomeLogo, SaveStatus, useDismiss } from "./ProjectChrome.jsx";
import { useState } from "react";
import StepBranding from "./StepBranding.jsx";
import StepCustomer from "./StepCustomer.jsx";
import StepTone from "./StepTone.jsx";
import StepGeneral from "./StepGeneral.jsx";
import StepReview from "./StepReview.jsx";

export default function BriefScreen({ vm }) {
  // Which confirm is open: "start" (Start over) or "generate" (Generate would discard refinements).
  const [ask, setAsk] = useState(null);
  const startRef = useDismiss(ask === "start", () => setAsk(null));
  return (
    <div className="flow-page gap-28px">
      {vm.sugCss && <style>{vm.sugCss}</style>}
      <HomeLogo vm={vm} className="page-logo" />
      <div className="flex justify-space-between items-center gap-12px wrap">
        <Breadcrumbs items={vm.crumbs} />
        <div className="flex items-center gap-16px">
          <SaveStatus vm={vm} />
          <div className="relative" ref={startRef}>
            <button className="p-8px-0 bd-0 bg-none t-13px td-underline c-ink-2" type="button" onClick={() => setAsk(ask === "start" ? null : "start")} aria-expanded={ask === "start"}>Start over</button>
            {ask === "start" && (
              <div className="menu menu--end">
                <div className="project-menu__confirm">
                  <span className="t-13px">Start over? This clears every answer and direction in this project. It can't be undone.</span>
                  <div className="flex gap-8px">
                    <button className="btn btn--danger" type="button" onClick={vm.startOver}>Start over</button>
                    <button className="btn" type="button" onClick={() => setAsk(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="brief-progress" aria-label="Brief steps">
        <div className="brief-progress__track" role="progressbar" aria-label="Brief progress" aria-valuemin={1} aria-valuemax={vm.steps.length} aria-valuenow={vm.stepNow}>
          <div className="brief-progress__fill" style={{ width: vm.stepPct }} />
        </div>
        <div className="brief-progress__labels">
          {vm.steps.map((st) => (
            <button key={st.label} className="brief-progress__step" type="button" onClick={st.pick} aria-current={st.current}>{st.label}</button>
          ))}
        </div>
      </nav>
      {vm.isS1 && <StepGeneral vm={vm} />}
      {vm.isS2 && <StepBranding vm={vm} />}
      {vm.isS3 && <StepCustomer vm={vm} />}
      {vm.isS4 && <StepTone vm={vm} />}
      {vm.isS5 && <StepReview vm={vm} />}
      <div className="flex justify-flex-end items-center gap-12px pt-8px bd-t-1px-solid-divider">
        {vm.canReturn && (
          <button className="btn" type="button" onClick={vm.backToResults}>Back to results</button>
        )}
        {vm.notLast && (
          <button className="btn-cta" type="button" onClick={vm.nextStep}>Next</button>
        )}
        {vm.isS5 && ask === "generate" && (
          <>
            <span className="t-13px">Generating again replaces your directions and clears every lock, edit and comment.</span>
            <button className="btn" type="button" onClick={() => setAsk(null)}>Cancel</button>
          </>
        )}
        {vm.isS5 && (
          <button className="btn-cta" type="button" onClick={vm.genLoses && ask !== "generate" ? () => setAsk("generate") : vm.generate} disabled={vm.hasMissing} style={{ background: vm.genBg }}>{ask === "generate" ? "Generate anyway" : "Generate directions"}</button>
        )}
      </div>
    </div>
  );
}
