import { Fragment } from "react";
import KaiLogo from "./KaiLogo.jsx";

export default function StartScreen({ vm }) {
  return (
    <div className="maxw-680px m-0-auto p-96px-24px-80px flex col gap-28px">
      <KaiLogo className="page-logo" />
      <button className="link-btn self-flex-start" type="button" onClick={vm.backToWelcome}>Back</button>
      <div className="flex col gap-8px">
        <h1 className="m-0 t-32px lh-1_2">Start a brand direction</h1>
        <p className="m-0 c-muted t-16px lh-1_5">Add anything you already have. None of it is required.</p>
      </div>
      <div className="flex col gap-10px">
        <button className="r-10px bd-2px-dashed-faint bg-fill flex col items-center justify-center gap-6px" type="button" onClick={vm.addArts} style={{ height: vm.uploadH }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
          </svg>
          <span className="t-15px w-600">{vm.uploadTitle}</span>
          <span className="t-13px c-muted">Brief, logo, deck, screenshots, fonts, mood images, or a meeting transcript. Click to add samples.</span>
        </button>
        {vm.hasArts && (
          <div className="flex gap-8px wrap">
            {vm.arts.map((a, i_) => (
              <Fragment key={i_}>
                <span className="flex gap-8px items-center p-6px-6px-6px-8px r-8px bd-1px-solid-line t-13px"><span className="t-9px w-600 p-3px-5px r-4px bg-fill">{a.kind}</span>{a.name} <button className="w-px-22px h-22px r-5px bd-0 bg-fill p-0 flex items-center justify-center" type="button" onClick={a.remove} aria-label={a.removeAria}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button></span>
              </Fragment>
            ))}
          </div>
        )}
      </div>
      {vm.hasArts && (
        <>
          <section className="flex col gap-10px" aria-labelledby="op-h">
            <div className="flex col gap-4px">
              <h2 className="m-0 t-18px w-600" id="op-h">What do you think of what you have?</h2>
              <span className="t-14px c-muted">Say what to keep and what to change. Talk or type, in your own words.</span>
            </div>
            <div className="r-12px bd-1px-solid-ink of-hidden">
              {vm.oRec && (
                <p className="m-0 minh-96px p-14px t-15px lh-1_5 bg-fill-subtle" role="status" aria-live="polite">{vm.oLive}</p>
              )}
              {vm.oIdle && (
                <textarea className="block w-px-100pct p-14px bd-0 resize-vertical t-15px lh-1_5" value={vm.opinion} onChange={vm.setOpinion} rows="4" aria-label="Your thoughts on what you uploaded" placeholder="For example: I like the warm brown in the logo, but the letters feel too techy." />
              )}
              <div className="flex gap-10px items-center p-10px-12px bd-t-1px-solid-divider bg-bg">
                <button className="w-px-40px h-40px r-50pct bd-0 p-0 flex items-center justify-center flex-none" type="button" onClick={vm.toggleOpinionVoice} aria-pressed={vm.oRec} aria-label={vm.oMicAria} style={{ background: vm.oMicBg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                </button>
                <span className="t-13px c-ink-2 flex-1">{vm.oMicText}</span>
                {vm.oStarters.map((os, i_) => (
                  <Fragment key={i_}>
                    <button className="p-4px-10px r-12px bd-1px-dashed-muted bg-bg t-12px" type="button" onClick={os.add}>+ {os.label}</button>
                  </Fragment>
                ))}
              </div>
            </div>
            {vm.hasHeard && (
              <span className="t-13px c-ink p-8px-12px r-8px bg-fill-subtle bd-l-2px-solid-ink">We heard: {vm.heardText}</span>
            )}
          </section>
          <section className="flex col gap-12px" aria-labelledby="keep-h">
            <div className="flex col gap-4px">
              <h2 className="m-0 t-18px w-600" id="keep-h">How much should we keep?</h2>
              <span className="t-14px c-muted">Drag the dial or pick a stop.</span>
            </div>
            <div className="p-18px-18px-14px r-12px bg-fill-subtle flex col gap-12px">
              <div className="flex justify-space-between t-13px w-600">
                <span>Keep what I have</span>
                <span>Start fresh</span>
              </div>
              <div className="relative h-28px flex items-center">
                <div className="absolute left-0 right-0 h-8px r-4px bg-track" />
                <div className="absolute left-0 h-8px r-4px bg-action" style={{ width: vm.keepPct }} />
                <input className="dial relative w-px-100pct m-0" type="range" min="0" max="100" value={vm.keep} onChange={vm.setKeep} aria-label="How much to keep, from keep what I have to start fresh" aria-valuetext={vm.keepName} />
              </div>
              <div className="grid cols-repeat-4-minmax-0-1fr gap-6px" role="group" aria-label="Stops">
                {vm.keepStops.map((ks, i_) => (
                  <Fragment key={i_}>
                    <button className="p-7px-6px r-pill t-12px" type="button" onClick={ks.pick} aria-pressed={ks.on} style={{ border: `1px solid ${ks.bd}`, background: ks.bg, color: ks.fg }}>{ks.label}</button>
                  </Fragment>
                ))}
              </div>
              <p className="m-0 t-14px lh-1_5"><strong>{vm.keepName}.</strong> {vm.keepDesc}</p>
            </div>
          </section>
        </>
      )}
      <div className="flex justify-flex-end">
        <button className="p-12px-22px r-pill bd-0 bg-action c-bg w-600" type="button" onClick={vm.toBrief}>Continue</button>
      </div>
    </div>
  );
}
