import { ElevenLabsClient } from "elevenlabs";

const elevClient = new ElevenLabsClient({ 
    apiKey: process.env.NEXT_PUBLIC_ELEVEN_LAB_KEY
 });

export default elevClient;
