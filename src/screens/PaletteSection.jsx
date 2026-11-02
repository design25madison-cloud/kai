import { Fragment } from "react";

export default function PaletteSection({ vm }) {
  return (
    <section aria-labelledby="h-palette" className="flex col gap-14px smt-16px" id="sec-palette">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-palette">2. Brand palette and usage{vm.sec.palette.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
        <div className="flex gap-8px relative wrap">
          <button className="w-px-36px h-36px r-8px bd-1px-solid-ink p-0 flex items-center justify-center" type="button" onClick={vm.sec.palette.toggleLock} aria-pressed={vm.sec.palette.locked} aria-label={vm.sec.palette.lockAria} style={{ background: vm.sec.palette.lockBg }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vm.sec.palette.lockFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d={vm.sec.palette.shackle} />
            </svg>
          </button>
          <button className="p-8px-14px r-8px bg-bg t-13px flex gap-6px items-center" type="button" onClick={vm.sec.palette.regen} aria-disabled={vm.sec.palette.locked} style={{ border: `1px solid ${vm.sec.palette.regenBd}`, color: vm.sec.palette.regenFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.sec.palette.regenFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>Regenerate</button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink t-13px" type="button" onClick={vm.sec.palette.toggleEdit} aria-pressed={vm.sec.palette.editing} style={{ background: vm.sec.palette.editBg, color: vm.sec.palette.editFg }}>{vm.sec.palette.editLabel}</button>
          <button className="p-8px-14px r-8px bd-1px-solid-ink bg-bg t-13px" type="button" onClick={vm.sec.palette.toggleExport} aria-expanded={vm.sec.palette.exportOpen}>Export</button>
          {vm.sec.palette.exportOpen && (
            <div className="absolute right-0 top-42px z-4 w-px-220px bg-bg bd-1px-solid-line r-10px p-6px flex col">
              {vm.sec.palette.formats.map((x, i_) => (
                <Fragment key={i_}>
                  <button className="ta-left p-9px-10px bd-0 r-6px bg-bg t-13px" type="button" onClick={x.pick}>{x.label}</button>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex h-26px r-6px of-hidden">
        {vm.cur.colors.map((c, i_) => (
          <Fragment key={i_}>
            <span style={{ flex: c.ratio, background: c.show }} />
          </Fragment>
        ))}
      </div>
      <div className="grid cols-repeat-5-minmax-0-1fr gap-12px">
        {vm.cur.colors.map((c, i_) => (
          <Fragment key={i_}>
            <div className="flex col gap-6px">
              <div className="relative h-110px r-8px bd-1px-solid-divider" style={{ background: c.show }}>
                {vm.cmode && (
                  <button className="pick" type="button" onClick={c.pinC} aria-pressed={c.picked} aria-label={c.pinAria} />
                )}
              </div>
              {vm.sec.palette.editing && (
                <input className="p-8px r-6px bd-1px-solid-faint t-13px ff-monospace" value={c.text} onChange={c.setHex} aria-label={c.aria} />
              )}
              <div className="flex justify-space-between items-center gap-6px">
                <span className="t-14px w-600">{c.name}</span>
                <button className="w-px-28px h-28px r-6px bd-1px-solid-ink p-0 flex items-center justify-center" type="button" onClick={c.toggleLock} aria-pressed={c.locked} aria-label={c.lockAria} style={{ background: c.lockBg }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c.lockFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d={c.shackle} />
                  </svg>
                </button>
              </div>
              <span className="t-12px c-ink-2">{c.show} · {c.role} · {c.ratio}%</span>
            </div>
          </Fragment>
        ))}
      </div>
      <span className="t-12px c-muted">Lock the colors you like. Regenerate replaces only unlocked colors, and new ones stay within {vm.cur.name}. {vm.avoidNote}</span>
      {vm.darkPrev && (
        <div className="flex gap-8px wrap items-center">
          <span className="t-12px c-muted">In dark mode:</span>
          {vm.cur.darkRoles.map((dr, i_) => (
            <Fragment key={i_}>
              <span className="t-12px p-3px-10px r-9px bg-fill">{dr.role}: {dr.name}</span>
            </Fragment>
          ))}
        </div>
      )}
      <div className="two">
        <div className="relative h-180px r-10px p-24px flex col justify-center gap-10px" style={{ background: vm.cur.surface }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.palUsage} aria-pressed={vm.pinSel.palUsage} aria-label="Comment on the palette in use" />
          )}
          <span className="t-26px w-600" style={{ fontFamily: `'${vm.cur.display}', sans-serif`, color: vm.cur.primary }}>{vm.cur.headline}</span>
          <span className="self-flex-start p-9px-14px r-6px c-bg t-13px" style={{ background: vm.cur.ui }}>Get started</span>
        </div>
        <div className="h-180px r-10px p-18px flex items-center justify-center" style={{ background: vm.cur.light }}>
          <div className="w-px-70pct r-10px p-16px flex col gap-8px" style={{ background: vm.cur.card, border: `1px solid ${vm.cur.surface}`, fontFamily: `'${vm.cur.body}', sans-serif` }}>
            <span className="t-14px w-600" style={{ color: vm.cur.ink }}>Card title</span>
            <span className="h-8px r-4px" style={{ background: vm.cur.surface }} />
            <span className="h-8px w-px-60pct r-4px" style={{ background: vm.cur.surface }} />
            <span className="self-flex-start t-12px p-3px-10px r-9px" style={{ background: vm.cur.accent, color: vm.cur.onAccent }}>Accent tag</span>
          </div>
        </div>
      </div>
    </section>
  );
}
