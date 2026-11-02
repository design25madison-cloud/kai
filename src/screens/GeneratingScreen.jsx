import { Fragment } from "react";

export default function GeneratingScreen({ vm }) {
  return (
    <div className="maxw-520px minh-screen m-0-auto p-140px-24px flex col justify-center gap-18px">
      <h1 className="m-0 t-26px">Generating three directions</h1>
      {vm.genSteps.map((g, i_) => (
        <Fragment key={i_}>
          <div className="flex gap-12px items-center t-15px" style={{ color: g.fg }}><span className="w-px-10px h-10px r-50pct flex-none" style={{ background: g.dot }} />{g.label} </div>
        </Fragment>
      ))}
    </div>
  );
}
