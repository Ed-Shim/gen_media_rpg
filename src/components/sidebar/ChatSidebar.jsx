"use client";

import { useEffect, useState, useRef } from "react";
import { AutoResizeTextarea } from "@/components/custom-ui/auto-resize-textarea";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { useStoryGenerationStore } from "@/lib/state-mgmt/zustand";
import { generateNextScene } from "@/agents/generateScene";
import { HiPlay, HiStop } from "react-icons/hi2";

export default function ChatSidebar() { 
    const { messages, addUserMessage, addAssistantMessage, visibleIndex, setVisibleIndex, isLoading, setIsLoading, sceneImage, addSceneImage, setNarrativeAudio, narativeAudio } = useStoryGenerationStore();
    const [message, setMessage] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const newVisibleIndex = Math.floor(messages.length / 2);
        setVisibleIndex(newVisibleIndex);
    }, [messages, setVisibleIndex]);

    const handlePlayback = () => {
        const { narativeAudio } = useStoryGenerationStore.getState();
        if (visibleIndex >= narativeAudio.length) {
            return;
        }

        if (!isPlaying) {
            // Create new audio references for narration and background
            const narrationAudio = new Audio(narativeAudio[visibleIndex].narrate);
            const backgroundAudio = new Audio(narativeAudio[visibleIndex].background);
            
            // Set background volume to 20%
            backgroundAudio.volume = 0.2;
            backgroundAudio.loop = true;

            // Store both audio references
            audioRef.current = {
                narration: narrationAudio,
                background: backgroundAudio
            };
            
            // Play both tracks
            narrationAudio.play();
            backgroundAudio.play();

            // When narration ends, stop background and reset state
            narrationAudio.addEventListener('ended', () => {
                backgroundAudio.pause();
                backgroundAudio.currentTime = 0;
                setIsPlaying(false);
            });
        } else {
            // Stop both audio tracks
            if (audioRef.current) {
                audioRef.current.narration.pause();
                audioRef.current.narration.currentTime = 0;
                audioRef.current.background.pause();
                audioRef.current.background.currentTime = 0;
            }
        }
        
        setIsPlaying(!isPlaying);
    };

    const handleSubmit = async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            
            if (!message.trim()) return;

            // Update UI state immediately
            const currentMessage = message;
            setMessage("");
            addUserMessage(currentMessage);
            setIsLoading(true);

            // Calculate new visible index based on messages length plus one to show the new user message
            const newVisibleIndex = Math.floor((messages.length + 1) / 2) + 1;
            setVisibleIndex(newVisibleIndex);

            try {
                // Call API endpoint
                const response = await fetch('/api/scene', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages,
                        userMessage: currentMessage,
                        lastImageUrl: sceneImage[0]
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to generate scene');
                }

                const data = await response.json();

                // Update story text
                addAssistantMessage(data.story);
                
                // Update audio state  
                setNarrativeAudio(data.audio);
                
                // Update image
                addSceneImage(data.imageUrl);

            } catch (error) {
                console.error("Error generating response:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

  return (
    <div className="w-[30%] flex flex-col h-full border-l border-gray-800">
        {/* Conversation display area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Navigation controls - fixed at top */}
          <div className="h-12 flex-shrink-0 flex items-center justify-between gap-2 px-2 border-b border-gray-800 sticky top-0 bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800 hover:text-white [&_svg]:size-5 [&_svg]:opacity-60"
              onClick={handlePlayback}
              disabled={visibleIndex >= useStoryGenerationStore.getState().narativeAudio.length}
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
                disabled={visibleIndex >= Math.ceil((messages.filter(msg => msg.role !== 'system').length - 1) / 2)}
              >
                <HiChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-1.5 text-sm">
            {messages
              .filter(msg => msg.role !== 'system')
              .map((message, index) => {
                const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
                const isLastMessage = index === nonSystemMessages.length - 1;
                
                // For visibleIndex 0, only show the first assistant message
                if (visibleIndex === 0) {
                  return index === 0 && message.role === 'assistant' ? (
                    <div key={index} className="text-white">
                      <div className="w-full p-3">
                        {message.content}
                      </div>
                    </div>
                  ) : null;
                }

                // For subsequent indices, show user-assistant pairs
                const pairStartIndex = (visibleIndex * 2) - 1; // Start with user message
                if (index !== pairStartIndex && index !== pairStartIndex + 1) return null;

                // If it's the last message and it's a user message, show it alone
                if (isLastMessage && message.role === 'user') {
                  return (
                    <div key={index} className="text-white">
                      <div className="bg-gray-700 p-3 w-full">{message.content}</div>
                      {isLoading && (
                        <div className="text-gray-500 text-sm pl-3 pt-1 animate-pulse">
                          Creating scene...
                        </div>
                      )}
                    </div>
                  );
                }

                // Show user-assistant pairs
                return (
                  <div key={index} className="text-white">
                    {message.role === 'user' && (
                      <div className="bg-gray-700 p-3 w-full">{message.content}</div>
                    )}
                    {message.role === 'assistant' && (  
                        <div className="w-full p-3">  
                          {message.content}
                        </div>
                    )}
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
