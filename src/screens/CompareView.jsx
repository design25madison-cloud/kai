import { Fragment } from "react";

export default function CompareView({ vm }) {
  return (
    <div className="maxw-1200px m-0-auto p-28px-24px-120px flex col gap-20px">
      <div className="flex col gap-6px">
        <h1 className="m-0 t-28px">Compare the three directions</h1>
      </div>
      <div className="overfl-auto bd-1px-solid-line r-12px">
        <div className="minw-960px grid cols-150px-repeat-3-minmax-0-1fr">
          <div className="p-16px" />
          {vm.cols.map((col, i_) => (
            <Fragment key={i_}>
              <div className="p-16px bd-l-1px-solid-divider flex col gap-6px items-flex-start">
                <span className="t-12px c-muted">{col.label}</span>
                <span className="t-17px w-600">{col.name}</span>
                {col.rec && (
                  <span className="t-11px p-2px-8px r-9px bg-ink c-bg">Recommended</span>
                )}
                <button className="mt-4px p-6px-12px r-pill bd-1px-solid-grey-1 bg-bg t-12px" type="button" onClick={col.open}>Open this direction</button>
              </div>
            </Fragment>
          ))}
          <div className="p-16px bd-t-1px-solid-divider t-13px w-600">Wordmark</div>
          {vm.cols.map((col, i_) => (
            <Fragment key={i_}>
              <div className="p-16px bd-t-1px-solid-divider bd-l-1px-solid-divider flex col gap-10px minw-0">
                <div className="h-90px r-8px flex items-center justify-center" style={{ background: col.surface }}>
                  <span className="t-30px" style={{ fontFamily: `'${col.wordFont}', sans-serif`, letterSpacing: col.trackPx, color: col.primary }}>{vm.wordUpper}</span>
                </div>
                <span className="t-12px c-ink-2">{col.wordFont}, {col.trackPx} spacing</span>
                <button className="self-flex-start p-6px-12px r-pill bd-1px-solid-grey-1 t-12px" type="button" onClick={col.pk.word.pick} aria-pressed={col.pk.word.on} style={{ background: col.pk.word.bg, color: col.pk.word.fg }}>{col.pk.word.label}</button>
              </div>
            </Fragment>
          ))}
          <div className="p-16px bd-t-1px-solid-divider t-13px w-600">Palette</div>
          {vm.cols.map((col, i_) => (
            <Fragment key={i_}>
              <div className="p-16px bd-t-1px-solid-divider bd-l-1px-solid-divider flex col gap-10px minw-0">
                <div className="flex h-48px r-6px of-hidden">
                  {col.colors.map((c, i_) => (
                    <Fragment key={i_}>
                      <span style={{ flex: c.ratio, background: c.show }} />
                    </Fragment>
                  ))}
                </div>
                <span className="t-12px c-ink-2">{col.palNames}</span>
                <button className="self-flex-start p-6px-12px r-pill bd-1px-solid-grey-1 t-12px" type="button" onClick={col.pk.palette.pick} aria-pressed={col.pk.palette.on} style={{ background: col.pk.palette.bg, color: col.pk.palette.fg }}>{col.pk.palette.label}</button>
              </div>
            </Fragment>
          ))}
          <div className="p-16px bd-t-1px-solid-divider t-13px w-600">UI primary</div>
          {vm.cols.map((col, i_) => (
            <Fragment key={i_}>
              <div className="p-16px bd-t-1px-solid-divider bd-l-1px-solid-divider flex col gap-10px minw-0">
                <span className="self-flex-start p-8px-14px r-6px c-bg t-13px" style={{ background: col.ui }}>Button</span>
                <span className="t-12px c-ink-2">{col.uiRatio}:1 · {col.passLabel}. Comes with the palette.</span>
              </div>
            </Fragment>
          ))}
          <div className="p-16px bd-t-1px-solid-divider t-13px w-600">Typography</div>
          {vm.cols.map((col, i_) => (
            <Fragment key={i_}>
              <div className="p-16px bd-t-1px-solid-divider bd-l-1px-solid-divider flex col gap-10px minw-0">
                <span className="t-22px w-600" style={{ fontFamily: `'${col.display}', sans-serif` }}>{col.display}</span>
                <span className="t-14px" style={{ fontFamily: `'${col.body}', sans-serif` }}>{col.body} for body text</span>
                <button className="self-flex-start p-6px-12px r-pill bd-1px-solid-grey-1 t-12px" type="button" onClick={col.pk.type.pick} aria-pressed={col.pk.type.on} style={{ background: col.pk.type.bg, color: col.pk.type.fg }}>{col.pk.type.label}</button>
              </div>
            </Fragment>
          ))}
          <div className="p-16px bd-t-1px-solid-divider t-13px w-600">Imagery</div>
          {vm.cols.map((col, i_) => (
            <Fragment key={i_}>
              <div className="p-16px bd-t-1px-solid-divider bd-l-1px-solid-divider flex col gap-10px minw-0">
                <div className="grid cols-repeat-3-minmax-0-1fr gap-6px">
                  {col.imgTop.map((im, i_) => (
                    <Fragment key={i_}>
                      <span className="ar-1 r-6px bg-track t-10px p-6px flex items-flex-end c-ink-2">{im.label}</span>
                    </Fragment>
                  ))}
                </div>
                <button className="self-flex-start p-6px-12px r-pill bd-1px-solid-grey-1 t-12px" type="button" onClick={col.pk.refs.pick} aria-pressed={col.pk.refs.on} style={{ background: col.pk.refs.bg, color: col.pk.refs.fg }}>{col.pk.refs.label}</button>
              </div>
            </Fragment>
          ))}
          <div className="p-16px bd-t-1px-solid-divider t-13px w-600">Voice</div>
          {vm.cols.map((col, i_) => (
            <Fragment key={i_}>
              <div className="p-16px bd-t-1px-solid-divider bd-l-1px-solid-divider flex col gap-10px minw-0">
                {col.tone.map((tn, i_) => (
                  <Fragment key={i_}>
                    <span className="t-13px"><strong>{tn.yes}</strong>, not {tn.no}</span>
                  </Fragment>
                ))}
                <span className="t-15px w-600" style={{ fontFamily: `'${col.display}', sans-serif` }}>{col.headline}</span>
                <button className="self-flex-start p-6px-12px r-pill bd-1px-solid-grey-1 t-12px" type="button" onClick={col.pk.voice.pick} aria-pressed={col.pk.voice.on} style={{ background: col.pk.voice.bg, color: col.pk.voice.fg }}>{col.pk.voice.label}</button>
              </div>
            </Fragment>
          ))}
          <div className="p-16px bd-t-1px-solid-divider t-13px w-600">Fit to your brief</div>
          {vm.cols.map((col, i_) => (
            <Fragment key={i_}>
              <div className="p-16px bd-t-1px-solid-divider bd-l-1px-solid-divider flex col gap-10px minw-0">
                <div className="flex gap-6px wrap">
                  {col.match.map((m, i_) => (
                    <Fragment key={i_}>
                      <span className="t-11px p-2px-8px r-9px bd-1px-solid-faint">{m}</span>
                    </Fragment>
                  ))}
                </div>
                <span className="t-12px c-ink-2 lh-1_45">{col.tradeoff}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="sticky bottom-16px p-16px-18px r-12px bg-ink c-bg flex gap-16px items-center wrap">
        <span className="flex-1 minw-240px t-14px lh-1_5"><strong>Your mix:</strong> {vm.mixSummary}</span>
        <button className="p-10px-16px r-pill bd-0 bg-bg c-ink t-14px w-600" type="button" onClick={vm.createMix}>{vm.mixBtn}</button>
      </div>
    </div>
  );
}
