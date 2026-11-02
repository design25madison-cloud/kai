import { Fragment } from "react";

export default function ImagerySection({ vm }) {
  return (
    <section aria-labelledby="h-refs" className="flex col gap-14px smt-16px" id="sec-refs">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-refs">5. Reference imagery{vm.sec.refs.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
        <div className="flex gap-8px relative wrap">
          <button className="w-px-36px h-36px r-8px bd-1px-solid-ink p-0 flex items-center justify-center" type="button" onClick={vm.sec.refs.toggleLock} aria-pressed={vm.sec.refs.locked} aria-label={vm.sec.refs.lockAria} style={{ background: vm.sec.refs.lockBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vm.sec.refs.lockFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d={vm.sec.refs.shackle} />
            </svg>
          </button>
          <button className="p-8px-14px r-8px bg-bg t-13px flex gap-6px items-center" type="button" onClick={vm.sec.refs.regen} aria-disabled={vm.sec.refs.locked} style={{ border: `1px solid ${vm.sec.refs.regenBd}`, color: vm.sec.refs.regenFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.sec.refs.regenFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>Regenerate</button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink t-13px" type="button" onClick={vm.sec.refs.toggleEdit} aria-pressed={vm.sec.refs.editing} style={{ background: vm.sec.refs.editBg, color: vm.sec.refs.editFg }}>{vm.sec.refs.editLabel}</button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink bg-bg t-13px" type="button" onClick={vm.sec.refs.toggleExport} aria-expanded={vm.sec.refs.exportOpen}>Export</button>
          {vm.sec.refs.exportOpen && (
            <div className="absolute right-0 top-42px z-4 w-px-220px bg-bg bd-1px-solid-line r-10px p-6px flex col">
              {vm.sec.refs.formats.map((x, i_) => (
                <Fragment key={i_}>
                  <button className="ta-left p-9px-10px bd-0 r-6px bg-bg t-13px" type="button" onClick={x.pick}>{x.label}</button>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      <span className="t-13px c-muted">Lock the images you like. Regenerate swaps only unlocked images, using searches that fit {vm.cur.name}.</span>
      <div className="three">
        {vm.cur.imageCards.map((im, i_) => (
          <Fragment key={i_}>
            <div className="flex col gap-6px">
              <div className="relative ar-4-3 r-10px bg-track flex items-flex-end justify-space-between p-10px t-13px c-ink-2" style={{ border: `2px solid ${im.pinBd}` }}>
                {vm.cmode && (
                  <button className="pick" type="button" onClick={im.pinC} aria-pressed={im.picked} aria-label={im.pinAria} />
                )}
                <span>{im.label}</span>
                <span className="t-11px">{im.pinText}</span>
              </div>
              <span className="t-12px c-ink-2">{im.source} · Moodboard only, not licensed for use</span>
              <div className="flex gap-6px">
                <button className="flex-1 p-7px r-6px bd-1px-solid-ink bg-bg t-12px" type="button" onClick={im.pin}>{im.pinAction}</button>
                {vm.sec.refs.editing && (
                  <button className="flex-1 p-7px r-6px bd-1px-solid-ink bg-bg t-12px" type="button" onClick={im.swap}>Swap</button>
                )}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
