import { Fragment } from "react";

export default function TypographySection({ vm }) {
  return (
    <section aria-labelledby="h-type" className="flex col gap-14px smt-16px" id="sec-type">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-type">4. Typography{vm.sec.type.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
        <div className="flex gap-8px relative wrap">
          <button className="w-px-36px h-36px r-8px bd-1px-solid-ink p-0 flex items-center justify-center" type="button" onClick={vm.sec.type.toggleLock} aria-pressed={vm.sec.type.locked} aria-label={vm.sec.type.lockAria} style={{ background: vm.sec.type.lockBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vm.sec.type.lockFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d={vm.sec.type.shackle} />
            </svg>
          </button>
          <button className="p-8px-14px r-8px bg-bg t-13px flex gap-6px items-center" type="button" onClick={vm.sec.type.regen} aria-disabled={vm.sec.type.locked} style={{ border: `1px solid ${vm.sec.type.regenBd}`, color: vm.sec.type.regenFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.sec.type.regenFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>Regenerate</button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink t-13px" type="button" onClick={vm.sec.type.toggleEdit} aria-pressed={vm.sec.type.editing} style={{ background: vm.sec.type.editBg, color: vm.sec.type.editFg }}>{vm.sec.type.editLabel}</button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink bg-bg t-13px" type="button" onClick={vm.sec.type.toggleExport} aria-expanded={vm.sec.type.exportOpen}>Export</button>
          {vm.sec.type.exportOpen && (
            <div className="absolute right-0 top-42px z-4 w-px-220px bg-bg bd-1px-solid-line r-10px p-6px flex col">
              {vm.sec.type.formats.map((x, i_) => (
                <Fragment key={i_}>
                  <button className="ta-left p-9px-10px bd-0 r-6px bg-bg t-13px" type="button" onClick={x.pick}>{x.label}</button>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      {vm.sec.type.editing && (
        <div className="p-16px r-10px bd-1px-dashed-muted flex gap-20px wrap">
          <div className="flex col gap-6px">
            <label className="t-12px" htmlFor="e-dp">Display face</label>
            <select className="p-10px r-6px bd-0 bg-fill minw-180px" id="e-dp" value={vm.cur.display} onChange={vm.setDisplay}>
              {vm.fonts.map((ft, i_) => (
                <Fragment key={i_}>
                  <option value={ft}>{ft}</option>
                </Fragment>
              ))}
            </select>
          </div>
          <div className="flex col gap-6px">
            <label className="t-12px" htmlFor="e-bd">Body face</label>
            <select className="p-10px r-6px bd-0 bg-fill minw-180px" id="e-bd" value={vm.cur.body} onChange={vm.setBody}>
              {vm.fonts.map((ft, i_) => (
                <Fragment key={i_}>
                  <option value={ft}>{ft}</option>
                </Fragment>
              ))}
            </select>
          </div>
          <span className="self-flex-end t-12px c-muted">Only allowlisted Google Fonts and Fontsource families, so every pairing installs. Edits lock this section.</span>
        </div>
      )}
      <div className="two">
        <div className="relative r-10px p-22px flex col gap-8px" style={{ background: vm.cur.deep, color: vm.cur.accentText }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.typeDisplay} aria-pressed={vm.pinSel.typeDisplay} aria-label="Comment on the header typeface" />
          )}
          <span className="t-11px ls-0_06em">HEADER · {vm.cur.displayPkg}</span>
          <span className="t-34px w-600" style={{ fontFamily: `'${vm.cur.display}', sans-serif` }}>{vm.cur.display}</span>
          <span className="t-18px" style={{ fontFamily: `'${vm.cur.display}', sans-serif` }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</span>
        </div>
        <div className="relative r-10px p-22px flex col gap-8px" style={{ background: vm.cur.deep, color: vm.cur.accentText }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.typeBody} aria-pressed={vm.pinSel.typeBody} aria-label="Comment on the body typeface" />
          )}
          <span className="t-11px ls-0_06em">BODY · {vm.cur.bodyPkg}</span>
          <span className="t-34px" style={{ fontFamily: `'${vm.cur.body}', sans-serif` }}>{vm.cur.body}</span>
          <span className="t-18px" style={{ fontFamily: `'${vm.cur.body}', sans-serif` }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789</span>
        </div>
      </div>
      <div className="r-10px bd-1px-solid-line overfl-auto">
        <div className="minw-560px flex col">
          <div className="grid cols-repeat-4-minmax-0-1fr p-10px-16px t-12px c-muted bd-b-1px-solid-divider">
            <span>Level</span>
            <span>Face</span>
            <span>Size</span>
            <span>Line height</span>
          </div>
          {vm.typeScale.map((ts, i_) => (
            <Fragment key={i_}>
              <div className="grid cols-repeat-4-minmax-0-1fr p-10px-16px items-center bd-b-1px-solid-fill t-14px">
                <span style={{ fontFamily: `'${ts.face}', sans-serif`, fontSize: ts.preview }}>{ts.level}</span>
                <span>{ts.face}</span>
                <span>{ts.size}</span>
                <span>{ts.lh}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
