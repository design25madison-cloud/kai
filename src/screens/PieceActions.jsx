const LOCK_SHUT = "M8 11V7a4 4 0 0 1 8 0v4";
const LOCK_OPEN = "M8 11V7a4 4 0 0 1 7.6-1.6";

function LockIcon({ shut }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d={shut ? LOCK_SHUT : LOCK_OPEN} />
    </svg>
  );
}

// Lock and AI edit controls for one piece of a direction, shown on hover or keyboard focus.
// The parent must be positioned. A locked piece keeps a badge when it isn't hovered.
export default function PieceActions({ vm, piece }) {
  const interactive = !vm.cmode && !vm.presenting;
  const lockName = piece.lockName || piece.label.toLowerCase();

  return (
    <>
      {piece.locked && (
        <span className="piece-badge" title="Locked">
          <LockIcon shut />
        </span>
      )}
      {interactive && (
        <span className="piece-actions">
          {piece.toggleLock && (
            <button className="piece-action" type="button" onClick={piece.toggleLock} aria-pressed={piece.locked} aria-label={(piece.locked ? "Unlock " : "Lock ") + lockName}>
              <LockIcon shut={piece.locked} />
              {piece.locked ? "Locked" : "Lock"}
            </button>
          )}
          <button className="piece-action" type="button" onClick={piece.comment} aria-label={"AI edit: " + piece.label.toLowerCase()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 5h16v11H9l-5 4z" />
            </svg>
            AI edit
          </button>
        </span>
      )}
    </>
  );
}

// On the mix: says when the option this part was copied from has changed since, next to the way to bring it in.
export function MixStale({ vm, part }) {
  if (!vm.mixStale[part]) return null;
  return (
    <div className="p-12px flex gap-12px wrap items-center bg-bg bd-1px-solid-grey-2 r-12px" role="status">
      <span className="t-13px flex-1">{vm.mixStale[part]} Updating rebuilds the whole mix from its options.</span>
      <button className="p-8px-14px r-pill bd-1px-solid-grey-1 bg-bg t-13px" type="button" onClick={vm.updateMix}>Update your mix</button>
    </div>
  );
}
