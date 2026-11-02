import { Fragment } from "react";

export default function StepTone({ vm }) {
  return (
    <div className="flex col gap-24px">
      <div className="flex col gap-4px">
        <h2 className="m-0 t-22px w-600">Tone</h2>
      </div>
      <div className="flex col gap-8px">
        <span className="t-13px">Tone or qualities the name should convey</span>
        <div className="flex gap-8px wrap">
          {vm.toneChips.map((c, i_) => (
            <Fragment key={i_}>
              <button className="p-8px-14px r-pill bd-1px-solid-grey-1 t-14px" type="button" onClick={c.toggle} aria-pressed={c.on} style={{ background: c.bg, color: c.fg }}>{c.label}</button>
            </Fragment>
          ))}
        </div>
        <div className="flex gap-8px maxw-420px">
          <input className="flex-1 p-10px-12px r-pill bd-1px-solid-grey-2 bg-bg" name="toneIn" value={vm.f.toneIn} onChange={vm.onField} aria-label="Add your own quality" placeholder="Add your own" />
          <button className="p-8px-14px r-pill bd-1px-solid-grey-1 bg-bg t-14px" type="button" onClick={vm.addTone}>Add</button>
        </div>
      </div>
      <div className="flex col gap-14px">
        <span className="t-13px">Emotional tone</span>
        {vm.sliders.map((sl, i_) => (
          <Fragment key={i_}>
            <div className="flex col gap-4px">
              <input className="w-px-100pct accent-ink" type="range" min="0" max="100" name={sl.key} value={sl.val} onChange={vm.onSlider} aria-label={sl.aria} />
              <div className="flex justify-space-between t-12px c-muted">
                <span>{sl.l}</span>
                <span>{sl.r}</span>
              </div>
            </div>
          </Fragment>
        ))}
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
