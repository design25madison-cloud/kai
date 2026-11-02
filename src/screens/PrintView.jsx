import ImagerySection from "./ImagerySection.jsx";
import Moodboard from "./Moodboard.jsx";
import PaletteSection from "./PaletteSection.jsx";
import TypographySection from "./TypographySection.jsx";
import UiPreviewSection from "./UiPreviewSection.jsx";
import UiPrimarySection from "./UiPrimarySection.jsx";
import VoiceSection from "./VoiceSection.jsx";
import WordmarkSection from "./WordmarkSection.jsx";

// Hidden on screen. The print stylesheet shows this instead of the app, so "Save as PDF" gets
// the bento view for decks, then the full breakdown as a reference.
export default function PrintView({ vm }) {
  const print = { ...vm, presenting: true, cmode: false };
  return (
    <div className="print-view">
      <Moodboard vm={print} />
      {vm.printAll && (
        <>
          <WordmarkSection vm={print} />
          <PaletteSection vm={print} />
          <UiPrimarySection vm={print} />
          <TypographySection vm={print} />
          <ImagerySection vm={print} />
          <UiPreviewSection vm={print} />
          <VoiceSection vm={print} />
        </>
      )}
    </div>
  );
}
