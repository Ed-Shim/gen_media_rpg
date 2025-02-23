"use client"
import ChatSidebar from "@/components/sidebar/ChatSidebar";
import Image from "next/image";
import { useStoryGenerationStore, useUIStateStore } from "@/lib/state-mgmt/zustand";
import dynamic from 'next/dynamic';
import { useEffect } from "react";
const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false
});

export default function Home() {
  const { sceneImage, visibleIndex, characterBbox } = useStoryGenerationStore();
  const {setIsTextMode} = useUIStateStore();

  useEffect(() => {
    const updateInitialConversation = async () => {
      const initialCharacter = {
        character_id: "alchemist_01",
        name: "Eldred the Alchemist", 
        description: "An elderly alchemist with a kind face and a gentle demeanor. His silver hair is neatly tucked beneath a wide-brimmed hat adorned with mystical symbols. He wears an intricately embroidered robe in deep purple, its sleeves stained with various alchemical substances. His eyes hold both wisdom and curiosity as he guides visitors through his mysterious craft.",
        emotional_state: "Patient and intrigued",
        player_impression: "Neutral but welcoming",
        is_hostile: false
      };

      try {
        const body = {
          conversation_config: {
            agent: {
              prompt: {
                prompt: `You are roleplaying as ${initialCharacter.name}. Stay in character at all times.

                Your core traits:
                - You are ${initialCharacter.description}
                - Your current emotional state is ${initialCharacter.emotional_state}
                - You view the player with ${initialCharacter.player_impression}
                - You are ${initialCharacter.is_hostile ? 'hostile and distrustful' : 'open and receptive'} in your interactions

                Guidelines for roleplay:
                - Always respond as your character would, based on your traits and current state
                - Show your emotional state and attitude toward the player through your tone and word choice
                - Be creative and detailed in your responses while staying true to your character
                - Never break character or acknowledge that you are an AI (never say you are "programmed" or "told to") Act like human
                - Engage naturally in conversation as your character would
                
                Your goal is to have authentic interactions that reflect who your character is.`
              },
              first_message: "Welcome, friend. How may I be of assistance today?"
            }
          }
        };

        const response = await fetch(
          `https://api.elevenlabs.io/v1/convai/agents/${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}`,
          {
            method: "PATCH",
            headers: {
              "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
            cache: "no-cache"
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update agent: ${response.status}`);
        }

        const data = await response.json();
        console.log('Successfully initialized conversation state:', data);
      } catch (error) {
        console.error('Error initializing conversation:', error);
      }
    };

    console.log("initialize character for the player")
    updateInitialConversation();
  }, [])

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
            {characterBbox && visibleIndex === sceneImage.length - 1 && (
              <div 
                className="absolute hover:outline hover:outline-dotted hover:outline-white opacity-100 hover:bg-white hover:bg-opacity-20 rounded-md cursor-pointer group transition-all duration-150"
                style={{
                  left: `${characterBbox.x * 100}%`,
                  top: `${characterBbox.y * 100}%`, 
                  width: `${characterBbox.width * 100}%`,
                  height: `${characterBbox.height * 100}%`
                }}
                onClick={() => setIsTextMode(false)}
              >
                <p className="text-white text-xs text-center p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">Start Conversation</p>
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
