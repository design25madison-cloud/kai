import { Fragment } from "react";
import PieceActions from "./PieceActions.jsx";

export default function UiPreviewSection({ vm }) {
  return (
    <section aria-labelledby="h-preview" className="flex col gap-14px smt-16px" id="sec-preview">
      <div className="flex justify-space-between items-center gap-12px wrap bd-t-1px-solid-line pt-16px minh-53px">
        <h2 className="m-0 t-20px w-600 flex gap-10px items-center" id="h-preview">6. UI preview{vm.sec.preview.locked && (<span className="t-12px w-500 p-2px-10px r-9px bg-ink c-bg">Locked</span>)}</h2>
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
