"use client"
import ChatSidebar from "@/components/sidebar/ChatSidebar";
import Image from "next/image";
import { useStoryGenerationStore, useUIStateStore } from "@/lib/state-mgmt/zustand";
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false
});

export default function Home() {
  const { sceneImage, visibleIndex, characterBbox } = useStoryGenerationStore();
  const {setIsTextMode} = useUIStateStore();

  return (
    <div className="w-screen h-screen flex bg-black">
      {/* Left side - 70% width for the image display */}
      <div className="w-[70%] flex flex-col items-center justify-center bg-black">
        {sceneImage.length > 0 && visibleIndex < sceneImage.length ? (
          <div className="relative w-full h-full">
            {visibleIndex === 0 ? (
              <ReactPlayer
                url={sceneImage[visibleIndex].video}
                width="100%"
                height="100%"
                playing={true}
                loop={true}
                muted={true}
                controls={false}
                style={{objectFit: 'contain'}}
              />
            ) : (
              <Image
                key={visibleIndex}
                src={sceneImage[visibleIndex].image}
                alt="Scene"
                fill
                style={{objectFit: 'contain'}}
                priority
              />
            )}
            {characterBbox && (
              <div 
                className="absolute hover:outline hover:outline-dotted hover:outline-white opacity-50 rounded-md cursor-pointer group transition-all duration-150"
                style={{
                  left: `${(characterBbox.x / 1280) * 100}%`, // 1024 is standard width for landscape_4_3
                  top: `${(1 - characterBbox.y / 720 ) * 100}%`, // 768 is standard height for landscape_4_3
                  width: `${(1 - characterBbox.width / 1280) * 100}%`,
                  height: `${(characterBbox.height / 720 - 1) * 100}%`
                }}
                onClick={() => setIsTextMode(false)}
              >
                <p className="text-white text-sm text-center p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">Start Conversation</p>
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-gray-300 text-lg animate-pulse">
            {sceneImage.length === 0 ? "Take your first action" : "Creating scene..."}
          </h1>
        )}
      </div>

      {/* Right side - Chat interface */}
      <ChatSidebar />
    </div>
  );
}
