import { JukeboxStage } from "@/components/JukeboxStage";
import { MoodProvider } from "@/lib/mood";
import { tracks } from "@/lib/tracks";

export default function HomePage() {
  return (
    <MoodProvider>
      <JukeboxStage tracks={tracks} />
    </MoodProvider>
  );
}
