import ReactPlayer from "react-player";

export default function Home() {
  return (
    <div className="w-screen h-screen flex bg-black">
      <div className="flex flex-1 items-center justify-center">
        <ReactPlayer 
          url="https://www.example.com/video.mp4" 
          width="100%" 
          height="100%" 
          playing
          controls
        />
      </div>
      <div className="flex-1 flex items-end">
        <textarea 
          className="w-full bg-black text-white p-4" 
          placeholder="Type here..."
        />
      </div>
    </div>
  );
}