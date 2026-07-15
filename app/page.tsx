import { Jukebox } from "@/components/jukebox";
import { tracks } from "@/lib/tracks";

export default function HomePage() {
  return <Jukebox tracks={tracks} />;
}
