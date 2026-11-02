import { Fragment } from "react";
import PieceActions from "./PieceActions.jsx";

export default function VoiceSection({ vm }) {
  return (
    <section aria-labelledby="h-voice" className="flex col gap-14px smt-16px" id="sec-voice">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-voice">7. Voice and tone{vm.sec.voice.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
        <div className="flex gap-8px relative wrap">
          <button className="w-px-36px h-36px r-50pct bd-1px-solid-grey-1 p-0 flex items-center justify-center" type="button" onClick={vm.sec.voice.toggleLock} aria-pressed={vm.sec.voice.locked} aria-label={vm.sec.voice.lockAria} style={{ background: vm.sec.voice.lockBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vm.sec.voice.lockFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d={vm.sec.voice.shackle} />
            </svg>
          </button>
          <button className="p-8px-14px r-pill bg-bg t-13px flex gap-6px items-center" type="button" onClick={vm.sec.voice.regen} aria-disabled={vm.sec.voice.locked} style={{ border: `1px solid ${vm.sec.voice.regenBd}`, color: vm.sec.voice.regenFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.sec.voice.regenFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>Regenerate</button>
          <button className="p-8px-14px r-pill bd-1px-solid-grey-1 t-13px" type="button" onClick={vm.sec.voice.toggleEdit} aria-pressed={vm.sec.voice.editing} style={{ background: vm.sec.voice.editBg, color: vm.sec.voice.editFg }}>{vm.sec.voice.editLabel}</button>
        </div>
      </div>
      <div className="three">
        {vm.cur.tone.map((tn, i_) => (
          <Fragment key={i_}>
            <div className="relative p-18px flex col gap-6px bg-bg bd-1px-solid-grey-2 r-12px">
              {tn.editing && (
                <>
                  <input className="p-8px r-pill bd-1px-solid-grey-2 t-14px" value={tn.yes} onChange={tn.setYes} aria-label="Tone attribute" />
                  <input className="p-8px r-pill bd-1px-solid-grey-2 t-14px" value={tn.no} onChange={tn.setNo} aria-label="Not that" />
                </>
              )}
              <span className="t-20px w-600">{tn.yes}</span>
              <span className="t-14px c-ink-2">not {tn.no}</span>
            </div>
          </Fragment>
        ))}
      </div>
      <div className="two">
        <div className="relative p-18px r-10px bd-1px-solid-line flex col gap-6px">
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.voiceHead} aria-pressed={vm.pinSel.voiceHead} aria-label="Comment on the sample headline" />
          )}<PieceActions vm={vm} piece={vm.pieces.voiceHead} />
          <span className="t-12px c-muted">Sample headline</span>
          <span className="t-24px w-600 pr-36px" style={{ fontFamily: `'${vm.cur.display}', sans-serif` }}>{vm.cur.headline}</span>
        </div>
        <div className="relative p-18px r-10px bd-1px-solid-line flex col gap-6px">
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.voiceTone} aria-pressed={vm.pinSel.voiceTone} aria-label="Comment on the tone" />
          )}<PieceActions vm={vm} piece={vm.pieces.voiceTone} />
          <span className="t-12px c-muted">Sample interface line</span>
          <span className="t-18px pr-36px" style={{ fontFamily: `'${vm.cur.body}', sans-serif` }}>{vm.cur.micro}</span>
        </div>
      </div>
    </section>
  );
}
