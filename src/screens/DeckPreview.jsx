import { DECK_SLIDES, deckTheme } from "../app/deck.js";
import { brokenImage, referenceImage } from "../app/referenceImages.js";

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

const Rect = ({ at, color }) => <span className="slide__shape" style={{ ...box(...at), background: color }} />;
const GuideTitle = ({ t, children }) => <Text at={[M, M, W - 2 * M, 0.7]} face={t.display} size={32} color={t.ink} bold>{children}</Text>;

function Slide({ id, t }) {
  switch (id) {
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
                {img ? <img className="slide__img" src={img.src} alt="" onError={() => brokenImage(img.src)} style={box(x, top, cw, ch)} /> : <Rect at={[x, top, cw, ch]} color={t.surface} />}
                <Text at={[x, top + ch + 0.15, cw, 0.3]} face={t.body} size={12} color={t.ink}>{label}</Text>
              </span>
            );
          })}
        </>
      );
    }
    case "palette": {
      // Equal widths, like the deck: a swatch as narrow as its share of the layout can't hold its label.
      const cw = (W - 2 * M) / t.colors.length;
      return (
        <>
          <GuideTitle t={t}>Palette</GuideTitle>
          {t.colors.map((c, k) => (
            <span key={c.role}>
              <Rect at={[M + k * cw, 1.8, cw, 4.6]} color={c.show} />
              <Text at={[M + k * cw + 0.2, 5.2, cw - 0.3, 1.0]} face={t.body} size={12} color={c.label} valign="bottom">
                <strong>{c.name}</strong><br />{c.role}<br />{c.show.toUpperCase()}
              </Text>
            </span>
          ))}
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


function SlideGroup({ title, slides, t }) {
  return (
    <div className="deck__group">
      <h3 className="deck__group-title">{title}</h3>
      <ol className="deck__grid">
        {slides.map((s) => (
          <li key={s.id} className="deck__item">
            <div className="slide" style={{ background: t.light }} role="img" aria-label={`${s.label} slide`}>
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
      <SlideGroup title="Brand guide" slides={DECK_SLIDES} t={t} />
      <p className="deck__note">The file has 15 slides: 11 sample layouts with placeholder text and your photos, then these four in the same style.</p>
      <p className="deck__note">Fonts: install {t.display}{t.body !== t.display && ` and ${t.body}`} from Google Fonts for PowerPoint, or open the file in Google Slides.</p>
    </section>
  );
}
