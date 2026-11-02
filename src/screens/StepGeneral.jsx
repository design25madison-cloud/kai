import { Fragment } from "react";

export default function StepGeneral({ vm }) {
  return (
    <div className="flex col gap-22px">
      <h2 className="m-0 t-22px w-600">General</h2>
      {vm.showUpload && (
        <button className="h-150px r-10px bd-2px-dashed-faint bg-fill flex col items-center justify-center gap-8px" type="button" onClick={vm.doImport}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
          </svg>
          <span className="t-15px w-600">Upload your brief</span>
          <span className="t-13px c-muted">.docx, PDF, deck, or meeting transcript. Click to use the sample brief.</span>
        </button>
      )}
      {vm.imported && (
        <div className="p-14px-16px r-10px bg-fill flex justify-space-between items-center gap-12px wrap">
          <span className="t-14px"><strong>{vm.importName}</strong> · {vm.importText}</span>
          <button className="p-8px-14px r-pill bd-1px-solid-grey-2 bg-bg t-13px" type="button" onClick={vm.confirmAll}>{vm.confirmLabel}</button>
        </div>
      )}
      <div className="flex col gap-6px">
        <label className="t-13px flex gap-8px items-center" htmlFor="f-name">Working name{vm.badge && (<span className="t-11px p-1px-8px r-9px bd-1px-solid-muted c-ink-2">{vm.badgeText}</span>)}</label>
        <input className="p-12px r-8px bd-0 bg-fill" id="f-name" name="name" value={vm.f.name} onChange={vm.onField} placeholder="What are you calling it for now?" />
        <button className="self-flex-start p-4px-0 bd-0 bg-none t-13px td-underline c-ink-2" type="button" onClick={vm.toggleLegal} aria-expanded={vm.legalOpen}>{vm.legalLabel}</button>
        {vm.legalOpen && (
          <>
            <label className="t-13px" htmlFor="f-legal">Legal name</label>
            <input className="p-12px r-8px bd-0 bg-fill" id="f-legal" name="legal" value={vm.f.legal} onChange={vm.onField} />
          </>
        )}
      </div>
      <div className="flex col gap-6px">
        <div className="flex justify-space-between items-center">
          <label className="t-13px flex gap-8px items-center" htmlFor="f-desc">Company description{vm.badge && (<span className="t-11px p-1px-8px r-9px bd-1px-solid-muted c-ink-2">{vm.badgeText}</span>)}</label>
          <button className="w-px-32px h-32px r-50pct bd-1px-solid-faint bg-bg flex items-center justify-center p-0" type="button" onClick={vm.mic} aria-label="Answer by voice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
        </div>
        <textarea className="p-12px r-8px bd-0 bg-fill resize-vertical" id="f-desc" name="desc" value={vm.f.desc} onChange={vm.onField} rows="2" placeholder="A short, plain-language description of what the company does and for whom." />
      </div>
      <div className="flex col gap-8px">
        <span className="t-13px">Requested deliverables and deadlines</span>
        {vm.deliv.map((d, i_) => (
          <Fragment key={i_}>
            <div className="flex gap-8px items-center">
              <select className="flex-1 p-11px r-8px bd-0 bg-fill" value={d.type} onChange={d.setType} aria-label="Deliverable">
                <option value="Logo">Logo</option>
                <option value="Website">Website</option>
                <option value="Product UI">Product UI</option>
                <option value="Pitch deck">Pitch deck</option>
                <option value="Other">Other</option>
              </select>
              <input className="p-10px r-8px bd-0 bg-fill" type="date" value={d.date} onChange={d.setDate} aria-label="Deadline" />
              <button className="w-px-40px h-40px r-50pct bd-0 bg-fill p-0 flex items-center justify-center" type="button" onClick={d.remove} aria-label="Remove deliverable">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </Fragment>
        ))}
        <button className="self-flex-start p-8px-12px r-pill bd-1px-dashed-muted bg-bg t-14px" type="button" onClick={vm.addDeliv}>Add deliverable</button>
      </div>
      <div className="flex col gap-8px">
        <label className="t-13px" htmlFor="f-domainIn">Domains secured</label>
        <div className="flex gap-8px wrap items-center">
          {vm.domains.map((c, i_) => (
            <Fragment key={i_}>
              <span className="flex items-center gap-6px p-6px-6px-6px-12px r-8px bg-fill t-14px">{c.label}<button className="w-px-22px h-22px bd-0 r-4px bg-bg p-0 flex items-center justify-center" type="button" onClick={c.remove} aria-label={c.aria}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button></span>
            </Fragment>
          ))}
          <input className="flex-1 minw-180px p-10px-12px r-8px bd-0 bg-fill" id="f-domainIn" name="domainIn" value={vm.f.domainIn} onChange={vm.onField} onKeyDown={vm.domainKey} placeholder="yourname.com, then Enter" />
        </div>
      </div>
      <div className="flex col gap-8px">
        <span className="t-13px">Team votes or preferences on the name</span>
        <span className="t-12px c-muted">Rank the names or wordmarks the team likes. The top pick seeds the wordmark favorites.</span>
        {vm.votes.map((v, i_) => (
          <Fragment key={i_}>
            <div className="flex gap-8px items-center p-8px-10px r-8px bg-fill">
              <span className="w-px-22px t-13px c-muted">{v.rank}</span>
              <span className="flex-1 t-14px">{v.label}</span>
              <button className="w-px-32px h-32px bd-0 r-50pct bg-bg p-0" type="button" onClick={v.up} aria-label={v.upAria}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 15l6-6 6 6" />
                </svg>
              </button>
              <button className="w-px-32px h-32px bd-0 r-50pct bg-bg p-0" type="button" onClick={v.down} aria-label={v.downAria}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <button className="w-px-32px h-32px bd-0 r-50pct bg-bg p-0" type="button" onClick={v.remove} aria-label={v.aria}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </Fragment>
        ))}
        <div className="flex gap-8px">
          <input className="flex-1 p-10px-12px r-8px bd-0 bg-fill" name="voteIn" value={vm.f.voteIn} onChange={vm.onField} aria-label="Add a name option" placeholder="Add a name option" />
          <button className="p-8px-14px r-pill bd-1px-solid-grey-2 bg-bg t-14px" type="button" onClick={vm.addVote}>Add</button>
        </div>
      </div>
    </div>
  );
}
