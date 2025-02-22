import { AutoResizeTextarea } from "@/components/custom-ui/auto-resize-textarea";
import ChatSidebar from "@/components/sidebar/ChatSidebar";

export default function Home() {
  return (
    <div className="w-screen h-screen flex bg-black">
      {/* Left side - 70% width for the ideo player */}
      <div className="w-[70%] flex items-center justify-center bg-black">
        
      </div>

      {/* Right side - Chat interface */}
      <ChatSidebar />
    </div>
  );
}