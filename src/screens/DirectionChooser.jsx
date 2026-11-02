export default function DirectionChooser({ vm }) {
  return (
    <div className="chooser">
      <div className="chooser__head">
        <h1 className="chooser__title">Choose a direction</h1>
        <button className="link-btn" type="button" onClick={vm.viewCmp}>Compare and mix</button>
      </div>
      <div className="chooser__grid">
        {vm.chooser.map((o) => (
          <article key={o.label} className="direction-card">
            <div className="direction-card__mark" style={{ background: o.surface }}>
              <span style={{ fontFamily: `'${o.wordFont}', sans-serif`, letterSpacing: o.trackPx, color: o.primary }}>{o.word}</span>
            </div>
            <div className="direction-card__palette" aria-hidden="true">
              {o.colors.map((c) => (
                <span key={c.role} style={{ flex: c.ratio, background: c.show }} />
              ))}
            </div>
            <div className="direction-card__type">
              <span className="direction-card__display" style={{ fontFamily: `'${o.display}', sans-serif` }}>{o.display}</span>
              <span className="direction-card__body" style={{ fontFamily: `'${o.body}', sans-serif` }}>{o.body}</span>
            </div>
            <div className="direction-card__meta">
              <span className="direction-card__name">
                {o.name}
                {o.rec && <span className="direction-card__rec">Recommended</span>}
              </span>
              <span className="t-14px">{o.words}</span>
            </div>
            {o.hits.length > 0 && <span className="language-flag">Uses a restricted word: {o.hits.join(", ")}</span>}
            <button className="btn btn--primary direction-card__choose" type="button" onClick={o.pick} aria-label={`Choose ${o.name}`}>Choose</button>
          </article>
        ))}
      </div>
    </div>
  );
}
