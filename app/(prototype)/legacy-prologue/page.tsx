import { LegacyProloguePlayer } from "./_components/LegacyProloguePlayer";
import { legacyPrologueScenes } from "./_data/legacyPrologueScenes";

export const metadata = {
  title: "Legacy Question Prologue | The Life Archive",
  robots: {
    index: false,
    follow: false
  }
};

export default function LegacyProloguePage() {
  return <LegacyProloguePlayer scenes={legacyPrologueScenes} />;
}
