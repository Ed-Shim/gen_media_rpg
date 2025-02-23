"use client"
import ChatSidebar from "@/components/sidebar/ChatSidebar";
import Image from "next/image";
import { useStoryGenerationStore } from "@/lib/state-mgmt/zustand";

export default function Home() {
  const { sceneImage, visibleIndex } = useStoryGenerationStore();

  return (
    <div className="w-screen h-screen flex bg-black">
      {/* Left side - 70% width for the image display */}
      <div className="w-[70%] flex flex-col items-center justify-center bg-black">
        {sceneImage.length > 0 && visibleIndex < sceneImage.length ? (
          <div className="relative w-full h-full">
            <Image
              src={sceneImage[visibleIndex]}
              alt="Generated scene"
              fill
              style={{objectFit: "contain"}}
              priority
            />
          </div>
        ) : (
          <h1 className="text-white text-4xl font-bold">
            {sceneImage.length === 0 ? "Take your first action" : "Generating next scene..."}
          </h1>
        )}
      </div>

      {/* Right side - Chat interface */}
      <ChatSidebar />
    </div>
  );
}
