"use client";

import { useEffect, useState } from "react";
import { AutoResizeTextarea } from "@/components/custom-ui/auto-resize-textarea";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { useStoryGenerationStore } from "@/lib/state-mgmt/zustand";
import { generateScene } from "@/agents/generateScene";

export default function ChatSidebar() {
    const { messages, addUserMessage, addAssistantMessage, visibleIndex, setVisibleIndex, isLoading, setIsLoading } = useStoryGenerationStore();
    const [message, setMessage] = useState("");

    useEffect(() => {
        const newVisibleIndex = Math.floor(messages.length / 2);
        setVisibleIndex(newVisibleIndex);
    }, [messages, setVisibleIndex]);

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
        const newVisibleIndex = Math.floor((messages.length + 1) / 2) +  1;
        setVisibleIndex(newVisibleIndex);

        // Generate response asynchronously
        generateScene(currentMessage)
            .then(response => {
                console.log(response);
                addAssistantMessage(response.data.output);
            })
            .catch(error => {
            console.error("Error generating response:", error);
            })
            .finally(() => {
            setIsLoading(false);
            });
        }
    };

  return (
    <div className="w-[30%] flex flex-col h-full border-l border-gray-800">
        {/* Conversation display area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Navigation controls - fixed at top */}
          <div className="h-14 flex items-center justify-end gap-2 px-4 border-b border-gray-800">
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

          <div className="flex-1 space-y-3 text-sm">
            {messages
              .filter(msg => msg.role !== 'system')
              .map((message, index) => {
                const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
                const isLastMessage = index === nonSystemMessages.length - 1;
                
                // For visibleIndex 0, only show the first assistant message
                if (visibleIndex === 0) {
                  return index === 0 && message.role === 'assistant' ? (
                    <div key={index} className="text-white">
                      <div className="w-full p-3">{message.content}</div>
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
                      <div className="w-full p-3">{message.content}</div>
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
