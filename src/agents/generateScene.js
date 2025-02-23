import { falClient } from "@/lib/api/fal"

export const generateNextScene = async (messages, userMessage, lastImageUrl = null) => {
            //TODO: update this prompt to dynamic generation
        console.log('Generating story prompt from message history...');
        const prompt = `
            You are an AI storyteller guiding users through an interactive horror story.
            
            Here is the history of our story so far:
            ${messages.map((msg, i) => {
                if (i === 0) {
                    return `Initial Scene: ${msg.content}\n`
                }
                return `${msg.role === 'user' ? 'User Action' : 'Scene'}: ${msg.content}\n`
            }).join('\n')}

            Based on this history and the user's latest input, generate the next scene of the story.
            Make it atmospheric and engaging, building on previous events.
            Describe what happens as a result of the user's action.
            Keep the horror theme but avoid excessive gore or violence.
        `
    console.log('Generating story prompt:', prompt);
    console.log('Generating story response...');
    const storyResponse = await generateScene(prompt, userMessage);
    console.log('Story response:', storyResponse.data.output);
    
    console.log('Generating image prompt from story...');
    const imagePrompt = await generateImagePrompt(storyResponse.data.output);
    console.log('Image prompt:', imagePrompt.data.output);
    
    console.log('Generating scene image...');
    const imageUrl = await generateNextSceneImageUrl(imagePrompt.data.output, lastImageUrl);
    console.log('Generated image URL:', imageUrl);
    
    console.log('Scene generation complete');
    const result = {
        story: storyResponse.data.output,
        imageUrl: imageUrl
    };
    console.log('Returning result:', result);
    return result;
}

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

//Potentially switch to gemini for image reading and description
export const generateImagePrompt = async (sceneDescription) => {
    const response = await falClient.subscribe("fal-ai/any-llm", {
        input: {
            model: "openai/gpt-4o",
            system_prompt: "You are an expert at generating image prompts for a text-to-image model. You will be given a scene description that will describe the story that the image should represent. Generate a detailed prompt including the style, the characters and their states, the mood, and the details of the image.",
            prompt: sceneDescription
        }
    });
    return response;
}

export const generateNextSceneImageUrl = async (prompt, imageUrl = null) => {
    let result;
    if (imageUrl) {
        result = await falClient.subscribe("fal-ai/flux-pro/v1.1-ultra/redux", {
            input: {
            image_url: imageUrl,
            prompt: prompt
            },
            logs: true,
            onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
                update.logs.map((log) => log.message).forEach(console.log);
            }
            },
        });
    }else{
        result = await falClient.subscribe("fal-ai/flux-pro/new", {
            input: {
              prompt,
              aspect_ratio: "16:9",
              image_size: "landscape_4_3",
              num_inference_steps: 10,
            },
            pollInterval: 5000,
            logs: true,
            onQueueUpdate(update) {
              console.log("queue update", update);
            },
        });
    }

    return result.data.images[0].url;
}