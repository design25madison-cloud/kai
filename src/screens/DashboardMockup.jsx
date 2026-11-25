import { mockCopy } from "../app/mockCopy.js";

// Sparkline shapes for the four stats. The third falls: every copy set puts a count that should go down there.
const SPARKS = [[12, 14, 13, 17, 16, 20, 24], [80, 84, 83, 88, 90, 92, 94], [30, 28, 29, 24, 22, 19, 16], [8, 12, 11, 15, 19, 22, 27]];

function Sparkline({ points }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const path = points.map((p, k) => `${(k / (points.length - 1)) * 100},${28 - ((p - min) / (max - min || 1)) * 24}`).join(" ");
  return (
    <svg className="mock-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function DashboardMockup({ vm }) {
  const copy = mockCopy(vm.f.industry).dashboard;
  const best = Math.max(...copy.chart);
  return (
    <div className="mock-app">
      <div className="mock-app__side">
        <span className="mock-wordmark mock-wordmark--sm">{vm.wordUpper}</span>
        <div className="mock-app__nav">
          {copy.nav.map((x, k) => (
            <span key={x} className={k === 0 ? "mock-app__nav-item mock-app__nav-item--on" : "mock-app__nav-item"}>{x}</span>
          ))}
        </div>
        <span className="mock-app__user"><span className="mock-avatar">AK</span>Your workspace</span>
      </div>

      <div className="mock-app__main">
        <header className="mock-app__top">
          <span className="mock-app__title">{copy.title}</span>
          <span className="mock-input">{copy.search}</span>
          <span className="mock-seg">
            {copy.range.map((x, k) => <span key={x} className={k === 1 ? "mock-seg__on" : undefined}>{x}</span>)}
          </span>
          <span className="mock-btn mock-btn--sm">{copy.action}</span>
        </header>

        <div className="mock-kpis">
          {copy.kpis.map(([label, value, delta], k) => (
            <div key={label} className={k === 1 ? "mock-kpi mock-kpi--strong" : "mock-kpi"}>
              <span className="mock-kpi__label">{label}</span>
              <span className="mock-kpi__row">
                <span className="mock-kpi__value">{value}</span>
                <span className="mock-kpi__delta">{delta}</span>
              </span>
              <Sparkline points={SPARKS[k]} />
            </div>
          ))}
        </div>

        <div className="mock-app__row">
          <div className="mock-panel mock-panel--chart">
            <div className="mock-panel__head">
              <span className="mock-panel__title">{copy.chartTitle}</span>
              <span className="mock-legend">
                <span><i style={{ background: "var(--m-primary)" }} />{copy.chartLegend[0]}</span>
                <span><i style={{ background: "var(--m-accent)" }} />{copy.chartLegend[1]}</span>
              </span>
            </div>
            <div className="mock-chart">
              {copy.chart.map((v, k) => (
                <span key={k} className="mock-chart__col">
                  <span className="mock-chart__bar" style={{ height: `${v}%`, background: v === best ? "var(--m-accent)" : "var(--m-primary)" }} />
                  <span className="mock-chart__tick">{copy.months[k]}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="mock-panel">
            <span className="mock-panel__title">{copy.activityTitle}</span>
            <div className="mock-activity">
              {copy.activity.map(([title, note]) => (
                <span key={title} className="mock-activity__item">
                  <span className="mock-activity__title">{title}</span>
                  <span className="mock-activity__note">{note}</span>
                </span>
              ))}
            </div>
            <span className="mock-link mock-link--sm">View all →</span>
          </div>
        </div>

        <div className="mock-panel">
          <span className="mock-panel__title">{copy.tableTitle}</span>
          <div className="mock-table">
            {copy.tableHead.map((x) => <span key={x} className="mock-table__head">{x}</span>)}
            {copy.rows.map(([name, owner, status, progress]) => (
              <div key={name} className="mock-table__row">
                <span>{name}</span>
                <span><span className="mock-avatar">{owner}</span></span>
                <span className="mock-tag">{status}</span>
                <span className="mock-progress"><span style={{ width: `${progress}%` }} /></span>
              </div>
            ))}
          </div>
        </div>

        <div className="mock-toast">{vm.cur.micro}</div>
      </div>
    </div>
  );
}
