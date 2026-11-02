import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  ["sec-mood", "Moodboard"],
  ["sec-word", "Wordmark"],
  ["sec-palette", "Palette"],
  ["sec-ui", "UI primary"],
  ["sec-type", "Typography"],
  ["sec-refs", "Imagery"],
  ["sec-preview", "UI preview"],
  ["sec-voice", "Voice"],
];
const ROW_HEIGHT = 28;
// A section counts as current once its top passes this line in the viewport.
const READ_LINE = 120;

function readPosition() {
  const tops = SECTIONS.map(([id]) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity);
  const last = SECTIONS.length - 1;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) return last;
  let i = 0;
  tops.forEach((top, k) => {
    if (top <= READ_LINE) i = k;
  });
  if (i === last || tops[0] > READ_LINE) return i;
  return i + (READ_LINE - tops[i]) / (tops[i + 1] - tops[i]);
}

export default function ProgressRail() {
  const [position, setPosition] = useState(0);
  // After a click, hold that section until the person scrolls themselves. The last sections are
  // too short to reach the read line, and a smooth scroll shouldn't flicker through the others.
  const held = useRef(false);

  useEffect(() => {
    const update = () => {
      if (!held.current) setPosition(readPosition());
    };
    const release = () => {
      held.current = false;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    ["wheel", "touchmove", "keydown"].forEach((e) => window.addEventListener(e, release, { passive: true }));
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ["wheel", "touchmove", "keydown"].forEach((e) => window.removeEventListener(e, release));
    };
  }, []);

  const jump = (id, k) => {
    held.current = true;
    setPosition(k);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: still ? "auto" : "smooth" });
  };
  const current = Math.floor(position);

  return (
    <nav className="progress-rail" aria-label="Page sections">
      <span className="progress-rail__track" aria-hidden="true" style={{ height: ROW_HEIGHT * SECTIONS.length }}>
        <span className="progress-rail__fill" style={{ height: ROW_HEIGHT * (position + 0.5) }} />
      </span>
      <ul className="progress-rail__list">
        {SECTIONS.map(([id, label], k) => (
          <li key={id}>
            <button
              type="button"
              className="progress-rail__item"
              style={{ height: ROW_HEIGHT }}
              aria-current={k === current ? "location" : undefined}
              data-passed={k < current || undefined}
              onClick={() => jump(id, k)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
