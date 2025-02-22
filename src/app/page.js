"use client"
import ChatSidebar from "@/components/sidebar/ChatSidebar";

import { Player } from "@remotion/player";
import { MyComposition } from "@/remotion/Composition";

export default function Home() {
  return (
    <div className="w-screen h-screen flex bg-black">
      {/* Left side - 70% width for the ideo player */}
      <div className="w-[70%] flex items-center justify-center bg-black">
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
      </div>

      {/* Right side - Chat interface */}
      <ChatSidebar />
    </div>
  );
}
