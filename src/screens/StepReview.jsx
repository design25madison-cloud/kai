import { Fragment } from "react";

export default function StepReview({ vm }) {
  return (
    <div className="flex col gap-24px">
      <div className="flex col gap-4px">
        <h2 className="m-0 t-22px w-600">Review</h2>
        <p className="m-0 t-14px c-muted">{vm.readyText}</p>
      </div>
      <div className="flex col r-10px bd-1px-solid-line of-hidden">
        {vm.coreChecks.map((c, i_) => (
          <Fragment key={i_}>
            <div className="flex justify-space-between items-center gap-12px p-12px-16px bd-b-1px-solid-divider">
              <span className="t-14px">{c.label}</span>
              <span className="flex gap-12px items-center">
                <span className="t-12px p-2px-10px r-9px" style={{ background: c.bg, color: c.fg }}>{c.status}</span>
                <button className="bd-0 bg-none t-13px td-underline" type="button" onClick={c.go}>Edit</button>
              </span>
            </div>
          </Fragment>
        ))}
      </div>
      {vm.hasMissing && (
        <button className="self-flex-start p-10px-16px r-pill bd-1px-solid-grey-1 bg-bg t-14px" type="button" onClick={vm.fillSample}>Fill the gaps with sample answers</button>
      )}
    </div>
  );
}
