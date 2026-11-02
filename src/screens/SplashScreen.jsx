import { useEffect } from "react";
import KaiLogo from "./KaiLogo.jsx";

const HOLD_MS = 1500;

export default function SplashScreen({ vm }) {
  useEffect(() => {
    const timer = setTimeout(vm.leaveSplash, HOLD_MS);
    return () => clearTimeout(timer);
    // Runs once: the timer shouldn't restart when the app re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button className="splash" type="button" onClick={vm.leaveSplash} aria-label="Continue">
      <KaiLogo size="lg" />
    </button>
  );
}
