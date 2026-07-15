import { Jukebox } from "@/components/jukebox";
import { MoodProvider } from "@/lib/mood";
import { tracks } from "@/lib/tracks";

export default function HomePage() {
  return (
    <MoodProvider>
      <Jukebox tracks={tracks} />
    </MoodProvider>
  );
}
