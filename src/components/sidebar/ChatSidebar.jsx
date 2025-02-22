"use client";

import { useState } from "react";
import { AutoResizeTextarea } from "@/components/custom-ui/auto-resize-textarea";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { useStoryGenerationStore } from "@/lib/state-mgmt/zustand";
export default function ChatSidebar() {
    const { story, setStory } = useStoryGenerationStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // TODO: Handle message submission
    setMessage("");
  };

  return (
    <div className="w-[30%] flex flex-col h-full border-l border-gray-800">
        {/* Conversation display area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Navigation controls - fixed at top */}
          <div className="h-14 flex items-center justify-end gap-2 px-4 border-b border-gray-800">
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 hover:text-white [&_svg]:size-5">
              <HiChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 hover:text-white [&_svg]:size-5">
              <HiChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 text-sm">
            {/* Single conversation view */}
            <div className="text-white">
                <div className="bg-gray-700 p-3 w-full">How can I help you today?</div>
                <div className="w-full p-3 w-full">I'm here to assist you with any questions you may have.</div>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-800">
          <AutoResizeTextarea
            className="w-full bg-gray-900 text-white border-gray-700 focus:border-gray-600 resize-none"
            placeholder="Take an action..."
            rows={4}
          />
        </div>
      </div>
  );
}
