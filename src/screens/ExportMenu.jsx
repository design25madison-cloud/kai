export default function ExportMenu({ menu }) {
  return (
    <div className="menu menu--end export-menu" role="dialog" aria-label="Export">
      <fieldset className="export-menu__group">
        <legend className="export-menu__legend">
          Sections
          <button className="link-btn" type="button" onClick={menu.toggleAll}>{menu.allOn ? "Clear" : "Select all"}</button>
        </legend>
        {menu.sections.map((x) => (
          <label key={x.id} className="export-menu__option">
            <input type="checkbox" checked={x.on} onChange={x.toggle} />
            {x.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="export-menu__group">
        <legend className="export-menu__legend">Format</legend>
        {menu.formats.map((x) => (
          <label key={x.id} className="export-menu__option" data-disabled={x.disabled || undefined}>
            <input type="radio" name="export-format" checked={x.on} disabled={x.disabled} onChange={x.pick} />
            {x.label}
          </label>
        ))}
      </fieldset>
      <button className="btn btn--primary" type="button" disabled={!menu.canRun} onClick={menu.run}>Export</button>
    </div>
  );
}
