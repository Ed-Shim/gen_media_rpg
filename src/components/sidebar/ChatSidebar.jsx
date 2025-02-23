"use client";

import { useEffect, useState, useRef } from "react";
import { AutoResizeTextarea } from "@/components/custom-ui/auto-resize-textarea";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { useStoryGenerationStore, useUIStateStore, useSceneStateStore } from "@/lib/state-mgmt/zustand";
import { HiPlay, HiStop } from "react-icons/hi2";
import { getBboxPercentages } from "@/lib/utils";

export default function ChatSidebar() {
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    visibleIndex,
    setVisibleIndex,
    isLoading,
    setIsLoading,
    sceneImage,
    addSceneImage,
    setNarrativeAudio,
    setCharacterBbox
  } = useStoryGenerationStore();
  const { isTextMode, setIsTextMode } = useUIStateStore();
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Helper function to create and play audio tracks
  const playAudioTracks = (narrateUrl, backgroundUrl) => {
    const narrationAudio = new Audio(narrateUrl);
    const backgroundAudio = new Audio(backgroundUrl);
    backgroundAudio.volume = 0.3;
    backgroundAudio.loop = true;

    audioRef.current = {
      narration: narrationAudio,
      background: backgroundAudio
    };

    narrationAudio.play();
    backgroundAudio.play();

    narrationAudio.addEventListener("ended", () => {
      backgroundAudio.pause();
      backgroundAudio.currentTime = 0;
      setIsPlaying(false);
    });
    setIsPlaying(true);
  };

  useEffect(() => {
    const newVisibleIndex = Math.floor(messages.length / 2);
    setVisibleIndex(newVisibleIndex);
  }, [messages, setVisibleIndex]);

  const handlePlayback = () => {
    const { narativeAudio } = useStoryGenerationStore.getState();
    if (visibleIndex >= narativeAudio.length) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.narration.pause();
        audioRef.current.narration.currentTime = 0;
        audioRef.current.background.pause();
        audioRef.current.background.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      const { narrate, background } = narativeAudio[visibleIndex];
      playAudioTracks(narrate, background);
    }
  };

  const handleSubmit = async (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();

    if (!message.trim()) return;

    const currentMessage = message;
    setMessage("");
    addUserMessage(currentMessage);
    setIsLoading(true);

    // Update visible index to account for the new message
    const newIndex = Math.floor((messages.length + 1) / 2) + 1;
    setVisibleIndex(newIndex);

    try {
      const sceneState = useSceneStateStore.getState();
      const response = await fetch("/api/scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          userMessage: currentMessage,
          scene: sceneState.scenes.find(scene => scene.scene_id === sceneState.activeSceneId),
          lastImageUrl: sceneImage[sceneImage.length - 1].image,
          sceneTransitions: sceneState.sceneTransitions
        })
      });

      if (!response.ok) throw new Error("Failed to generate scene");

      const data = await response.json();

      // Always update flags for the current scene transition
      const currentSceneId = sceneState.activeSceneId;
      data.updatedFlags.forEach(flag => {
        sceneState.updateSceneTransitionFlags(currentSceneId, flag.flag_id, {
          is_true: flag.is_true
        });
      });

      // Update active scene ID if changed
      if (data.activeSceneId !== currentSceneId) {
        sceneState.setActiveSceneId(data.activeSceneId);
      }

      addAssistantMessage(data.story);
      setNarrativeAudio(data.audio);
      addSceneImage({ image: data.imageUrl, video: data.videoUrl });
      if (data.characters && data.characters.length) {
        const bbox = await getBboxPercentages(data.characters[0], data.imageUrl);
        setCharacterBbox(bbox);
      } else {
        setCharacterBbox(null);
      }

      // Automatically play the new audio tracks
      playAudioTracks(data.audio.narrate, data.audio.background);
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTextMode) {
    return (
      <div className="w-[30%] h-full border-l border-gray-800 flex flex-col justify-end p-4">
        <Button
          variant="outline"
          className="w-full text-white border-gray-800 bg-black hover:bg-black hover:border-gray-600 hover:text-white hover:bg-gray-900"
          onClick={() => setIsTextMode(true)}
        >
          End Conversation
        </Button>
      </div>
    );
  }

  // Prepare filtered messages and related variables
  const filteredMessages = messages.filter((msg) => msg.role !== "system");
  const narrativeLength = useStoryGenerationStore.getState().narativeAudio.length;

  return (
    <div className="w-[30%] flex flex-col h-full border-l border-gray-800">
      {/* Conversation display area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Navigation controls - fixed at top */}
        <div className="h-12 flex-shrink-0 flex items-center justify-between gap-2 px-2 border-b border-gray-800 sticky top-0 bg-black">
          <Button
            variant="ghost"
            size="icon"
            className={`text-white hover:bg-gray-800 hover:text-white [&_svg]:size-5 ${
              visibleIndex >= narrativeLength ? "[&_svg]:opacity-60" : "[&_svg]:opacity-100"
            }`}
            onClick={handlePlayback}
            disabled={visibleIndex >= narrativeLength}
          >
            {isPlaying ? <HiStop className="h-4 w-4" /> : <HiPlay className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800 hover:text-white [&_svg]:size-5"
              onClick={() => setVisibleIndex(visibleIndex - 1)}
              disabled={visibleIndex === 0}
            >
              <HiChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800 hover:text-white [&_svg]:size-5"
              onClick={() => setVisibleIndex(visibleIndex + 1)}
              disabled={visibleIndex >= Math.ceil((filteredMessages.length - 1) / 2)}
            >
              <HiChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-1.5 text-sm">
          {filteredMessages.map((msg, index) => {
            const isLast = index === filteredMessages.length - 1;

            if (visibleIndex === 0) {
              return index === 0 && msg.role === "assistant" ? (
                <div key={index} className="text-white">
                  <div className="w-full p-3">{msg.content}</div>
                </div>
              ) : null;
            }

            const pairStart = visibleIndex * 2 - 1;
            if (index !== pairStart && index !== pairStart + 1) return null;

            if (isLast && msg.role === "user") {
              return (
                <div key={index} className="text-white">
                  <div className="bg-gray-700 p-3 w-full">{msg.content}</div>
                  {isLoading && (
                    <div className="text-gray-500 text-sm pl-3 pt-1 animate-pulse">
                      Creating scene...
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={index} className="text-white">
                {msg.role === "user" && (
                  <div className="bg-gray-700 p-3 w-full">{msg.content}</div>
                )}
                {msg.role === "assistant" && <div className="w-full p-3">{msg.content}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input area */}
      <div className="p-0.5 border-t border-gray-800">
        <AutoResizeTextarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleSubmit}
          className="w-full text-white border-gray-700 focus:border-gray-600 resize-none"
          placeholder="Take an action..."
          rows={4}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
