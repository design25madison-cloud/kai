import { Fragment } from "react";

export default function Moodboard({ vm }) {
  return (
    <section id="sec-mood" aria-labelledby="mb-h" className="flex col gap-12px smt-16px">
      <div className="flex justify-space-between items-flex-end gap-12px wrap">
        <div className="flex col gap-2px">
          <span className="t-12px c-muted">{vm.f.name} · Moodboard · Direction, not final</span>
          <h1 className="m-0 t-28px w-600" id="mb-h">{vm.cur.label}: {vm.cur.name}</h1>
        </div>
        {!vm.presenting && <span className="t-13px c-muted">Select any tile to jump to its section.</span>}
      </div>
      <div className="bento r-14px" style={{ padding: vm.bentoPad, background: vm.bentoBg }}>
        <a className="tile relative gc-span-2 p-18px flex col justify-center items-center gap-4px" href="#sec-word" style={{ background: vm.cur.surface }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.word} aria-pressed={vm.pinSel.word} aria-label="Add to precise editing" />
          )}
          {vm.cur.locks.word && (
            <span className="absolute top-8px right-8px w-px-24px h-24px r-50pct bg-ink flex items-center justify-center" title="Locked">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
          )}
          <span className="t-12px" style={{ color: vm.cur.primary }}>{vm.cur.wordFont}</span>
          <span className="t-52px lh-1" style={{ fontFamily: `'${vm.cur.wordFont}', sans-serif`, letterSpacing: vm.cur.trackPx, color: vm.cur.primary }}>{vm.wordUpper}</span>
        </a>
        <a className="tile relative bg-track p-10px flex items-flex-end t-12px c-ink-2" href="#sec-refs">{vm.cmode && (<button className="pick" type="button" onClick={vm.pins.img0} aria-pressed={vm.pinSel.img0} aria-label="Add to precise editing" />)}{vm.cur.img0}</a>
        <a className="tile relative bg-line p-10px flex items-flex-end t-12px c-ink-2" href="#sec-refs">{vm.cmode && (<button className="pick" type="button" onClick={vm.pins.img1} aria-pressed={vm.pinSel.img1} aria-label="Add to precise editing" />)}{vm.cur.img1}</a>
        <a className="tile relative gc-span-2 gr-span-2 p-22px flex col justify-space-between" href="#sec-type" style={{ background: vm.cur.deep, color: vm.cur.accentText }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.typeDisplay} aria-pressed={vm.pinSel.typeDisplay} aria-label="Add to precise editing" />
          )}
          {vm.cur.locks.type && (
            <span className="absolute top-8px right-8px w-px-24px h-24px r-50pct bg-ink flex items-center justify-center" title="Locked">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
          )}
          <span className="flex col gap-4px">
            <span className="t-11px ls-0_06em">HEADER</span>
            <span className="t-30px w-600" style={{ fontFamily: `'${vm.cur.display}', sans-serif` }}>{vm.cur.display}</span>
            <span className="t-17px" style={{ fontFamily: `'${vm.cur.display}', sans-serif` }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
          </span>
          <span className="flex col gap-4px">
            <span className="t-11px ls-0_06em">BODY</span>
            <span className="t-17px" style={{ fontFamily: `'${vm.cur.body}', sans-serif` }}>{vm.cur.body} · abcdefghijklmnopqrstuvwxyz</span>
          </span>
        </a>
        <a className="tile relative gc-span-2 gr-span-2 p-14px flex gap-10px" href="#sec-preview" style={{ background: vm.cur.light, fontFamily: `'${vm.cur.body}', sans-serif` }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.preview} aria-pressed={vm.pinSel.preview} aria-label="Add to precise editing" />
          )}
          <span className="w-px-70px r-6px flex-none" style={{ background: vm.cur.surface }} />
          <span className="flex-1 flex col gap-8px minw-0">
            <span className="flex justify-space-between items-center">
              <span className="t-13px w-600" style={{ color: vm.cur.ink }}>Dashboard</span>
              <span className="t-11px p-4px-8px r-5px c-bg" style={{ background: vm.cur.ui }}>New report</span>
            </span>
            <span className="flex gap-6px">
              <span className="flex-1 h-44px r-5px" style={{ background: vm.cur.surface }} />
              <span className="flex-1 h-44px r-5px" style={{ background: vm.cur.primary }} />
              <span className="flex-1 h-44px r-5px" style={{ background: vm.cur.surface }} />
            </span>
            <span className="flex-1 r-6px flex items-flex-end gap-6px p-8px" style={{ background: vm.cur.card }}>
              {vm.bars.map((bar, i_) => (
                <Fragment key={i_}>
                  <span className="flex-1 r-2px" style={{ height: bar.h, background: bar.c }} />
                </Fragment>
              ))}
            </span>
          </span>
        </a>
        <a className="tile relative gc-span-2 flex gap-6px bg-transparent" href="#sec-palette">
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.palUsage} aria-pressed={vm.pinSel.palUsage} aria-label="Add to precise editing" />
          )}
          {vm.cur.colors.map((c, i_) => (
            <Fragment key={i_}>
              <span className="r-8px flex items-flex-end p-8px t-11px" style={{ flex: c.ratio, background: c.show, color: c.label }}>{c.show}</span>
            </Fragment>
          ))}
          {vm.cur.locks.palette && (
            <span className="absolute top-8px right-8px w-px-24px h-24px r-50pct bg-ink flex items-center justify-center" title="Locked">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
          )}
        </a>
        <a className="tile relative p-16px flex col justify-center gap-10px items-flex-start" href="#sec-ui" style={{ background: vm.cur.surface }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.ui} aria-pressed={vm.pinSel.ui} aria-label="Add to precise editing" />
          )}
          {vm.cur.locks.ui && (
            <span className="absolute top-8px right-8px w-px-24px h-24px r-50pct bg-ink flex items-center justify-center" title="Locked">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
          )}
          <span className="t-12px" style={{ color: vm.cur.ink }}>UI primary</span>
          <span className="p-9px-14px r-6px c-bg t-13px w-600" style={{ background: vm.cur.ui }}>Button</span>
          <span className="t-12px" style={{ color: vm.cur.ink }}>{vm.cur.uiRatio}:1 with white text</span>
        </a>
        <a className="tile relative bg-fill p-16px flex col justify-center gap-6px" href="#sec-voice">
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.voiceTone} aria-pressed={vm.pinSel.voiceTone} aria-label="Add to precise editing" />
          )}
          {vm.cur.locks.voice && (
            <span className="absolute top-8px right-8px w-px-24px h-24px r-50pct bg-ink flex items-center justify-center" title="Locked">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
          )}
          {vm.cur.tone.map((tn, i_) => (
            <Fragment key={i_}>
              <span className="t-14px"><strong>{tn.yes}</strong>, not {tn.no}</span>
            </Fragment>
          ))}
        </a>
        <a className={`tile relative gr-span-2 bg-line p-10px flex items-flex-end t-12px c-ink-2${vm.presenting ? " gc-span-2" : ""}`} href="#sec-refs">{vm.cmode && (<button className="pick" type="button" onClick={vm.pins.img2} aria-pressed={vm.pinSel.img2} aria-label="Add to precise editing" />)}{vm.cur.img2}</a>
        <a className={`tile relative gr-span-2 bg-track p-10px flex items-flex-end t-12px c-ink-2${vm.presenting ? " gc-span-2" : ""}`} href="#sec-refs">{vm.cmode && (<button className="pick" type="button" onClick={vm.pins.img3} aria-pressed={vm.pinSel.img3} aria-label="Add to precise editing" />)}{vm.cur.img3}</a>
        {!vm.presenting && (
        <section className="rec gc-span-2 gr-span-2 r-10px bg-fill-subtle bd-1px-solid-line p-18px-20px flex col gap-10px" aria-labelledby="why-h">
          <span className="flex gap-6px items-center t-12px c-ink-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.6L18.5 9l-4.7 1.6L12 15l-1.8-4.4L5.5 9l4.7-1.4z" /><path d="M18 15l.8 2 2 .8-2 .8L18 21l-.8-2.4-2-.8 2-.8z" /></svg>AI recommendation</span>
          <h2 className="m-0 t-18px w-600" id="why-h">{vm.whyTitle}</h2>
          <p className="m-0 t-14px lh-1_55">{vm.cur.reason}</p>
          <div className="flex gap-6px wrap items-center">
            <span className="t-12px c-muted">{vm.matchLabel}</span>
            {vm.cur.match.map((m, i_) => (
              <Fragment key={i_}>
                <span className="t-12px p-2px-9px r-9px bg-bg bd-1px-solid-faint">{m}</span>
              </Fragment>
            ))}
          </div>
          <p className="m-0 t-13px lh-1_5 c-ink-2"><strong>Trade-off:</strong> {vm.cur.tradeoff}</p>
          {vm.hasFollowNote && (
            <p className="m-0 t-12px lh-1_5 c-ink-2 bd-t-1px-solid-line pt-10px"><strong>From your uploads:</strong> {vm.followNote} {vm.contextNote}</p>
          )}
        </section>
        )}
      </div>
      <p className="m-0 t-13px lh-1_5 c-ink-2"><strong>Brief:</strong> {vm.f.desc} <strong>Core problem:</strong> {vm.f.problem}</p>
    </section>
  );
}
