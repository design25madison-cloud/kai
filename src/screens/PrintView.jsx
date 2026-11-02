import ImagerySection from "./ImagerySection.jsx";
import Moodboard from "./Moodboard.jsx";
import PaletteSection from "./PaletteSection.jsx";
import TypographySection from "./TypographySection.jsx";
import UiPreviewSection from "./UiPreviewSection.jsx";
import UiPrimarySection from "./UiPrimarySection.jsx";
import VoiceSection from "./VoiceSection.jsx";
import WordmarkSection from "./WordmarkSection.jsx";

// Hidden on screen. The print stylesheet shows this instead of the app, with only the chosen sections.
export default function PrintView({ vm }) {
  const print = { ...vm, presenting: true, cmode: false };
  const on = (id) => vm.printSel.includes(id);
  return (
    <div className="print-view">
      {on("mood") && <Moodboard vm={print} />}
      {on("word") && <WordmarkSection vm={print} />}
      {on("palette") && <PaletteSection vm={print} />}
      {on("ui") && <UiPrimarySection vm={print} />}
      {on("type") && <TypographySection vm={print} />}
      {on("refs") && <ImagerySection vm={print} />}
      {on("preview") && <UiPreviewSection vm={print} />}
      {on("voice") && <VoiceSection vm={print} />}
    </div>
  );
}
