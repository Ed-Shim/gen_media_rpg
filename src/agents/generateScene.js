import { falClient } from "@/lib/api/fal"

export const generateScene = async (prompt, userMessage) => {
    const response = await falClient.subscribe("fal-ai/any-llm", {
        input: {
            model: "openai/gpt-4o",
            system_prompt: prompt,
            prompt: userMessage
        }
    });
    
    return response;
}