import { falClient } from "@/lib/api/fal"

export const generateScene = async (userMessage) => {
    const response = await falClient.subscribe("fal-ai/any-llm", {
        input: {
            model: "openai/gpt-4o",
            system_prompt: `
            You are a helpful AI assistant guiding users through an interactive story.
            `,
            prompt: userMessage
        }
    });
    
    return response;
}