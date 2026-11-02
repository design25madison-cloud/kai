import { Fragment } from "react";

export default function StepBranding({ vm }) {
  return (
    <div className="flex col gap-24px">
      <h2 className="m-0 t-22px w-600">Branding</h2>
      <div className="flex col gap-6px">
        <div className="flex justify-space-between items-center">
          <label className="t-13px flex gap-8px items-center" htmlFor="f-meaning">Name meaning, metaphor, or origin{vm.badge && (<span className="status-pill">{vm.badgeText}</span>)}</label>
        </div>
        <textarea className="p-12px r-8px bd-1px-solid-grey-2 bg-bg resize-vertical" id="f-meaning" name="meaning" value={vm.f.meaning} onChange={vm.onField} rows="2" placeholder="Where does the name come from?" />
      </div>
      <div className="flex col gap-8px">
        <span className="t-13px">Working taglines or directions (optional)</span>
        {vm.taglines.map((t, i_) => (
          <Fragment key={i_}>
            <div className="flex gap-8px">
              <input className="flex-1 p-10px-12px r-pill bd-1px-solid-grey-2 bg-bg" value={t.text} onChange={t.set} aria-label="Tagline" placeholder=" " />
              <button className="w-px-40px h-40px r-50pct bd-1px-solid-grey-1 bg-bg p-0 flex items-center justify-center" type="button" onClick={t.remove} aria-label="Remove tagline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </Fragment>
        ))}
        <button className="self-flex-start p-8px-12px r-pill bd-1px-dashed-grey-2 bg-bg t-14px" type="button" onClick={vm.addTagline}>Add tagline</button>
      </div>
      <div className="flex col gap-8px">
        <span className="t-13px">Desired look and feel: pick one from each pair</span>
        <div className="two">
          {vm.lookPairs.map((lp, i_) => (
            <Fragment key={i_}>
              <div className="flex gap-8px">
                <button className="flex-1 h-72px r-12px bg-bg t-14px" type="button" onClick={lp.pickA} aria-pressed={lp.onA} style={{ border: `2px solid ${lp.bdA}` }}>{lp.a}</button>
                <button className="flex-1 h-72px r-12px bg-bg t-14px" type="button" onClick={lp.pickB} aria-pressed={lp.onB} style={{ border: `2px solid ${lp.bdB}` }}>{lp.b}</button>
              </div>
            </Fragment>
          ))}
        </div>
        <label className="t-12px c-muted" htmlFor="f-lookNote">Anything else about the look? (optional)</label>
        <input className="p-10px-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-lookNote" name="lookNote" value={vm.f.lookNote} onChange={vm.onField} placeholder=" " />
      </div>
      <div className="flex col gap-8px">
        <label className="t-13px" htmlFor="f-colorDir">Color direction</label>
        <input className="p-10px-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-colorDir" name="colorDir" value={vm.f.colorDir} onChange={vm.onField} placeholder="For example: warm earth tones with one bright accent" />
      </div>
      <div className="flex col gap-8px">
        <span className="t-13px">Colors to avoid</span>
        <div className="flex gap-10px wrap items-stretch">
          {vm.avoidColors.map((ac, i_) => (
            <Fragment key={i_}>
              <div className="flex col gap-4px w-px-72px">
                <div className="h-56px r-8px bd-1px-solid-line" style={{ background: ac.hex }} />
                <div className="flex justify-space-between items-center gap-4px">
                  <span className="t-11px ff-monospace">{ac.hex}</span>
                  <button className="w-px-22px h-22px bd-0 r-4px bg-none flex items-center justify-center p-0" type="button" onClick={ac.remove} aria-label={ac.aria}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>
            </Fragment>
          ))}
          <button className="w-px-72px h-56px r-8px bd-1px-dashed-grey-2 bg-bg t-12px flex col items-center justify-center gap-2px" type="button" onClick={vm.openPicker} aria-expanded={vm.pk.open}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Add color</button>
        </div>
        {vm.pk.open && (
          <div className="p-18px r-12px bd-1px-solid-line flex gap-24px wrap items-center">
            <div className="relative w-px-200px h-200px flex-none">
              <button className="w-px-200px h-200px r-50pct bd-0 p-0 bg-radial-gradient-closest-side-hsl-0-0pct-50pct-transparent-conic-gradient-from-0deg-hsl-0-100pct-50pct-hsl-60-100pct-50pct-hsl-120-100pct-50pct-hsl-180-100pct-50pct-hsl-240-100pct-50pct-hsl-300-100pct-50pct-hsl-360-100pct-50pct cursor-crosshair" type="button" onClick={vm.pickWheel} aria-label="Color wheel: click to pick a hue and saturation" />
              <span className="absolute w-px-16px h-16px m-8px-0-0--8px r-50pct bd-2px-solid-bg shadow-0-0-0-1px-ink pointe-none" aria-hidden="true" style={{ left: vm.pk.x, top: vm.pk.y, background: vm.pk.hex }} />
            </div>
            <div className="flex col gap-12px minw-220px flex-1">
              <div className="flex gap-12px items-center">
                <div className="w-px-64px h-64px r-8px bd-1px-solid-line" style={{ background: vm.pk.hex }} />
                <div className="flex col gap-4px">
                  <label className="t-12px" htmlFor="pk-hex">Hex</label>
                  <input className="w-px-120px p-8px r-pill bd-1px-solid-grey-2 ff-monospace t-14px" id="pk-hex" value={vm.pk.hexText} onChange={vm.setPickHex} placeholder=" " />
                </div>
              </div>
              <div className="flex col gap-4px">
                <label className="t-12px" htmlFor="pk-l">Lightness: {vm.pk.l}%</label>
                <input className="accent-ink" id="pk-l" type="range" min="5" max="95" value={vm.pk.l} onChange={vm.setPickL} />
              </div>
              <div className="flex gap-8px">
                <button className="p-10px-16px r-pill bd-0 bg-action c-bg t-14px w-600" type="button" onClick={vm.addPicked}>Add to avoid list</button>
                <button className="p-10px-16px r-pill bd-1px-solid-grey-1 bg-bg t-14px" type="button" onClick={vm.closePicker}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        <span className="t-13px mt-6px">Graphical treatments to avoid</span>
        <div className="flex gap-8px wrap">
          {vm.treatChips.map((c, i_) => (
            <Fragment key={i_}>
              <button className="p-8px-14px r-pill bd-1px-solid-grey-1 t-14px" type="button" onClick={c.toggle} aria-pressed={c.on} style={{ background: c.bg, color: c.fg }}>{c.label}</button>
            </Fragment>
          ))}
        </div>
        <label className="t-13px mt-6px" htmlFor="f-avoidOther">Words or visuals to avoid</label>
        <input className="p-10px-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-avoidOther" name="avoidOther" value={vm.f.avoidOther} onChange={vm.onField} placeholder="For example: rugged, hard hats, handshake photos" />
      </div>
      <div className="two">
        {vm.brandGroups.map((bg, i_) => (
          <Fragment key={i_}>
            <div className="flex col gap-8px">
              <label className="t-13px" htmlFor={bg.inputId}>{bg.title}</label>
              <div className="flex gap-8px">
                <input className="flex-1 p-10px-12px r-pill bd-1px-solid-grey-2 bg-bg" id={bg.inputId} name={bg.field} value={bg.value} onChange={vm.onField} placeholder="Search for a brand" />
                <button className="p-8px-14px r-pill bd-1px-solid-grey-1 bg-bg t-14px" type="button" onClick={bg.add}>Add</button>
              </div>
              {bg.hasSugg && (
                <div className="flex gap-6px wrap">
                  {bg.sugg.map((sg, i_) => (
                    <Fragment key={i_}>
                      <button className="p-6px-10px r-pill bd-1px-solid-faint bg-bg t-13px" type="button" onClick={sg.pick}>{sg.label}</button>
                    </Fragment>
                  ))}
                </div>
              )}
              {bg.cards.map((b, i_) => (
                <Fragment key={i_}>
                  <div className="p-10px-12px flex col gap-6px bg-bg bd-1px-solid-grey-2 r-12px">
                    <div className="flex justify-space-between items-center">
                      <span className="t-14px w-600">{b.name}</span>
                      <button className="w-px-26px h-26px bd-0 r-4px bg-bg p-0 flex items-center justify-center" type="button" onClick={b.remove} aria-label={b.aria}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>
                    <input className="p-8px-10px r-pill bd-1px-solid-grey-2 bg-bg t-13px" value={b.why} onChange={b.setWhy} aria-label={b.whyAria} placeholder="Why?" />
                  </div>
                </Fragment>
              ))}
            </div>
          </Fragment>
        ))}
      </div>
      <div className="flex col gap-8px">
        <span className="t-13px">Image references</span>
        <button className="dropzone" type="button" onClick={vm.addRefs}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
          </svg>
          Add images
        </button>
        {vm.refsAdded && (
          <div className="ref-grid">
            {vm.refCards.map((r) => (
              <div key={r.label} className="flex col gap-6px">
                <div className="ref-card">
                  {r.label}
                  <button className="ref-card__remove" type="button" onClick={r.remove} aria-label={r.removeAria}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                <button className="p-6px r-pill bd-1px-solid-grey-1 t-12px" type="button" onClick={r.toggle} aria-pressed={r.avoid} style={{ background: r.bg, color: r.fg }}>{r.tag}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
