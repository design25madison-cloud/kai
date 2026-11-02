import { Fragment } from "react";
import CompareView from "./CompareView.jsx";
import ImagerySection from "./ImagerySection.jsx";
import Moodboard from "./Moodboard.jsx";
import PaletteSection from "./PaletteSection.jsx";
import TypographySection from "./TypographySection.jsx";
import UiPreviewSection from "./UiPreviewSection.jsx";
import UiPrimarySection from "./UiPrimarySection.jsx";
import VoiceSection from "./VoiceSection.jsx";
import WordmarkSection from "./WordmarkSection.jsx";

export default function OutputScreen({ vm }) {
  return (
    <div style={{ paddingRight: vm.panelPad }}>
      <div className="bd-b-1px-solid-divider py-14px-12px px-24px">
        <div className="maxw-1200px m-0-auto flex col gap-12px">
          <div className="flex justify-space-between items-center gap-16px wrap">
            <div className="flex items-center gap-12px">
              <span className="w-600">LightBrand</span>
              <span className="c-muted t-14px">/ {vm.f.name}</span>
              <button className="bd-0 bg-none t-13px td-underline c-ink-2" type="button" onClick={vm.backToBrief}>Edit answers</button>
              <button className="bd-0 bg-none t-13px td-underline c-ink-2" type="button" onClick={vm.startOver}>Start over</button>
            </div>
            <div className="flex gap-8px items-center">
            <button className="btn btn--primary" type="button" onClick={vm.openMeeting}>{vm.meetingLabel}</button>
            <div className="relative">
              <button className="btn flex gap-8px items-center" type="button" onClick={vm.toggleAll} aria-expanded={vm.allMenu}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V4" /><path d="M7 9l5-5 5 5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></svg>Export page</button>
              {vm.allMenu && (
                <div className="absolute right-0 top-48px z-5 w-px-280px bg-bg bd-1px-solid-line r-10px p-6px flex col">
                  {vm.allFormats.map((x, i_) => (
                    <Fragment key={i_}>
                      <button className="ta-left p-10px-12px bd-0 r-6px bg-bg t-14px" type="button" onClick={x.pick}>{x.label}</button>
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>
          <div className="flex gap-10px items-center wrap">
            <div className="flex bg-fill r-8px p-3px" role="group" aria-label="View">
              <button className="p-7px-14px r-6px bd-0 t-13px" type="button" onClick={vm.viewDir} aria-pressed={vm.isDir} style={{ background: vm.vDirBg, color: vm.vDirFg }}>Direction</button>
              <button className="p-7px-14px r-6px bd-0 t-13px" type="button" onClick={vm.viewCmp} aria-pressed={vm.isCmp} style={{ background: vm.vCmpBg, color: vm.vCmpFg }}>Compare and mix</button>
            </div>
            <button className="p-8px-14px r-8px bd-1px-solid-ink t-13px flex gap-6px items-center" type="button" onClick={vm.toggleDark} aria-pressed={vm.darkPrev} style={{ background: vm.darkBg, color: vm.darkFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.darkFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>Dark preview</button>
            <button className="p-8px-14px r-8px bd-1px-solid-ink t-13px flex gap-6px items-center" type="button" onClick={vm.toggleCmode} aria-pressed={vm.cmode} style={{ background: vm.cmBg, color: vm.cmFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.cmFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /></svg>{vm.cmodeLabel}</button>
            <span className="flex-1" />
            {vm.roundNotice && (
        <div className="round-notice" role="status">
          <div className="round-notice__inner">
            <div className="round-notice__text">
              <span className="t-14px w-600">{vm.roundNotice.title}</span>
              <span className="t-13px c-ink-2">{vm.roundNotice.locked} {vm.roundNotice.open}</span>
            </div>
            <button className="link-btn" type="button" onClick={vm.dismissNotice}>Dismiss</button>
          </div>
        </div>
      )}
      {vm.isDir && (
              <button className="p-8px-14px r-8px bd-1px-solid-ink bg-bg t-13px flex gap-6px items-center" type="button" onClick={vm.regenAll}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>Regenerate everything unlocked</button>
            )}
          </div>
          {vm.isDir && (
            <div className="flex bd-b-1px-solid-line mb-13px overfl-auto" role="tablist" aria-label="Directions">
              {vm.optTabs.map((t, i_) => (
                <Fragment key={i_}>
                  <button className="flex-1 minw-180px p-12px-18px-10px bd-0 ta-left flex col gap-2px" type="button" role="tab" onClick={t.pick} aria-selected={t.on} style={{ borderBottom: `3px solid ${t.bd}`, background: t.bg, color: t.fg }}>
                    <span className="flex gap-8px items-center">
                      <span className="t-14px w-600">{t.label}</span>
                      {t.rec && (
                        <span className="t-11px p-1px-8px r-9px bg-ink c-bg">Recommended</span>
                      )}
                    </span>
                    <span className="t-12px">{t.name}</span>
                  </button>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      {vm.isDir && (
        <div className="maxw-1200px m-0-auto p-20px-24px-120px flex col gap-36px">
          {vm.darkPrev && (
            <div className="p-12px-16px r-10px bg-ink c-bg t-14px">Previewing {vm.cur.label} in dark mode. Brand pieces sit on {vm.cur.darkName}. The palette colors themselves don't change.</div>
          )}
          <Moodboard vm={vm} />
          <WordmarkSection vm={vm} />
          <PaletteSection vm={vm} />
          <UiPrimarySection vm={vm} />
          <TypographySection vm={vm} />
          <ImagerySection vm={vm} />
          <UiPreviewSection vm={vm} />
          <VoiceSection vm={vm} />
        </div>
      )}
      {vm.isCmp && <CompareView vm={vm} />}
    </div>
  );
}
