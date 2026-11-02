export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {items.map((item) => (
          <li key={item.label} className="breadcrumbs__item">
            {item.go ? (
              <button className="breadcrumbs__link" type="button" onClick={item.go}>{item.label}</button>
            ) : (
              <span className="breadcrumbs__current" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
