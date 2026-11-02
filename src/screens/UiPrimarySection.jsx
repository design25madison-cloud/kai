import { Fragment } from "react";

export default function UiPrimarySection({ vm }) {
  return (
    <section aria-labelledby="h-ui" className="flex col gap-14px smt-16px" id="sec-ui">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-ui">3. UI primary{vm.sec.ui.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
        <div className="flex gap-8px relative wrap">
          <button className="w-px-36px h-36px r-8px bd-1px-solid-ink p-0 flex items-center justify-center" type="button" onClick={vm.sec.ui.toggleLock} aria-pressed={vm.sec.ui.locked} aria-label={vm.sec.ui.lockAria} style={{ background: vm.sec.ui.lockBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vm.sec.ui.lockFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d={vm.sec.ui.shackle} />
            </svg>
          </button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink t-13px" type="button" onClick={vm.sec.ui.toggleEdit} aria-pressed={vm.sec.ui.editing} style={{ background: vm.sec.ui.editBg, color: vm.sec.ui.editFg }}>{vm.sec.ui.editLabel}</button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink bg-bg t-13px" type="button" onClick={vm.sec.ui.toggleExport} aria-expanded={vm.sec.ui.exportOpen}>Export</button>
          {vm.sec.ui.exportOpen && (
            <div className="absolute right-0 top-42px z-4 w-px-220px bg-bg bd-1px-solid-line r-10px p-6px flex col">
              {vm.sec.ui.formats.map((x, i_) => (
                <Fragment key={i_}>
                  <button className="ta-left p-9px-10px bd-0 r-6px bg-bg t-13px" type="button" onClick={x.pick}>{x.label}</button>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      {vm.sec.ui.editing && (
        <div className="p-16px r-10px bd-1px-dashed-muted flex col gap-6px maxw-420px">
          <label className="t-12px" htmlFor="e-ui">Shade: darken {vm.cur.accentName} by {vm.cur.uiMix}%</label>
          <input className="accent-ink" id="e-ui" type="range" min="0" max="80" value={vm.cur.uiMix} onChange={vm.setUiMix} />
          <span className="t-12px c-muted">Edits lock this section, so regenerating keeps them.</span>
        </div>
      )}
      <span className="t-13px c-muted">The UI primary follows the palette's accent. Lock it to keep this exact shade when the palette regenerates.</span>
      <div className="flex gap-24px wrap items-stretch">
        <div className="relative w-px-180px h-140px r-10px flex items-flex-end p-12px c-bg t-14px w-600" style={{ background: vm.cur.ui }}>{vm.cmode && (<button className="pick" type="button" onClick={vm.pins.ui} aria-pressed={vm.pinSel.ui} aria-label="Comment on the UI primary" />)}{vm.cur.ui}</div>
        <div className="flex col gap-8px justify-center">
          <span className="t-14px">Tuned from {vm.cur.accentName} ({vm.cur.accent})</span>
          <span className="t-14px">White text: <strong>{vm.cur.uiRatio}:1</strong> <span className="p-2px-10px r-9px t-12px c-bg" style={{ background: vm.cur.passBg }}>{vm.cur.passLabel}</span></span>
          <span className="t-14px">On {vm.cur.darkName}, for dark mode: {vm.cur.uiDarkRatio}:1</span>
        </div>
        <div className="flex col gap-10px justify-center p-16px r-10px" style={{ background: vm.cur.light, fontFamily: `'${vm.cur.body}', sans-serif` }}>
          <div className="flex gap-10px wrap">
            <span className="p-10px-16px r-6px c-bg t-14px" style={{ background: vm.cur.ui }}>Default</span>
            <span className="p-10px-16px r-6px c-bg t-14px" style={{ background: vm.cur.uiHover }}>Hover</span>
            <span className="p-10px-16px r-6px o-0_6 t-14px" style={{ background: vm.cur.surface, color: vm.cur.ink }}>Disabled</span>
            <span className="p-8px-14px r-6px c-bg t-14px outlin-3px" style={{ background: vm.cur.ui, outline: `2px solid ${vm.cur.ui}` }}>Focus</span>
          </div>
          <span className="t-14px td-underline" style={{ color: vm.cur.linkColor }}>Link text</span>
        </div>
      </div>
    </section>
  );
}
