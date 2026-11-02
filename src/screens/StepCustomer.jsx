import { Fragment } from "react";

export default function StepCustomer({ vm }) {
  return (
    <div className="flex col gap-24px">
      <div className="flex col gap-4px">
        <h2 className="m-0 t-22px w-600">Customer and problem</h2>
      </div>
      <div className="three">
        <div className="p-16px flex col gap-8px bg-bg bd-1px-solid-grey-2 r-12px">
          <span className="t-14px w-600">Economic buyer</span>
          <label className="t-12px c-ink-2" htmlFor="f-br">Role or title</label>
          <input className="p-9px r-pill bd-1px-solid-grey-2 bg-bg" id="f-br" name="buyerRole" value={vm.f.buyerRole} onChange={vm.onField} placeholder=" " />
          <span className="t-12px c-ink-2">What they care about</span>
          <div className="flex gap-6px wrap">
            {vm.careChips.map((c, i_) => (
              <Fragment key={i_}>
                <button className="p-5px-10px r-pill bd-1px-solid-grey-1 t-12px" type="button" onClick={c.toggle} aria-pressed={c.on} style={{ background: c.bg, color: c.fg }}>{c.label}</button>
              </Fragment>
            ))}
          </div>
          <label className="t-12px c-ink-2" htmlFor="f-mot">What motivates them to purchase</label>
          <input className="p-9px r-pill bd-1px-solid-grey-2 bg-bg" id="f-mot" name="mot" value={vm.f.mot} onChange={vm.onField} placeholder=" " />
          <label className="t-12px c-ink-2" htmlFor="f-succ">How they define success</label>
          <input className="p-9px r-pill bd-1px-solid-grey-2 bg-bg" id="f-succ" name="success" value={vm.f.success} onChange={vm.onField} placeholder=" " />
        </div>
        <div className="p-16px flex col gap-8px bg-bg bd-1px-solid-grey-2 r-12px">
          <span className="t-14px w-600">Operational user</span>
          <label className="t-12px c-ink-2" htmlFor="f-or">Role or title</label>
          <input className="p-9px r-pill bd-1px-solid-grey-2 bg-bg" id="f-or" name="opRole" value={vm.f.opRole} onChange={vm.onField} placeholder=" " />
          <label className="t-12px c-ink-2" htmlFor="f-ot">Function or team</label>
          <input className="p-9px r-pill bd-1px-solid-grey-2 bg-bg" id="f-ot" name="opTeam" value={vm.f.opTeam} onChange={vm.onField} placeholder="Growth, marketing, ops" />
          <label className="t-12px c-ink-2" htmlFor="f-oc">What they ultimately care about</label>
          <input className="p-9px r-pill bd-1px-solid-grey-2 bg-bg" id="f-oc" name="opCares" value={vm.f.opCares} onChange={vm.onField} placeholder=" " />
        </div>
        <div className="p-16px flex col gap-8px bg-bg bd-1px-solid-grey-2 r-12px">
          <div className="flex justify-space-between items-center gap-8px">
            <span className="t-14px w-600">End user</span>
            <button className="p-6px-10px r-pill bd-1px-solid-grey-1 t-12px" type="button" onClick={vm.toggleEnd} aria-pressed={vm.endOn} style={{ background: vm.endBg, color: vm.endFg }}>{vm.endLabel}</button>
          </div>
          {vm.endOn && (
            <>
              <label className="t-12px c-ink-2" htmlFor="f-ew">Who they are</label>
              <input className="p-9px r-pill bd-1px-solid-grey-2 bg-bg" id="f-ew" name="endWho" value={vm.f.endWho} onChange={vm.onField} placeholder="e.g. e-commerce customers" />
              <label className="t-12px c-ink-2" htmlFor="f-ec">What they ultimately care about</label>
              <input className="p-9px r-pill bd-1px-solid-grey-2 bg-bg" id="f-ec" name="endCares" value={vm.f.endCares} onChange={vm.onField} placeholder=" " />
            </>
          )}
        </div>
      </div>
      <div className="flex col gap-10px">
        <span className="t-15px w-600">Core problem</span>
        <div className="flex justify-space-between items-center">
          <label className="t-13px flex gap-8px items-center" htmlFor="f-problem">What problem exists today?{vm.badge && (<span className="status-pill">{vm.badgeText}</span>)}</label>
        </div>
        <textarea className="p-12px r-8px bd-1px-solid-grey-2 bg-bg resize-vertical" id="f-problem" name="problem" value={vm.f.problem} onChange={vm.onField} rows="2" placeholder=" " />
        <div className="two">
          <div className="flex col gap-6px">
            <label className="t-13px" htmlFor="f-who">Who feels this most?</label>
            <select className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-who" name="who" value={vm.f.who} onChange={vm.onField}>
              <option value="buyer">Economic buyer</option>
              <option value="operator">Operational user</option>
              <option value="end">End user</option>
            </select>
          </div>
          <div className="flex col gap-6px">
            <label className="t-13px" htmlFor="f-short">Why current solutions fall short</label>
            <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-short" name="short" value={vm.f.short} onChange={vm.onField} placeholder=" " />
          </div>
        </div>
      </div>
      <div className="flex col gap-8px">
        <span className="t-15px w-600">Competitors</span>
        {vm.comps.map((c, i_) => (
          <Fragment key={i_}>
            <div className="flex gap-8px">
              <input className="flex-1 p-10px-12px r-pill bd-1px-solid-grey-2 bg-bg" value={c.name} onChange={c.setName} aria-label="Competitor name" placeholder="Name" />
              <input className="flex-1 p-10px-12px r-pill bd-1px-solid-grey-2 bg-bg" value={c.url} onChange={c.setUrl} aria-label="Competitor site" placeholder="competitor.com" />
              <button className="w-px-40px h-40px r-50pct bd-1px-solid-grey-1 bg-bg p-0 flex items-center justify-center" type="button" onClick={c.remove} aria-label="Remove competitor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </Fragment>
        ))}
        <button className="self-flex-start p-8px-12px r-pill bd-1px-dashed-grey-2 bg-bg t-14px" type="button" onClick={vm.addComp}>Add competitor</button>
        <label className="t-13px mt-8px" htmlFor="f-altIn">Alternatives and current workarounds</label>
        <div className="flex gap-8px wrap items-center">
          {vm.alts.map((c, i_) => (
            <Fragment key={i_}>
              <span className="flex items-center gap-6px p-6px-6px-6px-12px bg-bg t-14px r-pill bd-1px-solid-grey-1">{c.label}<button className="w-px-22px h-22px bd-0 r-4px bg-bg p-0 flex items-center justify-center" type="button" onClick={c.remove} aria-label={c.aria}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button></span>
            </Fragment>
          ))}
          <input className="flex-1 minw-200px p-10px-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-altIn" name="altIn" value={vm.f.altIn} onChange={vm.onField} onKeyDown={vm.altKey} placeholder="e.g. spreadsheets, then Enter" />
        </div>
      </div>
      <div className="two">
        <div className="flex col gap-6px">
          <label className="t-13px flex gap-8px items-center" htmlFor="f-diff">What makes you different{vm.badge && (<span className="status-pill">{vm.badgeText}</span>)}</label>
          <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-diff" name="diff" value={vm.f.diff} onChange={vm.onField} placeholder=" " />
        </div>
        <div className="flex col gap-6px">
          <label className="t-13px" htmlFor="f-diffWhy">Why this matters</label>
          <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-diffWhy" name="diffWhy" value={vm.f.diffWhy} onChange={vm.onField} placeholder=" " />
        </div>
        <div className="flex col gap-6px">
          <label className="t-13px" htmlFor="f-out">What outcomes users are trying to achieve</label>
          <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-out" name="outcomes" value={vm.f.outcomes} onChange={vm.onField} placeholder=" " />
        </div>
        <div className="flex col gap-6px">
          <label className="t-13px" htmlFor="f-sw">What would make them switch</label>
          <input className="p-12px r-pill bd-1px-solid-grey-2 bg-bg" id="f-sw" name="switchTo" value={vm.f.switchTo} onChange={vm.onField} placeholder=" " />
        </div>
      </div>
    </div>
  );
}
