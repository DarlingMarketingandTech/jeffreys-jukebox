import { JukeboxStage } from "@/components/JukeboxStage";
import { tracks } from "@/lib/tracks";

export default function HomePage() {
  return <JukeboxStage tracks={tracks} />;
}
