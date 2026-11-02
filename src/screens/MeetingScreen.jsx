import KaiLogo from "./KaiLogo.jsx";
import Moodboard from "./Moodboard.jsx";

export default function MeetingScreen({ vm }) {
  const { meet } = vm;
  return (
    <div className="meet">
      <header className="flow-bar">
        <div className="flow-bar__title">
          <KaiLogo size="sm" />
          <span className="c-muted t-14px">/ {vm.f.name} · Alignment meeting · Round {meet.round}</span>
        </div>
        <button className="link-btn" type="button" onClick={meet.leave}>Leave meeting</button>
      </header>

      <div className="direction-tabs" role="tablist" aria-label="Directions">
        {meet.directions.map((t) => (
          <button key={t.label} role="tab" type="button" aria-selected={t.on} className="direction-tab" onClick={t.pick}>
            <span className="t-13px w-600">{t.label}</span>
            <span className="t-13px">{t.name}</span>
            {t.progress && <span className="t-12px c-muted">{t.progress}</span>}
          </button>
        ))}
      </div>

      <div className="meet__body">
        <main className="meet__board">
          <Moodboard vm={{ ...vm, presenting: true, cmode: false }} />
        </main>

        <aside className="meet__rail" aria-label="Decide module by module">
          <div className="meet__rail-head">
            <h2 className="m-0 t-18px w-600">Decide module by module</h2>
            <span className="t-14px c-muted" role="status">{meet.progress}</span>
          </div>

          <ul className="module-list">
            {meet.modules.map((m) => (
              <li key={m.id} className="module-row">
                <span className="t-14px w-600">{m.label}</span>
                <span className="t-13px c-muted">{m.value}</span>
                <div className="seg" role="group" aria-label={m.label}>
                  <button type="button" className="seg__btn" aria-pressed={m.agreed} onClick={m.markAgreed}>Agreed</button>
                  <button type="button" className="seg__btn" aria-pressed={m.work} onClick={m.markWork}>Needs work</button>
                </div>
                {m.work && (
                  <input className="module-row__note" value={m.note} onChange={m.setNote} aria-label={m.noteAria} placeholder="What's off? For example: too techy" />
                )}
              </li>
            ))}
          </ul>

          {meet.hasRounds && (
            <div className="round-log">
              <span className="t-13px w-600">Earlier rounds</span>
              {meet.rounds.map((r) => (
                <span key={r.label} className="t-13px c-muted"><strong className="c-ink">{r.label}.</strong> {r.text}</span>
              ))}
            </div>
          )}

          <div className="meet__actions">
            <button className="btn btn--primary" type="button" disabled={!meet.allAgreed} onClick={meet.handOff}>Direction agreed, hand off</button>
            <span className="t-13px c-muted">{meet.gateText}</span>
            {meet.someOpen && (
              <button className="btn" type="button" onClick={meet.backToPicks}>Not agreed, back to picks</button>
            )}
            {meet.someOpen && (
              <span className="t-13px c-muted">Agreed modules lock, and round {meet.round + 1} starts. Answers wrong? <button className="link-btn" type="button" onClick={meet.editBrief}>Edit the brief</button></span>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
