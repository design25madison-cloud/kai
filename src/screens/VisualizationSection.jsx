import { Fragment } from "react";
import PieceActions from "./PieceActions.jsx";

export default function VisualizationSection({ vm }) {
  return (
    <section aria-labelledby="h-preview" className="flex col gap-14px smt-16px" id="sec-preview">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px minh-53px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-preview">6. Visualization{vm.sec.preview.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
      </div>
      <div className="two">
        <div className="relative h-180px r-10px p-24px flex col justify-center gap-10px" style={{ background: vm.cur.surface }}>
          {vm.cmode && (
            <button className="pick" type="button" onClick={vm.pins.palUsage} aria-pressed={vm.pinSel.palUsage} aria-label="Comment on the palette in use" />
          )}<PieceActions vm={vm} piece={vm.pieces.palUsage} />
          <span className="t-26px w-600" style={{ fontFamily: `'${vm.cur.display}', sans-serif`, color: vm.cur.primary }}>{vm.cur.headline}</span>
          <span className="brand-ui self-flex-start p-9px-14px r-6px c-bg t-13px" style={{ background: vm.cur.ui }}>Get started</span>
        </div>
        <div className="h-180px r-10px p-18px flex items-center justify-center" style={{ background: vm.cur.light }}>
          <div className="brand-ui w-px-70pct r-10px p-16px flex col gap-8px" style={{ background: vm.cur.card, border: `1px solid ${vm.cur.surface}`, fontFamily: `'${vm.cur.body}', sans-serif` }}>
            <span className="t-14px w-600" style={{ color: vm.cur.ink }}>Card title</span>
            <span className="h-8px r-4px" style={{ background: vm.cur.surface }} />
            <span className="h-8px w-px-60pct r-4px" style={{ background: vm.cur.surface }} />
            <span className="self-flex-start t-12px p-3px-10px r-9px" style={{ background: vm.cur.accent, color: vm.cur.onAccent }}>Accent tag</span>
          </div>
        </div>
        <div className="h-180px r-10px bd-1px-solid-line of-hidden flex col">
          <div className="bg-fill p-8px-12px flex gap-10px items-center">
            <span className="w-px-10px h-10px r-50pct bg-line-strong" />
            <span className="flex-1 bg-bg r-6px p-5px-10px t-12px c-ink-2">{vm.domainShown}</span>
          </div>
          <div className="flex-1 flex items-center p-0-16px" style={{ background: vm.cur.light }}>
            <span className="t-22px" style={{ fontFamily: `'${vm.cur.wordFont}', sans-serif`, letterSpacing: vm.cur.trackPx, color: vm.cur.primary }}>{vm.wordUpper}</span>
          </div>
        </div>
        <div className="h-180px flex col gap-10px justify-center p-16px r-10px" style={{ background: vm.cur.light, fontFamily: `'${vm.cur.body}', sans-serif` }}>
          <div className="brand-ui flex gap-10px wrap">
            <span className="p-10px-16px r-6px c-bg t-14px" style={{ background: vm.cur.ui }}>Default</span>
            <span className="p-10px-16px r-6px c-bg t-14px" style={{ background: vm.cur.uiHover }}>Hover</span>
            <span className="p-10px-16px r-6px o-0_6 t-14px" style={{ background: vm.cur.surface, color: vm.cur.ink }}>Disabled</span>
            <span className="p-8px-14px r-6px c-bg t-14px outlin-3px" style={{ background: vm.cur.ui, outline: `2px solid ${vm.cur.ui}` }}>Focus</span>
          </div>
          <span className="t-14px td-underline" style={{ color: vm.cur.linkColor }}>Link text</span>
        </div>
      </div>
      <div className="relative h-340px r-12px bd-1px-solid-line flex of-hidden" style={{ fontFamily: `'${vm.cur.body}', sans-serif` }}>
        {vm.cmode && (
          <button className="pick" type="button" onClick={vm.pins.preview} aria-pressed={vm.pinSel.preview} aria-label="Comment on the UI preview" />
        )}<PieceActions vm={vm} piece={vm.pieces.preview} />
        <div className="w-px-180px p-18px flex col gap-12px flex-none" style={{ background: vm.cur.surface }}>
          <span className="t-18px" style={{ fontFamily: `'${vm.cur.wordFont}', sans-serif`, letterSpacing: vm.cur.trackPx, color: vm.cur.primary }}>{vm.wordUpper}</span>
          <span className="t-13px" style={{ color: vm.cur.ink }}>Overview</span>
          <span className="t-13px" style={{ color: vm.cur.ink }}>Reports</span>
          <span className="t-13px" style={{ color: vm.cur.ink }}>Settings</span>
        </div>
        <div className="brand-ui flex-1 p-20px flex col gap-14px minw-0" style={{ background: vm.cur.light }}>
          <div className="flex justify-space-between items-center pr-36px">
            <span className="t-20px w-600" style={{ fontFamily: `'${vm.cur.display}', sans-serif`, color: vm.cur.ink }}>Dashboard</span>
            <span className="p-8px-14px r-6px c-bg t-13px" style={{ background: vm.cur.ui }}>New report</span>
          </div>
          <div className="grid cols-repeat-3-minmax-0-1fr gap-10px">
            <div className="h-70px r-8px p-10px t-12px" style={{ background: vm.cur.card, color: vm.cur.ink }}>[Metric]</div>
            <div className="h-70px r-8px p-10px t-12px" style={{ background: vm.cur.primary, color: vm.cur.onPrimary }}>[Metric]</div>
            <div className="h-70px r-8px p-10px t-12px" style={{ background: vm.cur.card, color: vm.cur.ink }}>[Metric]</div>
          </div>
          <div className="flex-1 r-8px flex items-flex-end gap-10px p-14px" style={{ background: vm.cur.card }}>
            {vm.bars.map((bar, i_) => (
              <Fragment key={i_}>
                <span className="flex-1 r-3px" style={{ height: bar.h, background: bar.c }} />
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
