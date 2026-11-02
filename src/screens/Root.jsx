import BriefScreen from "./BriefScreen.jsx";
import GeneratingScreen from "./GeneratingScreen.jsx";
import HandoffScreen from "./HandoffScreen.jsx";
import MeetingScreen from "./MeetingScreen.jsx";
import OutputScreen from "./OutputScreen.jsx";
import PreciseEditingPanel from "./PreciseEditingPanel.jsx";
import PrintView from "./PrintView.jsx";
import SplashScreen from "./SplashScreen.jsx";
import StartScreen from "./StartScreen.jsx";
import Toast from "./Toast.jsx";
import WelcomeScreen from "./WelcomeScreen.jsx";

export default function Root({ vm }) {
  return (
    <div className="ff-Instrument-Sans-system-ui-sans-serif c-ink bg-bg minh-900px">
      <div className="screen">
        {vm.isSplash && <SplashScreen vm={vm} />}
        {vm.isWelcome && <WelcomeScreen vm={vm} />}
        {vm.isStart && <StartScreen vm={vm} />}
        {vm.isBrief && <BriefScreen vm={vm} />}
        {vm.isGen && <GeneratingScreen vm={vm} />}
        {vm.isOut && <OutputScreen vm={vm} />}
        {vm.isOut && <PreciseEditingPanel vm={vm} />}
        {vm.isMeet && <MeetingScreen vm={vm} />}
        {vm.isHandoff && <HandoffScreen vm={vm} />}
        {vm.hasToast && <Toast vm={vm} />}
      </div>
      {vm.showPrint && <PrintView vm={vm} />}
    </div>
  );
}
