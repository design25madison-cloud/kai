export default function ExportMenu({ menu }) {
  return (
    <div className="menu menu--end export-menu" role="dialog" aria-label="Export">
      {menu.direction && <p className="m-0 t-13px">Exports <strong>{menu.direction}</strong></p>}
      <fieldset className="export-menu__group">
        <legend className="export-menu__legend">
          Sections
          {!menu.locked && <button className="link-btn" type="button" onClick={menu.toggleAll}>{menu.allOn ? "Clear" : "Select all"}</button>}
        </legend>
        {menu.sections.map((x) => (
          <label key={x.id} className="export-menu__option" data-disabled={menu.locked || undefined}>
            <input type="checkbox" checked={x.on} disabled={menu.locked} onChange={x.toggle} />
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
