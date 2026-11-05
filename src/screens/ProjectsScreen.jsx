import KaiLogo from "./KaiLogo.jsx";
import { AccountMenu } from "./ProjectChrome.jsx";

function RenameField({ card }) {
  const done = (e) => card.commitRename(e.target.value);
  return (
    <input
      className="project-card__rename"
      defaultValue={card.name}
      aria-label="Project name"
      autoFocus
      onFocus={(e) => e.target.select()}
      onBlur={done}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.target.blur();
        if (e.key === "Escape") card.cancelRename();
      }}
    />
  );
}

function ProjectCard({ card }) {
  return (
    <li className="project-card">
      <button className="project-card__thumb" type="button" onClick={card.open} aria-label={`Open ${card.name}`}>
        {card.swatches ? card.swatches.map((hex, k) => <span key={k} style={{ background: hex }} />) : <span className="project-card__empty">No direction yet</span>}
      </button>
      <div className="project-card__body">
        <div className="project-card__text">
          {card.renaming ? <RenameField card={card} /> : (
            <button className="project-card__name" type="button" onClick={card.open}>{card.name}</button>
          )}
          <span className="project-card__meta">{card.meta}</span>
        </div>
        <div className="relative">
          <button className="project-card__more" type="button" onClick={card.toggleMenu} aria-expanded={card.menuOpen} aria-haspopup="menu" aria-label={`More actions for ${card.name}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>
          {card.menuOpen && (
            <div className="menu menu--end project-menu" role="menu">
              {card.deleting ? (
                <div className="project-menu__confirm">
                  <span className="t-13px">Delete “{card.name}”? This can't be undone.</span>
                  <div className="flex gap-8px">
                    <button className="btn btn--danger" type="button" onClick={card.confirmDelete}>Delete</button>
                    <button className="btn" type="button" onClick={card.cancelDelete}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <button className="menu__item" type="button" role="menuitem" onClick={card.open}>Open</button>
                  <button className="menu__item" type="button" role="menuitem" onClick={card.startRename}>Rename</button>
                  <button className="menu__item" type="button" role="menuitem" onClick={card.duplicate}>Duplicate</button>
                  <button className="menu__item" type="button" role="menuitem" onClick={card.askDelete}>Delete</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function ProjectsScreen({ vm }) {
  return (
    <div className="projects">
      <header className="projects__bar">
        <KaiLogo />
        <AccountMenu vm={vm} />
      </header>
      <main className="projects__body">
        <div className="projects__head">
          <h1 className="projects__title">Your projects</h1>
          {vm.hasProjects && <button className="btn btn--primary btn--icon" type="button" onClick={vm.newProject}><Plus />New brand</button>}
        </div>
        {vm.hasProjects ? (
          <ul className="projects__grid">
            {vm.cards.map((card) => <ProjectCard key={card.id} card={card} />)}
          </ul>
        ) : (
          <div className="projects__empty">
            <span className="t-20px">Start your first brand</span>
            <span className="t-14px c-ink-2">Each brand is saved as you work, so you can come back to it anytime.</span>
            <button className="btn btn--primary btn--icon" type="button" onClick={vm.newProject}><Plus />New brand</button>
          </div>
        )}
      </main>
    </div>
  );
}

function Plus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
