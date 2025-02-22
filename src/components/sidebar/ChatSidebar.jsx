"use client";

import { useState } from "react";
import { AutoResizeTextarea } from "@/components/custom-ui/auto-resize-textarea";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { useStoryGenerationStore } from "@/lib/state-mgmt/zustand";
export default function ChatSidebar() {
    const { messages, addUserMessage, addAssistantMessage, visibleIndex, setVisibleIndex } = useStoryGenerationStore();
    const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // TODO: Handle message submission
    addUserMessage(message);
    setMessage("");
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
              disabled={visibleIndex === Math.floor((messages.filter(msg => msg.role !== 'system').length - 1) / 2)}
            >
              <HiChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 text-sm">
            {messages
              .filter(msg => msg.role !== 'system') // Filter out system messages first
              .map((message, index) => {
                // Only show the conversation pair at visibleIndex using filtered index
                if (Math.floor(index/2) !== visibleIndex) return null;

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
            className="w-full text-white border-gray-700 focus:border-gray-600 resize-none"
            placeholder="Take an action..."
            rows={4}
          />
        </div>
      </div>
  );
}
