import Breadcrumbs from "./Breadcrumbs.jsx";
import KaiLogo from "./KaiLogo.jsx";
import { Fragment } from "react";
import StepBranding from "./StepBranding.jsx";
import StepCustomer from "./StepCustomer.jsx";
import StepExtraInfo from "./StepExtraInfo.jsx";
import StepGeneral from "./StepGeneral.jsx";
import StepReview from "./StepReview.jsx";

export default function BriefScreen({ vm }) {
  return (
    <div className="maxw-760px m-0-auto p-48px-24px-80px flex col gap-28px">
      <KaiLogo className="page-logo page-logo--flow" />
      <div className="flex justify-space-between items-center gap-12px wrap">
        <Breadcrumbs items={vm.crumbs} />
        <button className="p-8px-0 bd-0 bg-none t-13px td-underline c-ink-2" type="button" onClick={vm.startOver}>Start over</button>
      </div>
      <nav className="flex justify-space-between gap-8px" aria-label="Brief steps">
        {vm.steps.map((st, i_) => (
          <Fragment key={i_}>
            <button className="flex col items-center gap-6px bd-0 bg-none p-4px flex-1" type="button" onClick={st.pick} aria-current={st.current}>
              <span className="w-px-34px h-34px r-50pct flex items-center justify-center t-14px" style={{ background: st.bg, color: st.fg }}>{st.num}</span>
              <span className="t-12px c-ink" style={{ fontWeight: st.weight }}>{st.label}</span>
            </button>
          </Fragment>
        ))}
      </nav>
      {vm.voice.show && (
        <section className="r-12px bd-1px-solid-ink p-18px flex col gap-14px" aria-label="Voice entry">
          {vm.voice.idle && (
            <>
              <div className="flex gap-16px items-center wrap">
                <button className="w-px-56px h-56px r-50pct bd-0 bg-action flex items-center justify-center p-0 flex-none" type="button" onClick={vm.startVoice} aria-label={vm.voice.startAria}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                </button>
                <div className="flex-1 minw-220px flex col gap-4px">
                  <span className="t-16px w-600">Talk through {vm.voice.section}</span>
                  <span className="t-14px c-muted">Say it in your own words. We'll fill in the fields below, and you can fix anything after.</span>
                </div>
              </div>
              <div className="flex gap-6px wrap items-center">
                <span className="t-12px c-muted">Try covering:</span>
                {vm.voice.prompts.map((pr, i_) => (
                  <Fragment key={i_}>
                    <span className="t-12px p-3px-10px r-9px bg-fill">{pr}</span>
                  </Fragment>
                ))}
              </div>
            </>
          )}
          {vm.voice.rec && (
            <>
              <div className="flex gap-12px items-center wrap">
                <span className="flex gap-8px items-center t-14px w-600 flex-1"><span className="w-px-10px h-10px r-50pct bg-danger" />Listening</span>
                <button className="p-10px-16px r-pill bd-1px-solid-grey-2 bg-bg t-14px" type="button" onClick={vm.cancelVoice}>Cancel</button>
                <button className="p-10px-16px r-pill bd-0 bg-action c-bg t-14px w-600" type="button" onClick={vm.stopVoice}>Done, fill it in</button>
              </div>
              <p className="m-0 minh-48px p-12px r-8px bg-fill t-15px lh-1_5" role="status" aria-live="polite">{vm.voice.live}</p>
            </>
          )}
          {vm.voice.done && (
            <>
              <div className="flex gap-10px items-center wrap">
                <span className="t-15px w-600 flex-1 minw-220px">{vm.voice.doneText}</span>
                <button className="p-8px-14px r-pill bd-1px-solid-grey-2 bg-bg t-13px" type="button" onClick={vm.undoVoice}>Undo</button>
                <button className="p-8px-14px r-pill bd-1px-solid-grey-2 bg-bg t-13px" type="button" onClick={vm.startVoice}>Talk again</button>
              </div>
              <div className="flex gap-6px wrap">
                {vm.voice.filled.map((fl, i_) => (
                  <Fragment key={i_}>
                    <span className="t-12px p-3px-10px r-9px bg-fill">{fl.label}</span>
                  </Fragment>
                ))}
              </div>
              <button className="self-flex-start p-2px-0 bd-0 bg-none t-13px td-underline c-ink-2" type="button" onClick={vm.toggleT} aria-expanded={vm.voice.showT}>{vm.voice.tLabel}</button>
              {vm.voice.showT && (
                <p className="m-0 p-12px r-8px bg-fill t-14px lh-1_5">{vm.voice.transcript}</p>
              )}
            </>
          )}
        </section>
      )}
      {vm.isS1 && <StepGeneral vm={vm} />}
      {vm.isS2 && <StepBranding vm={vm} />}
      {vm.isS3 && <StepCustomer vm={vm} />}
      {vm.isS4 && <StepExtraInfo vm={vm} />}
      {vm.isS5 && <StepReview vm={vm} />}
      <div className="flex justify-flex-end gap-12px pt-8px bd-t-1px-solid-divider">
        {vm.notLast && (
          <button className="p-12px-22px r-pill bd-0 bg-action c-bg w-600" type="button" onClick={vm.nextStep}>Next</button>
        )}
        {vm.isS5 && (
          <button className="p-12px-22px r-pill bd-0 c-bg w-600" type="button" onClick={vm.generate} disabled={vm.hasMissing} style={{ background: vm.genBg }}>Generate direction</button>
        )}
      </div>
    </div>
  );
}
