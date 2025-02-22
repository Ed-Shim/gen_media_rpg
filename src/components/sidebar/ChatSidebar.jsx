"use client";

import { useState } from "react";
import { AutoResizeTextarea } from "@/components/custom-ui/auto-resize-textarea";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { Button } from "@/components/ui/button";

export default function ChatSidebar() {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // TODO: Handle message submission
    setMessage("");
  };

  return (
    <div className="w-[30%] flex flex-col h-full border-l border-gray-800">
        {/* Conversation display area */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {/* Navigation controls - moved to top right */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button variant="ghost" size="icon" className="text-white">
              <HiChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <HiChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Single conversation view */}
            <div className="text-white">
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">User</p>
                <p className="bg-gray-900 rounded-lg p-3">How can I help you today?</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Assistant</p>
                <p className="bg-gray-800 rounded-lg p-3">I'm here to assist you with any questions you may have.</p>
              </div>
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
