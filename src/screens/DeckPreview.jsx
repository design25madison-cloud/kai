import { DECK_SLIDES, deckTheme } from "../app/deck.js";
import { referenceImage } from "../app/referenceImages.js";

// Slide geometry matches deck.js: a 13.333 × 7.5in slide, sizes in points on a 960pt width.
const W = 13.333;
const H = 7.5;
const M = 0.75;
const box = (x, y, w, h) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, width: `${(w / W) * 100}%`, height: `${(h / H) * 100}%` });
const pt = (n) => `calc(${n} * var(--slide-pt))`;

function Text({ at, face, size, color, bold, align = "left", valign = "top", track, children }) {
  const justify = { top: "flex-start", middle: "center", bottom: "flex-end" }[valign];
  return (
    <span className="slide__text" style={{ ...box(...at), fontFamily: `'${face}', sans-serif`, fontSize: pt(size), color, fontWeight: bold ? 700 : 400, textAlign: align, justifyContent: justify, letterSpacing: track ? pt(track) : undefined }}>
      {children}
    </span>
  );
}

const Word = ({ t, at, size, color, align }) => <Text at={at} face={t.wordFont} size={size} color={color} align={align} valign="middle" track={t.track}>{t.word}</Text>;
const Rect = ({ at, color }) => <span className="slide__shape" style={{ ...box(...at), background: color }} />;
const Footer = ({ t, n }) => (
  <>
    <Word t={t} at={[M, H - 0.55, 4, 0.3]} size={11} color={t.ink} />
    <Text at={[W - M - 0.5, H - 0.55, 0.5, 0.3]} face={t.body} size={11} color={t.ink} align="right">{n}</Text>
  </>
);
const GuideTitle = ({ t, children }) => <Text at={[M, M, W - 2 * M, 0.7]} face={t.display} size={32} color={t.ink} bold>{children}</Text>;

function Slide({ id, t }) {
  switch (id) {
    case "title":
      return (
        <>
          <Word t={t} at={[M, M, 6, 0.5]} size={20} color={t.onDark} />
          <Text at={[M, 3.2, W - 2 * M, 1.6]} face={t.display} size={54} color={t.onDark} bold valign="bottom">Presentation title</Text>
          <Text at={[M, 5.0, W - 2 * M, 0.6]} face={t.body} size={20} color={t.onDark}>Subtitle</Text>
        </>
      );
    case "section":
      return (
        <>
          <Text at={[M, M, 3, 0.6]} face={t.body} size={20} color={t.onHighlight}>01</Text>
          <Text at={[M, 4.4, W - 2 * M, 2.35]} face={t.display} size={60} color={t.onHighlight} bold valign="bottom">Section title</Text>
        </>
      );
    case "content":
      return (
        <>
          <Text at={[M, M, W - 2 * M, 1.0]} face={t.display} size={36} color={t.ink} bold>Slide title</Text>
          <Text at={[M, 2.1, 7.5, 4.2]} face={t.body} size={20} color={t.ink}>
            <ul className="slide__bullets">
              <li>Key point</li><li>Key point</li><li>Key point</li>
            </ul>
          </Text>
          <Footer t={t} n={3} />
        </>
      );
    case "image":
      return (
        <>
          <Rect at={[0, 0, W / 2, H]} color={t.surface} />
          <Text at={[0, 0, W / 2, H]} face={t.body} size={14} color={t.ink} align="center" valign="middle">Image</Text>
          <Text at={[W / 2 + M, M, W / 2 - 2 * M, 1.6]} face={t.display} size={36} color={t.ink} bold>Slide title</Text>
          <Text at={[W / 2 + M, 2.6, W / 2 - 2 * M, 3.6]} face={t.body} size={18} color={t.ink}>Supporting text</Text>
          <Footer t={t} n={4} />
        </>
      );
    case "statement":
      return (
        <>
          <Rect at={[M, 2.0, 0.9, 0.08]} color={t.accent} />
          <Text at={[M, 2.4, W - 2 * M, 3.2]} face={t.display} size={48} color={t.ink} bold>{t.headline}</Text>
        </>
      );
    case "closing":
      return (
        <>
          <Word t={t} at={[M, 2.6, W - 2 * M, 1.4]} size={72} color={t.onDark} align="center" />
          <Text at={[M, 4.3, W - 2 * M, 0.7]} face={t.display} size={28} color={t.onDark} align="center">Thank you</Text>
          <Text at={[M, 5.1, W - 2 * M, 0.5]} face={t.body} size={16} color={t.onDark} align="center">name@company.com</Text>
        </>
      );
    case "moodboard": {
      const gap = 0.2, top = 1.8, cw = (W - 2 * M - 3 * gap) / 4, ch = 4.2;
      return (
        <>
          <GuideTitle t={t}>Moodboard</GuideTitle>
          {t.imgs.map((label, k) => {
            const x = M + k * (cw + gap);
            const img = referenceImage(label);
            return (
              <span key={k}>
                {img ? <img className="slide__img" src={img.src} alt="" style={box(x, top, cw, ch)} /> : <Rect at={[x, top, cw, ch]} color={t.surface} />}
                <Text at={[x, top + ch + 0.15, cw, 0.3]} face={t.body} size={12} color={t.ink}>{label}</Text>
              </span>
            );
          })}
        </>
      );
    }
    case "palette": {
      const total = t.colors.reduce((n, c) => n + c.ratio, 0);
      let x = M;
      return (
        <>
          <GuideTitle t={t}>Palette</GuideTitle>
          {t.colors.map((c) => {
            const cw = ((W - 2 * M) * c.ratio) / total;
            const at = x;
            x += cw;
            return (
              <span key={c.role}>
                <Rect at={[at, 1.8, cw, 4.6]} color={c.show} />
                <Text at={[at + 0.2, 5.2, cw - 0.3, 1.0]} face={t.body} size={12} color={c.label} valign="bottom">
                  <strong>{c.name}</strong><br />{c.show.toUpperCase()}
                </Text>
              </span>
            );
          })}
        </>
      );
    }
    case "type":
      return (
        <>
          <GuideTitle t={t}>Typography</GuideTitle>
          {[[M, "Headings", t.display, true], [W / 2 + 0.2, "Body", t.body, false]].map(([x, role, face, bold]) => (
            <span key={role}>
              <Text at={[x, 1.9, 5.6, 0.3]} face={t.body} size={12} color={t.ink}>{role}</Text>
              <Text at={[x, 2.3, 5.6, 1.0]} face={face} size={40} color={t.ink} bold={bold}>{face}</Text>
              <Text at={[x, 3.5, 5.6, 1.6]} face={face} size={18} color={t.ink}>ABCDEFGHIJKLM<br />abcdefghijklm<br />0123456789</Text>
            </span>
          ))}
        </>
      );
    case "voice":
      return (
        <>
          <GuideTitle t={t}>Voice</GuideTitle>
          {t.tone.map((tn, k) => (
            <Text key={k} at={[M, 1.9 + k * 0.8, W - 2 * M, 0.6]} face={t.body} size={26} color={t.ink}><span><strong>{tn.yes}</strong>, not {tn.no}</span></Text>
          ))}
          <Text at={[M, 5.2, W - 2 * M, 1.2]} face={t.display} size={28} color={t.accent} bold>{t.headline}</Text>
        </>
      );
    default:
      return null;
  }
}

const BG = { title: "dark", section: "highlight", content: "light", image: "light", statement: "surface", closing: "dark" };

function SlideGroup({ title, slides, t }) {
  return (
    <div className="deck__group">
      <h3 className="deck__group-title">{title}</h3>
      <ol className="deck__grid">
        {slides.map((s) => (
          <li key={s.id} className="deck__item">
            <div className="slide" style={{ background: t[BG[s.id] || "light"] }} role="img" aria-label={`${s.label} slide`}>
              <Slide id={s.id} t={t} />
            </div>
            <span className="deck__label">{s.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function DeckPreview({ vm }) {
  const t = deckTheme(vm.cur, vm.f);
  return (
    <section className="deck" aria-labelledby="deck-h">
      <div className="deck__head">
        <div className="flex col gap-2px">
          <h2 className="deck__title" id="deck-h">Deck template</h2>
          <span className="deck__meta">PowerPoint · opens in Keynote and Google Slides</span>
        </div>
        <button className="btn btn--primary btn--icon" type="button" onClick={vm.exportDeck} disabled={vm.deckBusy}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M4 19h16" /></svg>
          {vm.deckBusy ? "Building…" : "Export .pptx"}
        </button>
      </div>
      <SlideGroup title="Layouts" slides={DECK_SLIDES.filter((s) => s.layout)} t={t} />
      <SlideGroup title="Brand guide" slides={DECK_SLIDES.filter((s) => !s.layout)} t={t} />
      <p className="deck__note">Fonts: install {t.display}{t.body !== t.display && ` and ${t.body}`} from Google Fonts for PowerPoint, or open the file in Google Slides.</p>
    </section>
  );
}
