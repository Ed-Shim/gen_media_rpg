"use client";

import { Player } from "@remotion/player";
import { MyComposition } from "@/remotion/Composition";

export default function Home() {
  return (
    <div className="w-screen h-screen flex bg-black">
      <Player
        component={MyComposition}
        inputProps={{ text: "World" }}
        durationInFrames={120}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        style={{
          width: 1280,
          height: 720,
        }}
        controls
      />
      <div className="flex-1 flex items-end">
        <textarea
          className="w-full bg-black text-white p-4"
          placeholder="Type here..."
        />
      </div>
    </div>
  );
}
