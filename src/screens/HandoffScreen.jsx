export default function HandoffScreen({ vm }) {
  const { handoff: h } = vm;
  return (
    <div className="handoff">
      <header className="flow-bar">
        <div className="flow-bar__title">
          <span className="w-600">LightBrand</span>
          <span className="c-muted t-14px">/ {h.name} · Handoff</span>
        </div>
        <button className="link-btn" type="button" onClick={h.reopen}>Reopen the meeting</button>
      </header>

      <div className="handoff__body">
        <div className="handoff__head">
          <h1 className="m-0 t-28px w-600">{h.direction} is ready for the designer</h1>
          <p className="m-0 t-14px c-muted">{h.agreedText} This is a starting direction, not the final brand.</p>
        </div>

        <div className="handoff__grid">
          <section className="handoff__record" aria-labelledby="h-record">
            <h2 id="h-record" className="m-0 t-18px w-600">Agreed picks</h2>
            <dl className="pick-list">
              {h.picks.map((p) => (
                <div key={p.label} className="pick-list__row">
                  <dt className="t-13px w-600">{p.label}</dt>
                  <dd className="m-0 t-13px c-muted">{p.value}</dd>
                </div>
              ))}
            </dl>

            <h2 className="m-0 t-18px w-600">Rounds</h2>
            <div className="round-log round-log--plain">
              {h.rounds.map((r) => (
                <span key={r.label} className="t-13px c-muted"><strong className="c-ink">{r.label}.</strong> {r.text}</span>
              ))}
            </div>

            <h2 className="m-0 t-18px w-600">Still manual</h2>
            <ul className="manual-list t-13px c-muted">
              <li>Rebuild the picks in Figma. Automated in v2.</li>
              <li>Define status colors. They aren't part of this direction.</li>
              <li>Source licensed images. References are for direction only.</li>
            </ul>
          </section>

          <section className="handoff__files" aria-labelledby="h-files">
            <div className="handoff__files-head">
              <h2 id="h-files" className="m-0 t-18px w-600">Files</h2>
              <button className="btn" type="button" onClick={h.printPdf}>Save direction as PDF</button>
            </div>
            <ul className="file-list">
              {h.files.map((x) => (
                <li key={x.id} className="file-row" data-on={x.on}>
                  <button className="file-row__main" type="button" aria-pressed={x.on} onClick={x.preview}>
                    <span className="t-14px w-600">{x.name}</span>
                    <span className="t-13px c-muted">{x.desc}</span>
                  </button>
                  <button className="btn" type="button" onClick={x.download} aria-label={"Download " + x.name}>Download</button>
                </li>
              ))}
            </ul>
            <div className="file-preview">
              <div className="file-preview__bar">
                <span className="t-13px w-600">{h.selName}</span>
                <button className="link-btn" type="button" onClick={h.copy}>Copy</button>
              </div>
              <pre className="file-preview__code" tabIndex={0}>{h.selContent}</pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
