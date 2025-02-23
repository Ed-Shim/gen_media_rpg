import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const gemini = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});