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

// Lock and comment controls for one piece of a direction, shown on hover or keyboard focus.
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
          <button className="piece-action" type="button" onClick={piece.comment} aria-label={"Comment on " + piece.label.toLowerCase()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 5h16v11H9l-5 4z" />
            </svg>
            Comment
          </button>
        </span>
      )}
    </>
  );
}
