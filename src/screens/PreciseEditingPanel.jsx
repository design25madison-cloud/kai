import { Fragment } from "react";

export default function PreciseEditingPanel({ vm }) {
  return (
    <>
      {vm.cmode && (
        <aside className="fixed top-0 right-0 bottom-0 w-px-380px z-15 bg-bg bd-l-1px-solid-line flex col" aria-label="Precise editing">
          <div className="p-16px-18px bd-b-1px-solid-divider flex items-flex-start gap-12px">
            <div className="flex-1 flex col gap-2px">
              <span className="t-16px w-600">Precise editing</span>
              <span className="t-12px c-muted">{vm.cur.label}: {vm.cur.name} · {vm.cmCount}</span>
            </div>
            <button className="w-px-32px h-32px r-6px bd-0 bg-fill p-0 flex items-center justify-center" type="button" onClick={vm.toggleCmode} aria-label="Close precise editing">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overfl-auto-v2 p-16px-18px flex col gap-14px" role="log" aria-live="polite">
            <div className="p-12px-14px r-10px bg-fill-subtle t-13px lh-1_5 c-ink-2">Click any piece of the moodboard to add it to this chat, then say what to change. You can add several pieces at once. Nothing changes until you accept a suggestion.</div>
            {vm.allCm.map((cmt, i_) => (
              <Fragment key={i_}>
                <div className="flex col gap-8px">
                  <div className="self-flex-end maxw-88pct p-10px-12px r-12px-12px-4px-12px bg-ink c-bg flex col gap-6px">
                    <span className="t-14px lh-1_45">{cmt.text}</span>
                    <span className="self-flex-start t-11px p-2px-8px r-9px bg-ink-2">{cmt.where}</span>
                  </div>
                  <div className="self-flex-start w-px-100pct p-12px r-12px-12px-12px-4px bg-fill-subtle flex col gap-10px">
                    {cmt.thinking && (
                      <span className="t-13px c-ink-2">Working on {cmt.label}…</span>
                    )}
                    {cmt.canApply && (
                      <div className="flex gap-8px items-center wrap">
                        <span className="t-13px c-ink-2 flex-1">Suggestion rejected.</span>
                        <button className="p-8px-14px r-8px bd-1px-solid-ink bg-bg t-13px" type="button" onClick={cmt.apply}>Try another version</button>
                      </div>
                    )}
                    {cmt.isApplied && (
                      <span className="t-13px c-ink">Applied and locked. <a className="c-ink-2" href={cmt.href}>Show</a></span>
                    )}
                    {cmt.proposed && (
                      <>
                        <span className="t-13px lh-1_5">{cmt.summary}</span>
                        {cmt.isColors && (
                          <div className="flex col gap-6px">
                            <div className="flex gap-6px items-center">
                              <span className="w-px-44px t-11px c-muted">Before</span>
                              {cmt.bSw.map((sw, i_) => (
                                <Fragment key={i_}>
                                  <span className="w-px-36px h-26px r-5px bd-1px-solid-line" style={{ background: sw.hex }} />
                                </Fragment>
                              ))}
                            </div>
                            <div className="flex gap-6px items-center">
                              <span className="w-px-44px t-11px c-muted">After</span>
                              {cmt.aSw.map((sw, i_) => (
                                <Fragment key={i_}>
                                  <span className="w-px-36px h-26px r-5px bd-1px-solid-line" style={{ background: sw.hex }} />
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                        {cmt.isText && (
                          <div className="flex col gap-4px t-13px">
                            <span><span className="c-muted">Before:</span> {cmt.bText}</span>
                            <span><span className="c-muted">After:</span> {cmt.aText}</span>
                          </div>
                        )}
                        {cmt.isWord && (
                          <div className="flex col gap-6px">
                            <div className="p-8px-12px r-6px bg-bg flex gap-10px items-center">
                              <span className="w-px-40px t-11px c-muted">Before</span>
                              <span className="t-22px" style={{ fontFamily: `'${cmt.bFont}', sans-serif`, letterSpacing: cmt.bTrack }}>{vm.wordUpper}</span>
                            </div>
                            <div className="p-8px-12px r-6px bg-bg flex gap-10px items-center">
                              <span className="w-px-40px t-11px c-muted">After</span>
                              <span className="t-22px" style={{ fontFamily: `'${cmt.aFont}', sans-serif`, letterSpacing: cmt.aTrack }}>{vm.wordUpper}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-8px">
                          <button className="p-8px-14px r-8px bd-0 bg-ink c-bg t-13px w-600" type="button" onClick={cmt.accept}>Accept and lock</button>
                          <button className="p-8px-14px r-8px bd-1px-solid-ink bg-bg t-13px" type="button" onClick={cmt.reject}>Reject</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          <div className="bd-t-1px-solid-divider p-12px-18px-16px flex col gap-8px">
            {vm.hasDraftItems && (
              <div className="flex gap-6px wrap">
                {vm.draftItems.map((di, i_) => (
                  <Fragment key={i_}>
                    <span className="flex gap-4px items-center t-12px p-3px-4px-3px-10px r-12px bg-fill bd-1px-solid-ink">{di.label}<button className="w-px-18px h-18px r-50pct bd-0 bg-transparent p-0 flex items-center justify-center" type="button" onClick={di.remove} aria-label={di.aria}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button></span>
                  </Fragment>
                ))}
              </div>
            )}
            {vm.noDraftItems && (
              <span className="t-12px c-muted">No pieces added yet. Click something on the moodboard.</span>
            )}
            <textarea className="p-10px r-8px bd-1px-solid-line bg-bg resize-vertical" value={vm.draft.text} onChange={vm.setDraft} rows="3" aria-label="Describe the edit" placeholder="Describe the edit, for example: make this warmer" />
            <div className="flex gap-8px justify-flex-end">
              <button className="p-8px-14px r-8px bd-1px-solid-ink bg-bg t-13px" type="button" onClick={vm.cancelDraft}>Clear</button>
              <button className="p-8px-16px r-8px bd-0 c-bg t-13px w-600" type="button" onClick={vm.postComment} style={{ background: vm.sendBg }}>Send</button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
