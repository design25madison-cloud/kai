import Breadcrumbs from "./Breadcrumbs.jsx";
import { HomeLogo } from "./ProjectChrome.jsx";

// Layout follows the "Onboarding · Start" frame in the V1 Happy Path Figma page.
export default function StartScreen({ vm }) {
  const m = vm.mat;
  return (
    <div className="upload flow-page">
      <HomeLogo vm={vm} className="page-logo" />
      <Breadcrumbs items={[{ label: "Your projects", go: vm.toProjects }, ...vm.crumbs]} />
      <div className="upload__head">
        <h1 className="upload__title">Input project context</h1>
        <p className="upload__intro">
          Add anything you already have: decks, notes, logos. We read it and fill in what we can.
          <br />
          Have scattered notes or files elsewhere? Ask Claude to pull them into one summary, then paste it below.{" "}
          <button className="link-btn" type="button" onClick={m.copyPrompt}>Copy a prompt for Claude</button>
        </p>
      </div>
      <div className="upload__files">
        <label className="dropzone" onDrop={m.onDrop} onDragOver={m.onDragOver} aria-disabled={m.working || !m.canFill}>
          <input className="dropzone__input" type="file" multiple accept={m.accept} onChange={m.onPick} disabled={m.working || !m.canFill} aria-describedby="upload-types" />
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15V4" />
            <path d="M7 9l5-5 5 5" />
            <path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
          </svg>
          Add files
        </label>
        <p className="upload__note" id="upload-types">PDF, PNG, JPG, PowerPoint or Word. Up to 10 files, 25 MB each.</p>
        {m.hasFiles && (
          <ul className="file-chips">
            {m.files.map((a) => (
              <li key={a.id} className="file-chip">
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
      <p className="upload__or">or</p>
      <textarea className="paste-box" value={m.text} onChange={m.setText} placeholder="Paste notes or a summary" aria-label="Paste notes or a summary" />
      {!m.canFill && (
        <p className="upload__note" role="note">Filling the brief from materials works on the hosted version of KAI. Here you can continue and fill it in yourself.</p>
      )}
      <p className="upload__status" role="status" aria-live="polite">{m.status}</p>
      {m.error && <p className="upload__error" role="alert">{m.error}</p>}
      <div className="upload__actions">
        <button className="link-btn" type="button" onClick={vm.toBrief}>Skip, I'll fill it in myself</button>
        <button className="btn-cta" type="button" onClick={m.fill} disabled={!m.canRun}>Fill in my brief</button>
      </div>
    </div>
  );
}
