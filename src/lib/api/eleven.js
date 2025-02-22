import { ElevenLabsClient } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.NEXT_PUBLIC_ELEVEN_LAB_KEY, // Defaults to process.env.ELEVENLABS_API_KEY
});
export default elevenlabs;