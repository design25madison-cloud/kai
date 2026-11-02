import { Fragment } from "react";
import PieceActions from "./PieceActions.jsx";
import RefImage, { RefCredit } from "./RefImage.jsx";

export default function ImagerySection({ vm }) {
  return (
    <section aria-labelledby="h-refs" className="flex col gap-14px smt-16px" id="sec-refs">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-refs">5. Reference imagery{vm.sec.refs.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
        <div className="flex gap-8px relative wrap">
          <button className="w-px-36px h-36px r-50pct bd-1px-solid-grey-1 p-0 flex items-center justify-center" type="button" onClick={vm.sec.refs.toggleLock} aria-pressed={vm.sec.refs.locked} aria-label={vm.sec.refs.lockAria} style={{ background: vm.sec.refs.lockBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vm.sec.refs.lockFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d={vm.sec.refs.shackle} />
            </svg>
          </button>
          <button className="p-8px-14px r-pill bg-bg t-13px flex gap-6px items-center" type="button" onClick={vm.sec.refs.regen} aria-disabled={vm.sec.refs.locked} style={{ border: `1px solid ${vm.sec.refs.regenBd}`, color: vm.sec.refs.regenFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.sec.refs.regenFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>Regenerate</button>
          <button className="p-8px-14px r-pill bd-1px-solid-grey-1 t-13px" type="button" onClick={vm.sec.refs.toggleEdit} aria-pressed={vm.sec.refs.editing} style={{ background: vm.sec.refs.editBg, color: vm.sec.refs.editFg }}>{vm.sec.refs.editLabel}</button>
        </div>
      </div>
      <div className="three">
        {vm.cur.imageCards.map((im, i_) => (
          <Fragment key={i_}>
            <div className="flex col gap-6px">
              <div className="relative ar-4-3 r-10px bg-track flex items-flex-end justify-space-between p-16px t-13px c-ink-2 of-hidden" style={{ border: `2px solid ${im.pinBd}` }}>
                {vm.cmode && (
                  <button className="pick" type="button" onClick={im.pinC} aria-pressed={im.picked} aria-label={im.pinAria} />
                )}<PieceActions vm={vm} piece={{ label: im.label, locked: im.locked, toggleLock: im.pin, comment: im.pinC }} />
                <RefImage label={im.label} />
              </div>
              <RefCredit label={im.label} />
              {vm.sec.refs.editing && (
                <button className="p-7px r-pill bd-1px-solid-grey-1 bg-bg t-12px" type="button" onClick={im.swap}>Swap</button>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
