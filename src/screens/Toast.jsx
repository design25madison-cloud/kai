export default function Toast({ vm }) {
  return (
    <div className="fixed left-50pct bottom-28px transf-translateX--50pct z-20 maxw-min-640px-calc-100pct---32px p-12px-18px r-10px bg-ink c-bg t-14px flex gap-14px items-center" role="status">
      <span>{vm.toast}</span>
      {vm.hasUndo && (
        <button className="p-6px-12px r-6px bd-1px-solid-bg bg-ink c-bg t-13px flex-none" type="button" onClick={vm.doUndo}>Undo</button>
      )}
    </div>
  );
}
