import { createFal } from '@ai-sdk/fal';

export const fal = createFal({
		apiKey: process.env.NEXT_PUBLIC_FAL_API_KEY, // optional, defaults to FAL_API_KEY environment variable
});