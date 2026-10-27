"use client";

import { EighthNotes, Pause } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useExperience } from "./Experience";

/** Play/pause for the optional song. Renders nothing unless music is configured. */
export function MusicButton({ tone = "light" }: { tone?: "light" | "night" }) {
  const { music, musicStatus, toggleMusic } = useExperience();
  if (!music) return null;

  const playing = musicStatus === "playing";
  const failed = musicStatus === "error";
  const label = `Music: ${music.title}${music.artist ? ` by ${music.artist}` : ""}`;

  return (
    <Button
      variant={tone === "night" ? "night" : "secondary"}
      size="icon"
      aria-label={label}
      aria-pressed={playing}
      title={failed ? "The song couldn't be played" : label}
      disabled={failed}
      onClick={toggleMusic}
    >
      {playing ? (
        <Pause className="size-4" aria-hidden="true" />
      ) : (
        <EighthNotes className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
