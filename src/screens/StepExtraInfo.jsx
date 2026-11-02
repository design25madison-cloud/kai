import { Fragment } from "react";

export default function StepExtraInfo({ vm }) {
  return (
    <div className="flex col gap-24px">
      <div className="flex col gap-4px">
        <h2 className="m-0 t-22px w-600">Extra info</h2>
      </div>
      <div className="flex col gap-14px">
        <span className="t-15px w-600">Product direction</span>
        <div className="two">
          <div className="flex col gap-6px">
            <label className="t-13px" htmlFor="f-val">Primary value delivered</label>
            <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-val" name="value" value={vm.f.value} onChange={vm.onField} placeholder=" " />
          </div>
          <div className="flex col gap-6px">
            <label className="t-13px" htmlFor="f-emo">Secondary or emotional value</label>
            <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-emo" name="emo" value={vm.f.emo} onChange={vm.onField} placeholder=" " />
          </div>
          <div className="flex col gap-6px">
            <label className="t-13px" htmlFor="f-wedge">What feature gets users to try it first</label>
            <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-wedge" name="wedge" value={vm.f.wedge} onChange={vm.onField} placeholder=" " />
          </div>
          <div className="flex col gap-6px">
            <label className="t-13px" htmlFor="f-wedgeWhy">Why it's compelling compared to alternatives</label>
            <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-wedgeWhy" name="wedgeWhy" value={vm.f.wedgeWhy} onChange={vm.onField} placeholder=" " />
          </div>
        </div>
        <div className="flex justify-space-between items-center">
          <label className="t-13px" htmlFor="f-feel">What should this product feel like to use, end to end?</label>
          <button className="w-px-32px h-32px r-50pct bd-1px-solid-faint bg-bg flex items-center justify-center p-0" type="button" onClick={vm.mic} aria-label="Answer by voice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
        </div>
        <textarea className="p-12px r-8px bd-1px-solid-grey-2 bg-bg resize-vertical" id="f-feel" name="feel" value={vm.f.feel} onChange={vm.onField} rows="2" placeholder=" " />
        <label className="t-13px" htmlFor="f-diffFeel">What should feel fundamentally different from existing solutions?</label>
        <textarea className="p-12px r-8px bd-1px-solid-grey-2 bg-bg resize-vertical" id="f-diffFeel" name="diffFeel" value={vm.f.diffFeel} onChange={vm.onField} rows="2" placeholder=" " />
      </div>
      <div className="flex col gap-8px">
        <span className="t-13px">Core job to be done</span>
        <div className="p-14px flex wrap gap-8px items-center t-15px bg-bg bd-1px-solid-grey-2 r-12px">
          <span>When</span>
          <input className="flex-1 minw-140px p-8px-10px r-pill bd-1px-solid-grey-2 bg-bg" name="jWhen" value={vm.f.jWhen} onChange={vm.onField} aria-label="Situation" placeholder="situation" />
          <span>, I want to</span>
          <input className="flex-1 minw-140px p-8px-10px r-pill bd-1px-solid-grey-2 bg-bg" name="jWant" value={vm.f.jWant} onChange={vm.onField} aria-label="Motivation" placeholder="motivation" />
          <span>, so I can</span>
          <input className="flex-1 minw-140px p-8px-10px r-pill bd-1px-solid-grey-2 bg-bg" name="jSo" value={vm.f.jSo} onChange={vm.onField} aria-label="Outcome" placeholder="outcome" />
        </div>
      </div>
      <div className="flex col gap-8px">
        <span className="t-13px">High-level workflow</span>
        <div className="three">
          <div className="flex col gap-6px">
            <label className="t-12px c-ink-2" htmlFor="f-wf1">Where the user typically starts</label>
            <input className="p-10px r-pill bd-1px-solid-grey-2 bg-bg" id="f-wf1" name="wfStart" value={vm.f.wfStart} onChange={vm.onField} placeholder=" " />
          </div>
          <div className="flex col gap-6px">
            <label className="t-12px c-ink-2" htmlFor="f-wf2">The aha moment</label>
            <input className="p-10px r-pill bd-1px-solid-grey-2 bg-bg" id="f-wf2" name="wfAha" value={vm.f.wfAha} onChange={vm.onField} placeholder=" " />
          </div>
          <div className="flex col gap-6px">
            <label className="t-12px c-ink-2" htmlFor="f-wf3">What success looks like</label>
            <input className="p-10px r-pill bd-1px-solid-grey-2 bg-bg" id="f-wf3" name="wfSuccess" value={vm.f.wfSuccess} onChange={vm.onField} placeholder=" " />
          </div>
        </div>
        <button className="self-flex-start p-6px-0 bd-0 bg-none t-13px td-underline c-ink-2" type="button" onClick={vm.toggleSig} aria-expanded={vm.sigOpen}>{vm.sigLabel}</button>
        {vm.sigOpen && (
          <div className="two">
            <div className="flex col gap-6px">
              <label className="t-12px c-ink-2" htmlFor="f-sg1">Users' unprompted reactions</label>
              <input className="p-10px r-pill bd-1px-solid-grey-2 bg-bg" id="f-sg1" name="sigReact" value={vm.f.sigReact} onChange={vm.onField} placeholder=" " />
            </div>
            <div className="flex col gap-6px">
              <label className="t-12px c-ink-2" htmlFor="f-sg2">What would feel noticeably easier or faster</label>
              <input className="p-10px r-pill bd-1px-solid-grey-2 bg-bg" id="f-sg2" name="sigEasier" value={vm.f.sigEasier} onChange={vm.onField} placeholder=" " />
            </div>
          </div>
        )}
      </div>
      <div className="flex col gap-10px">
        <span className="t-15px w-600">Links</span>
        <label className="t-13px" htmlFor="f-site">Current website build or workspace</label>
        <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-site" name="site" value={vm.f.site} onChange={vm.onField} placeholder="https://" />
      </div>
    </div>
  );
}
