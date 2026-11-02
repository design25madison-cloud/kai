import { Fragment } from "react";

export default function WordmarkSection({ vm }) {
  return (
    <section aria-labelledby="h-word" className="flex col gap-14px smt-16px" id="sec-word">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-word">1. Wordmark{vm.sec.word.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
        <div className="flex gap-8px relative wrap">
          <button className="w-px-36px h-36px r-8px bd-1px-solid-ink p-0 flex items-center justify-center" type="button" onClick={vm.sec.word.toggleLock} aria-pressed={vm.sec.word.locked} aria-label={vm.sec.word.lockAria} style={{ background: vm.sec.word.lockBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vm.sec.word.lockFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d={vm.sec.word.shackle} />
            </svg>
          </button>
          <button className="p-8px-14px r-8px bg-bg t-13px flex gap-6px items-center" type="button" onClick={vm.sec.word.regen} aria-disabled={vm.sec.word.locked} style={{ border: `1px solid ${vm.sec.word.regenBd}`, color: vm.sec.word.regenFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.sec.word.regenFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>Regenerate</button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink t-13px" type="button" onClick={vm.sec.word.toggleEdit} aria-pressed={vm.sec.word.editing} style={{ background: vm.sec.word.editBg, color: vm.sec.word.editFg }}>{vm.sec.word.editLabel}</button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink bg-bg t-13px" type="button" onClick={vm.sec.word.toggleExport} aria-expanded={vm.sec.word.exportOpen}>Export</button>
          {vm.sec.word.exportOpen && (
            <div className="absolute right-0 top-42px z-4 w-px-220px bg-bg bd-1px-solid-line r-10px p-6px flex col">
              {vm.sec.word.formats.map((x, i_) => (
                <Fragment key={i_}>
                  <button className="ta-left p-9px-10px bd-0 r-6px bg-bg t-13px" type="button" onClick={x.pick}>{x.label}</button>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      {vm.sec.word.editing && (
        <div className="p-16px r-10px bd-1px-dashed-muted flex gap-20px wrap items-flex-end">
          <div className="flex col gap-6px">
            <label className="t-12px" htmlFor="e-wf">Typeface</label>
            <select className="p-10px r-6px bd-0 bg-fill minw-180px" id="e-wf" value={vm.cur.wordFont} onChange={vm.setWordFont}>
              {vm.fonts.map((ft, i_) => (
                <Fragment key={i_}>
                  <option value={ft}>{ft}</option>
                </Fragment>
              ))}
            </select>
          </div>
          <div className="flex col gap-6px minw-220px">
            <label className="t-12px" htmlFor="e-tr">Letter spacing: {vm.cur.trackPx}</label>
            <input className="accent-ink" id="e-tr" type="range" min="0" max="20" value={vm.cur.track} onChange={vm.setTrack} />
          </div>
          <span className="t-12px c-muted">Edits lock this section, so regenerating keeps them.</span>
        </div>
      )}
      <div className="two">
        <div className="relative h-200px r-10px flex col items-center justify-center gap-6px" style={{ background: vm.cur.surface }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.word} aria-pressed={vm.pinSel.word} aria-label="Comment on the wordmark" />
          )}
          <span className="t-12px" style={{ color: vm.cur.primary }}>{vm.cur.wordFont}</span>
          <span className="t-64px" style={{ fontFamily: `'${vm.cur.wordFont}', sans-serif`, letterSpacing: vm.cur.trackPx, color: vm.cur.primary }}>{vm.wordUpper}</span>
        </div>
        <div className="relative h-200px r-10px flex items-center justify-center" style={{ background: vm.cur.deep }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.wordDark} aria-pressed={vm.pinSel.wordDark} aria-label="Comment on the wordmark on dark" />
          )}
          <span className="t-64px" style={{ fontFamily: `'${vm.cur.wordFont}', sans-serif`, letterSpacing: vm.cur.trackPx, color: vm.cur.onDeep }}>{vm.wordUpper}</span>
        </div>
        <div className="h-120px r-10px bd-1px-solid-line flex items-center justify-center gap-24px" style={{ background: vm.cur.card }}>
          <span className="t-22px" style={{ fontFamily: `'${vm.cur.wordFont}', sans-serif`, letterSpacing: vm.cur.trackPx, color: vm.cur.primary }}>{vm.wordUpper}</span>
          <span className="t-14px" style={{ fontFamily: `'${vm.cur.wordFont}', sans-serif`, letterSpacing: vm.cur.trackPx, color: vm.cur.primary }}>{vm.wordUpper}</span>
          <span className="t-12px" style={{ color: vm.cur.ink }}>small sizes</span>
        </div>
        <div className="h-120px r-10px bd-1px-solid-line of-hidden flex col">
          <div className="bg-fill p-8px-12px flex gap-10px items-center">
            <span className="w-px-10px h-10px r-50pct bg-line-strong" />
            <span className="flex-1 bg-bg r-6px p-5px-10px t-12px c-ink-2">{vm.domainShown}</span>
          </div>
          <div className="flex-1 flex items-center p-0-16px" style={{ background: vm.cur.light }}>
            <span className="t-22px" style={{ fontFamily: `'${vm.cur.wordFont}', sans-serif`, letterSpacing: vm.cur.trackPx, color: vm.cur.primary }}>{vm.wordUpper}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
