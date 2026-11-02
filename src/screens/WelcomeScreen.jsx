import KaiLogo from "./KaiLogo.jsx";

export default function WelcomeScreen({ vm }) {
  const options = [
    { title: "I have some materials to start", sub: "We read your uploads and fill in the rest", pick: vm.chooseMaterials },
    { title: "I want to start from scratch", sub: "We ask you some necessary questions before we generate", pick: vm.chooseScratch },
  ];
  return (
    <div className="welcome">
      <KaiLogo className="page-logo" />
      <h1 className="welcome__title">Lets get started</h1>
      <div className="welcome__options">
        {options.map((o) => (
          <button key={o.title} className="start-option" type="button" onClick={o.pick}>
            <span className="start-option__radio" aria-hidden="true" />
            <span className="start-option__text">
              <span className="start-option__title">{o.title}</span>
              <span className="start-option__sub">{o.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
