"use client";

import { Player } from "@remotion/player";
import { MyComposition } from "@/remotion/Composition";

const RendererPage = () => {
  return (
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
  );
};

export default RendererPage;
