import Breadcrumbs from "./Breadcrumbs.jsx";
import KaiLogo from "./KaiLogo.jsx";

export default function StartScreen({ vm }) {
  return (
    <div className="upload flow-page">
      <KaiLogo className="page-logo" />
      <Breadcrumbs items={vm.crumbs} />
      <div className="upload__head">
        <h1 className="upload__title">Start a brand direction</h1>
        <p className="upload__intro">Add anything you already have. We will use it in the process.</p>
      </div>
      <div className="upload__files">
        <button className="dropzone" type="button" onClick={vm.addArts}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
          </svg>
          Add files
        </button>
        {vm.hasArts && (
          <ul className="file-chips">
            {vm.arts.map((a) => (
              <li key={a.name} className="file-chip">
                {a.name}
                <button className="file-chip__remove" type="button" onClick={a.remove} aria-label={a.removeAria}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {vm.hasArts && (
        <>
          <section className="upload__section upload__section--opinion" aria-labelledby="op-h">
            <h2 className="upload__h2" id="op-h">How do like your current files?</h2>
            <div className="opinion">
              {vm.oRec && (
                <p className="opinion__text" role="status" aria-live="polite">{vm.oLive}</p>
              )}
              {vm.oIdle && (
                <textarea className="opinion__text" value={vm.opinion} onChange={vm.setOpinion} aria-label="Your thoughts on what you uploaded" placeholder="For example: I like the warm brown in the logo, but the letters feel too techy." />
              )}
              <div className="opinion__bar">
                <button className="opinion__mic" type="button" onClick={vm.toggleOpinionVoice} aria-pressed={vm.oRec} aria-label={vm.oMicAria} style={{ background: vm.oMicBg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                </button>
                <span className="t-13px">{vm.oMicText}</span>
              </div>
            </div>
            {vm.hasHeard && <span className="opinion__heard">We heard: {vm.heardText}</span>}
          </section>
          <section className="upload__section" aria-labelledby="keep-h">
            <h2 className="upload__h2" id="keep-h">How much should we keep?</h2>
            <div className="keep">
              <div className="keep__ends">
                <span>Keep what I have</span>
                <span>Start fresh</span>
              </div>
              <div className="keep__track">
                <div className="keep__rail" />
                <div className="keep__fill" style={{ width: vm.keepPct }} />
                <input className="dial keep__input" type="range" min="0" max="100" value={vm.keep} onChange={vm.setKeep} aria-label="How much to keep, from keep what I have to start fresh" aria-valuetext={vm.keepName} />
              </div>
              <div className="keep__stops" role="group" aria-label="Stops">
                {vm.keepStops.map((ks) => (
                  <button key={ks.label} className="keep__stop" type="button" onClick={ks.pick} aria-pressed={ks.on} style={{ borderColor: ks.bd, background: ks.bg, color: ks.fg }}>{ks.label}</button>
                ))}
              </div>
            </div>
          </section>
          <div className="upload__actions">
            <button className="btn-cta" type="button" onClick={vm.toBrief}>Continue</button>
          </div>
        </>
      )}
    </div>
  );
}
