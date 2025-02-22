import { fal } from "@fal-ai/client";

fal.config({
	credentials: process.env.NEXT_PUBLIC_FAL_API_KEY,
});

export const falClient = fal;