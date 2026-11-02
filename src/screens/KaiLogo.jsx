import markLarge from "../assets/kai-mark-large.svg";
import mark from "../assets/kai-mark.svg";

const MARKS = {
  lg: { src: markLarge, width: 54.965, height: 52.239 },
  md: { src: mark, width: 27.483, height: 26.12 },
  sm: { src: mark, width: 18.56, height: 17.64 },
};

export default function KaiLogo({ size = "md", className = "" }) {
  const m = MARKS[size];
  return (
    <span className={`kai-logo kai-logo--${size} ${className}`} role="img" aria-label="KAI">
      <span aria-hidden="true">KAI</span>
      <img src={m.src} width={m.width} height={m.height} alt="" />
    </span>
  );
}
