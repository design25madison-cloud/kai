import { useState } from "react";
import CompareView from "./CompareView.jsx";
import DirectionChooser from "./DirectionChooser.jsx";
import ExportMenu from "./ExportMenu.jsx";
import ImagerySection from "./ImagerySection.jsx";
import KaiLogo from "./KaiLogo.jsx";
import Moodboard from "./Moodboard.jsx";
import PaletteSection from "./PaletteSection.jsx";
import ProgressRail from "./ProgressRail.jsx";
import TypographySection from "./TypographySection.jsx";
import UiPreviewSection from "./UiPreviewSection.jsx";
import UiPrimarySection from "./UiPrimarySection.jsx";
import VoiceSection from "./VoiceSection.jsx";
import WordmarkSection from "./WordmarkSection.jsx";

export default function OutputScreen({ vm }) {
  const [projectMenu, setProjectMenu] = useState(false);
  // The rail gives way to the AI chat, which takes over the side of the screen.
  const showRail = vm.isDir && !vm.cmode;
  return (
    <div style={{ paddingRight: vm.panelPad }}>
      <header className="results-header">
        <div className="results-header__inner">
          <div className="results-header__row">
            <div className="results-header__crumb">
              <KaiLogo size="sm" />
              <span className="c-muted t-14px">/</span>
              <div className="relative">
                <button className="crumb-btn" type="button" onClick={() => setProjectMenu(!projectMenu)} aria-expanded={projectMenu} aria-haspopup="menu">{vm.f.name}</button>
                {projectMenu && (
                  <div className="menu menu--start">
                    <button className="menu__item" type="button" onClick={vm.backToBrief}>Edit answers</button>
                    <button className="menu__item" type="button" onClick={vm.startOver}>Start over</button>
                  </div>
                )}
              </div>
            </div>
            <div className="results-header__actions">
              {!vm.isChoose && <div className="relative">
                <button className="icon-btn" type="button" onClick={vm.toggleAll} aria-expanded={vm.allMenu} aria-label="Export page"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V4" /><path d="M7 9l5-5 5 5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></svg></button>
                {vm.allMenu && <ExportMenu menu={vm.exportMenu} />}
              </div>}
            </div>
          </div>
          {!vm.isChoose && <div className="results-header__row">
            <div className="results-header__crumb">
            <div className="view-toggle" role="group" aria-label="View">
              <button className="view-toggle__btn" type="button" onClick={vm.viewDir} aria-pressed={vm.isDir} style={{ background: vm.vDirBg, color: vm.vDirFg }}>Direct</button>
              <button className="view-toggle__btn" type="button" onClick={vm.viewCmp} aria-pressed={vm.isCmp} style={{ background: vm.vCmpBg, color: vm.vCmpFg }}>Compare</button>
            </div>
            <button className="link-btn" type="button" onClick={vm.viewChoose}>All directions</button>
            </div>
            <div className="results-tools">
              <button className="tool-btn" type="button" onClick={vm.toggleCmode} aria-pressed={vm.cmode} style={{ background: vm.cmBg, color: vm.cmFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.cmFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /></svg>{vm.cmodeLabel}</button>
              <button className="tool-btn" type="button" onClick={vm.toggleDark} aria-pressed={vm.darkPrev} style={{ background: vm.darkBg, color: vm.darkFg }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={vm.darkFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>Dark mode</button>
              {vm.isDir && (
                <button className="tool-btn bg-bg" type="button" onClick={vm.regenAll} aria-label="Regenerate everything unlocked"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>Regenerate</button>
              )}
            </div>
          </div>}
          {vm.isDir && (
            <div className="results-tabs" role="tablist" aria-label="Directions">
              {vm.optTabs.map((t) => (
                <button key={t.label} className="results-tab" type="button" role="tab" onClick={t.pick} aria-selected={t.on} style={{ borderBottom: `2px solid ${t.bd}`, background: t.bg, color: t.fg }}>
                  <span className="flex gap-8px items-center">
                    <span className="t-14px w-600">{t.label}</span>
                    {t.rec && (
                      <span className="t-11px p-1px-8px r-9px bg-ink c-bg">Recommended</span>
                    )}
                  </span>
                  <span className="t-12px">{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
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
      {showRail && <ProgressRail />}
      {vm.isDir && (
        <div className={showRail ? "results-body-wrap--rail" : undefined}>
        <div className="results-body">
          <Moodboard vm={vm} />
          <WordmarkSection vm={vm} />
          <PaletteSection vm={vm} />
          <UiPrimarySection vm={vm} />
          <TypographySection vm={vm} />
          <ImagerySection vm={vm} />
          <UiPreviewSection vm={vm} />
          <VoiceSection vm={vm} />
        </div>
        </div>
      )}
      {vm.isCmp && <CompareView vm={vm} />}
      {vm.isChoose && <DirectionChooser vm={vm} />}
    </div>
  );
}
